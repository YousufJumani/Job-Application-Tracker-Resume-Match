import { STAGES } from "../constants";
import type { JobApplication, Priority, Stage } from "../types";

const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

const HEADERS = [
  "company",
  "role",
  "stage",
  "priority",
  "jobDescription",
  "resumeText",
  "followUpDate",
  "notes",
] as const;

function escapeField(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];
    const next = row[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function normalizeStage(raw: string): Stage {
  const match = STAGES.find((stage) => stage.toLowerCase() === raw.trim().toLowerCase());
  return match ?? "Saved";
}

function normalizePriority(raw: string): Priority {
  const match = PRIORITIES.find((priority) => priority.toLowerCase() === raw.trim().toLowerCase());
  return match ?? "Medium";
}

export type CsvImportDraft = Omit<JobApplication, "id" | "createdAt" | "updatedAt">;

export function exportApplicationsToCsv(applications: JobApplication[]): string {
  const lines = [HEADERS.join(",")];

  for (const app of applications) {
    lines.push(
      [
        app.company,
        app.role,
        app.stage,
        app.priority,
        app.jobDescription,
        app.resumeText,
        app.followUpDate,
        app.notes,
      ]
        .map((value) => escapeField(value ?? ""))
        .join(",")
    );
  }

  return `${lines.join("\n")}\n`;
}

export function importApplicationsFromCsv(csvText: string): CsvImportDraft[] {
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const [headerLine, ...rows] = lines;
  const headers = parseCsvRow(headerLine).map((h) => h.trim());
  const indexMap = new Map<string, number>();

  headers.forEach((header, idx) => indexMap.set(header, idx));

  const getValue = (values: string[], key: string): string => {
    const idx = indexMap.get(key);
    if (idx === undefined || idx >= values.length) return "";
    return values[idx].trim();
  };

  const drafts: CsvImportDraft[] = [];

  for (const row of rows) {
    const values = parseCsvRow(row);
    const company = getValue(values, "company");
    const role = getValue(values, "role");
    if (!company && !role) continue;

    drafts.push({
      company,
      role,
      stage: normalizeStage(getValue(values, "stage")),
      priority: normalizePriority(getValue(values, "priority")),
      jobDescription: getValue(values, "jobDescription"),
      resumeText: getValue(values, "resumeText"),
      followUpDate: getValue(values, "followUpDate"),
      notes: getValue(values, "notes"),
    });
  }

  return drafts;
}
