import type { JobApplication } from "../types";

const now = new Date().toISOString();

export const seedApplications: JobApplication[] = [
  {
    id: "a1",
    company: "Northwind Labs",
    role: "Frontend Engineer",
    stage: "Applied",
    priority: "High",
    jobDescription:
      "React TypeScript testing accessibility CI/CD API integration performance optimization",
    resumeText:
      "Built React TypeScript dashboards with accessibility fixes and API integration. Added unit tests and improved performance.",
    followUpDate: "",
    notes: "Great fit. Follow up in 5 days.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "a2",
    company: "Blue Harbor",
    role: "UI Engineer",
    stage: "Interview",
    priority: "Medium",
    jobDescription:
      "Design systems reusable components storybook performance collaboration",
    resumeText:
      "Created reusable components and collaborated with product and design. Improved rendering performance.",
    followUpDate: "",
    notes: "Interview round 2 scheduled.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "a3",
    company: "Atlas Cloud",
    role: "React Developer",
    stage: "Saved",
    priority: "High",
    jobDescription:
      "React hooks TypeScript GraphQL testing docker teamwork",
    resumeText:
      "React hooks and TypeScript experience, API work, CI pipelines.",
    followUpDate: "",
    notes: "Need to tailor resume before applying.",
    createdAt: now,
    updatedAt: now,
  },
];
