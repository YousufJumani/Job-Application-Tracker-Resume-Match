import type { JobApplication } from "../types";

type Draft = Omit<JobApplication, "id" | "createdAt" | "updatedAt">;

function nowIso(): string {
  return new Date().toISOString();
}

function toApps(drafts: Draft[]): JobApplication[] {
  const now = nowIso();
  return drafts.map((draft) => ({
    ...draft,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }));
}

export const demoScenarioLabels = {
  snapshot: "Load Portfolio Snapshot",
  ats: "Walkthrough: ATS Improvement",
  pipeline: "Walkthrough: Pipeline Momentum",
} as const;

export const demoScenarioNotes = {
  snapshot: "Balanced baseline dataset for a full dashboard overview.",
  ats: "Shows one low-score application and one improved tailored version for ATS discussion.",
  pipeline: "Shows movement from saved to offer stages for workflow and conversion storytelling.",
} as const;

export function buildDemoScenario(key: keyof typeof demoScenarioLabels): JobApplication[] {
  if (key === "ats") {
    return toApps([
      {
        company: "Pixel Forge",
        role: "Frontend Engineer",
        stage: "Saved",
        priority: "High",
        jobDescription: "React TypeScript accessibility testing performance CI/CD api integration",
        resumeText: "Built user interfaces and collaborated with team.",
        followUpDate: "",
        notes: "Before tailoring: low keyword coverage.",
      },
      {
        company: "Pixel Forge",
        role: "Frontend Engineer (Tailored)",
        stage: "Applied",
        priority: "High",
        jobDescription: "React TypeScript accessibility testing performance CI/CD api integration",
        resumeText:
          "Built React + TypeScript dashboards with API integration, accessibility fixes, CI/CD checks, and performance optimization. Added unit testing for reusable components.",
        followUpDate: "",
        notes: "After tailoring: strong keyword coverage.",
      },
      {
        company: "Northwind Labs",
        role: "UI Developer",
        stage: "Interview",
        priority: "Medium",
        jobDescription: "design system components accessibility collaboration",
        resumeText: "Created reusable components and accessibility improvements with design partners.",
        followUpDate: "",
        notes: "Good steady application.",
      },
    ]);
  }

  if (key === "pipeline") {
    return toApps([
      {
        company: "Bright River",
        role: "Frontend Intern",
        stage: "Saved",
        priority: "Medium",
        jobDescription: "react javascript teamwork",
        resumeText: "React and JavaScript projects.",
        followUpDate: "",
        notes: "To apply this week.",
      },
      {
        company: "Cloud Atlas",
        role: "React Engineer",
        stage: "Applied",
        priority: "High",
        jobDescription: "react typescript testing api",
        resumeText: "React TypeScript testing API integration experience.",
        followUpDate: "",
        notes: "Waiting for response.",
      },
      {
        company: "Orion Data",
        role: "Frontend Engineer",
        stage: "Interview",
        priority: "High",
        jobDescription: "typescript react accessibility",
        resumeText: "Built accessible TypeScript React apps.",
        followUpDate: "",
        notes: "Round 2 done.",
      },
      {
        company: "Zenith Labs",
        role: "Software Engineer",
        stage: "Offer",
        priority: "High",
        jobDescription: "react graphql performance",
        resumeText: "React + GraphQL and performance optimization.",
        followUpDate: "",
        notes: "Offer received.",
      },
    ]);
  }

  return toApps([
    {
      company: "Northwind Labs",
      role: "Frontend Engineer",
      stage: "Applied",
      priority: "High",
      jobDescription: "React TypeScript testing accessibility CI/CD API integration performance optimization",
      resumeText:
        "Built React TypeScript dashboards with accessibility fixes and API integration. Added unit tests and improved performance.",
      followUpDate: "",
      notes: "Great fit. Follow up in 5 days.",
    },
    {
      company: "Blue Harbor",
      role: "UI Engineer",
      stage: "Interview",
      priority: "Medium",
      jobDescription: "Design systems reusable components storybook performance collaboration",
      resumeText:
        "Created reusable components and collaborated with product and design. Improved rendering performance.",
      followUpDate: "",
      notes: "Interview round 2 scheduled.",
    },
    {
      company: "Atlas Cloud",
      role: "React Developer",
      stage: "Saved",
      priority: "High",
      jobDescription: "React hooks TypeScript GraphQL testing docker teamwork",
      resumeText: "React hooks and TypeScript experience, API work, CI pipelines.",
      followUpDate: "",
      notes: "Need to tailor resume before applying.",
    },
  ]);
}
