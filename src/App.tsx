import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { seedApplications } from "./data/seed";
import { STAGES } from "./constants";
import { computeMatch } from "./utils/keywordMatch";
import { loadApplications, saveApplications } from "./utils/storage";
import { nextStage, previousStage } from "./utils/stage";
import { exportApplicationsToCsv, importApplicationsFromCsv } from "./utils/csv";
import { buildDemoScenario, demoScenarioLabels, demoScenarioNotes } from "./data/demoScenarios";
import type { JobApplication, Priority, Stage } from "./types";

type SortKey = "updated" | "priority" | "score";

const emptyDraft: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> = {
  company: "",
  role: "",
  stage: "Saved",
  priority: "Medium",
  jobDescription: "",
  resumeText: "",
  followUpDate: "",
  notes: "",
};

function priorityRank(priority: Priority): number {
  if (priority === "High") return 3;
  if (priority === "Medium") return 2;
  return 1;
}

function getMatchScore(app: JobApplication): number {
  return computeMatch(app.jobDescription, app.resumeText).score;
}

export default function App() {
  const [applications, setApplications] = useState<JobApplication[]>(() => loadApplications() ?? seedApplications);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "All">("All");
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [statusNote, setStatusNote] = useState<string>("");
  const [demoMode, setDemoMode] = useState(false);
  const [demoBackup, setDemoBackup] = useState<JobApplication[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.stage !== "Saved").length;
    const interviewing = applications.filter((a) => a.stage === "Interview").length;
    const offers = applications.filter((a) => a.stage === "Offer").length;
    const avgScore =
      total === 0 ? 0 : Math.round(applications.reduce((sum, app) => sum + getMatchScore(app), 0) / total);
    return { total, applied, interviewing, offers, avgScore };
  }, [applications]);

  const visibleApplications = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const filtered = applications.filter((app) => {
      const matchesQuery =
        normalized === "" ||
        app.company.toLowerCase().includes(normalized) ||
        app.role.toLowerCase().includes(normalized);
      const matchesStage = stageFilter === "All" || app.stage === stageFilter;
      return matchesQuery && matchesStage;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === "priority") {
        return priorityRank(b.priority) - priorityRank(a.priority);
      }
      return getMatchScore(b) - getMatchScore(a);
    });
  }, [applications, query, stageFilter, sortBy]);

  const grouped = useMemo(() => {
    const map: Record<Stage, JobApplication[]> = {
      Saved: [],
      Applied: [],
      Interview: [],
      Offer: [],
      Rejected: [],
    };
    for (const app of visibleApplications) {
      map[app.stage].push(app);
    }
    return map;
  }, [visibleApplications]);

  function resetForm(): void {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function submitForm(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!draft.company.trim() || !draft.role.trim()) return;

    const now = new Date().toISOString();

    if (editingId) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingId
            ? { ...app, ...draft, company: draft.company.trim(), role: draft.role.trim(), updatedAt: now }
            : app
        )
      );
    } else {
      const next: JobApplication = {
        id: crypto.randomUUID(),
        ...draft,
        company: draft.company.trim(),
        role: draft.role.trim(),
        createdAt: now,
        updatedAt: now,
      };
      setApplications((prev) => [next, ...prev]);
    }

    resetForm();
  }

  function beginEdit(app: JobApplication): void {
    setEditingId(app.id);
    setDraft({
      company: app.company,
      role: app.role,
      stage: app.stage,
      priority: app.priority,
      jobDescription: app.jobDescription,
      resumeText: app.resumeText,
      followUpDate: app.followUpDate,
      notes: app.notes,
    });
  }

  function updateStage(id: string, stage: Stage): void {
    const now = new Date().toISOString();
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, stage, updatedAt: now } : app)));
  }

  function removeApplication(id: string): void {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    if (editingId === id) resetForm();
  }

  function onCardDragStart(event: DragEvent<HTMLElement>, id: string): void {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }

  function onColumnDragOver(event: DragEvent<HTMLElement>, stage: Stage): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  }

  function onColumnDrop(event: DragEvent<HTMLElement>, stage: Stage): void {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || draggingId;
    if (id) {
      updateStage(id, stage);
      setStatusNote(`Moved application to ${stage}.`);
    }
    setDraggingId(null);
    setDragOverStage(null);
  }

  function exportCsv(): void {
    const csv = exportApplicationsToCsv(applications);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatusNote("CSV exported successfully.");
  }

  function importCsv(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    void file.text().then((text) => {
      const drafts = importApplicationsFromCsv(text);
      if (drafts.length === 0) {
        setStatusNote("CSV import found no valid rows.");
        event.target.value = "";
        return;
      }

      const now = new Date().toISOString();
      const importedApps: JobApplication[] = drafts.map((draft) => ({
        ...draft,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }));

      setApplications((prev) => [...importedApps, ...prev]);
      setStatusNote(`Imported ${importedApps.length} application${importedApps.length === 1 ? "" : "s"} from CSV.`);
      event.target.value = "";
    }).catch(() => {
      setStatusNote("CSV import failed. Please check file format.");
      event.target.value = "";
    });
  }

  function setScenario(key: keyof typeof demoScenarioLabels): void {
    setApplications(buildDemoScenario(key));
    setQuery("");
    setStageFilter("All");
    setSortBy(key === "ats" ? "score" : "updated");
    setStatusNote(demoScenarioNotes[key]);
  }

  function toggleDemoMode(): void {
    if (!demoMode && demoBackup === null) {
      setDemoBackup(applications);
      setStatusNote("Recruiter demo mode enabled. Your current data is backed up.");
    }
    setDemoMode((prev) => !prev);
  }

  function restoreBackup(): void {
    if (!demoBackup) {
      setStatusNote("No backup found yet. Enable demo mode first.");
      return;
    }
    setApplications(demoBackup);
    setStatusNote("Your original data has been restored.");
  }

  function ensureDemoModeOn(): void {
    if (!demoMode) {
      setDemoBackup((prev) => prev ?? applications);
      setDemoMode(true);
      setStatusNote("Demo mode enabled.");
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Career Workflow Studio</p>
        <h1>Job Application Tracker + Resume Match</h1>
        <p className="sub">
          Keep your application pipeline focused, tailor resumes faster, and track follow-ups in one clean workspace.
        </p>
        <div className="hero-tags">
          <span>React</span>
          <span>TypeScript</span>
          <span>ATS Match</span>
          <span>Kanban Workflow</span>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card"><span>Total Apps</span><strong>{stats.total}</strong></article>
        <article className="stat-card"><span>Submitted</span><strong>{stats.applied}</strong></article>
        <article className="stat-card"><span>Interviews</span><strong>{stats.interviewing}</strong></article>
        <article className="stat-card"><span>Offers</span><strong>{stats.offers}</strong></article>
        <article className="stat-card"><span>Avg Match</span><strong>{stats.avgScore}%</strong></article>
      </section>

      <section className="toolbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or role"
        />
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as Stage | "All")}>
          <option value="All">All stages</option>
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
          <option value="updated">Sort: Recently Updated</option>
          <option value="priority">Sort: Priority</option>
          <option value="score">Sort: Match Score</option>
        </select>
      </section>

      <section className="utility-bar">
        <button type="button" className="ghost" onClick={exportCsv}>Export CSV</button>
        <button type="button" className="ghost" onClick={() => fileInputRef.current?.click()}>Import CSV</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={importCsv}
          className="hidden-input"
        />
        <label className="demo-toggle">
          <input type="checkbox" checked={demoMode} onChange={toggleDemoMode} />
          Demo Mode
        </label>
      </section>

      {demoMode ? (
        <section className="demo-panel">
          <h3>Quick Demo Presets</h3>
          <div className="demo-actions">
            <button type="button" className="ghost" onClick={() => setScenario("snapshot")}>{demoScenarioLabels.snapshot}</button>
            <button type="button" className="ghost" onClick={() => setScenario("ats")}>{demoScenarioLabels.ats}</button>
            <button type="button" className="ghost" onClick={() => setScenario("pipeline")}>{demoScenarioLabels.pipeline}</button>
            <button type="button" className="ghost" onClick={restoreBackup}>Restore Original Data</button>
          </div>
        </section>
      ) : null}

      {statusNote ? <p className="status-note">{statusNote}</p> : null}

      <section className="demo-script-panel">
        <h3>60-Second Demo Script</h3>
        <ol>
          <li>
            Turn on demo mode.
            <button type="button" className="ghost small" onClick={ensureDemoModeOn}>Enable Demo Mode</button>
          </li>
          <li>
            Load the ATS walkthrough dataset.
            <button
              type="button"
              className="ghost small"
              onClick={() => {
                ensureDemoModeOn();
                setScenario("ats");
              }}
            >
              Load ATS Demo Data
            </button>
          </li>
          <li>
            Sort applications by match score.
            <button type="button" className="ghost small" onClick={() => setSortBy("score")}>Sort by Match</button>
          </li>
          <li>Drag one low-score card between columns to show stage movement.</li>
          <li>
            Export CSV to show import/export capability.
            <button type="button" className="ghost small" onClick={exportCsv}>Export CSV</button>
          </li>
        </ol>
      </section>

      <section className="layout">
        <aside className="form-panel">
          <h2>{editingId ? "Edit Application" : "Add Application"}</h2>
          <form onSubmit={submitForm} className="form">
            <label>Company<input value={draft.company} onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} required /></label>
            <label>Role<input value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} required /></label>
            <label>Stage
              <select value={draft.stage} onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value as Stage }))}>
                {STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </label>
            <label>Priority
              <select value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as Priority }))}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </label>
            <label>Job Description
              <textarea rows={4} value={draft.jobDescription} onChange={(e) => setDraft((d) => ({ ...d, jobDescription: e.target.value }))} />
            </label>
            <label>Resume Text
              <textarea rows={4} value={draft.resumeText} onChange={(e) => setDraft((d) => ({ ...d, resumeText: e.target.value }))} />
            </label>
            <label>Follow-up Date
              <input type="date" value={draft.followUpDate} onChange={(e) => setDraft((d) => ({ ...d, followUpDate: e.target.value }))} />
            </label>
            <label>Notes
              <textarea rows={3} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
            </label>
            <div className="actions">
              <button type="submit">{editingId ? "Save Changes" : "Add Application"}</button>
              {editingId ? <button type="button" className="ghost" onClick={resetForm}>Cancel</button> : null}
            </div>
          </form>
        </aside>

        <div className="board">
          {STAGES.map((stage) => (
            <section key={stage} className="column">
              <header className="column-header">
                <h3>{stage}</h3>
                <span>{grouped[stage].length}</span>
              </header>
              <div
                className={`column-body ${dragOverStage === stage ? "drop-target" : ""}`}
                onDragOver={(event) => onColumnDragOver(event, stage)}
                onDragEnter={(event) => onColumnDragOver(event, stage)}
                onDrop={(event) => onColumnDrop(event, stage)}
                onDragLeave={() => setDragOverStage((prev) => (prev === stage ? null : prev))}
              >
                {grouped[stage].map((app) => {
                  const match = computeMatch(app.jobDescription, app.resumeText);
                  return (
                    <article
                      key={app.id}
                      className={`card ${draggingId === app.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={(event) => onCardDragStart(event, app.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverStage(null);
                      }}
                    >
                      <div className="card-top">
                        <div>
                          <h4>{app.company}</h4>
                          <p>{app.role}</p>
                        </div>
                        <span className={`badge ${app.priority.toLowerCase()}`}>{app.priority}</span>
                      </div>

                      <div className="match-row">
                        <span>ATS Match</span>
                        <strong>{match.score}%</strong>
                      </div>

                      {match.missingKeywords.length > 0 ? (
                        <p className="missing">Missing: {match.missingKeywords.slice(0, 4).join(", ")}</p>
                      ) : (
                        <p className="good">Strong keyword coverage</p>
                      )}

                      {app.followUpDate ? <p className="meta">Follow-up: {app.followUpDate}</p> : null}

                      <div className="card-actions">
                        <button type="button" className="small ghost" onClick={() => updateStage(app.id, previousStage(app.stage))}>Back</button>
                        <button type="button" className="small" onClick={() => updateStage(app.id, nextStage(app.stage))}>Forward</button>
                        <button type="button" className="small ghost" onClick={() => beginEdit(app)}>Edit</button>
                        <button type="button" className="small danger" onClick={() => removeApplication(app.id)}>Delete</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
