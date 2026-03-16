import { STAGES } from "../constants";
import type { Stage } from "../types";

export function nextStage(stage: Stage): Stage {
  const index = STAGES.indexOf(stage);
  if (index < 0 || index === STAGES.length - 1) return stage;
  return STAGES[index + 1];
}

export function previousStage(stage: Stage): Stage {
  const index = STAGES.indexOf(stage);
  if (index <= 0) return stage;
  return STAGES[index - 1];
}
