import { getScenario } from "../scenarios";

export type PlaybackMode = "manual" | "auto";

export interface PlaybackState {
  scenarioId: string;
  cursor: number;          // 0..steps.length — number of events applied so far
  mode: PlaybackMode;
  speed: number;           // multiplier for auto-advance interval
}

export type PlaybackAction =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "JUMP"; cursor: number }
  | { type: "LOAD_SCENARIO"; scenarioId: string; cursor?: number }
  | { type: "SET_MODE"; mode: PlaybackMode }
  | { type: "SET_SPEED"; speed: number };

const clamp = (n: number, max: number): number => Math.max(0, Math.min(n, max));

export function initialPlayback(scenarioId: string): PlaybackState {
  return { scenarioId, cursor: 0, mode: "manual", speed: 1 };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  const max = getScenario(state.scenarioId).steps.length;
  switch (action.type) {
    case "NEXT":
      return { ...state, cursor: clamp(state.cursor + 1, max) };
    case "BACK":
      return { ...state, cursor: clamp(state.cursor - 1, max) };
    case "JUMP":
      return { ...state, cursor: clamp(action.cursor, max) };
    case "LOAD_SCENARIO": {
      const newMax = getScenario(action.scenarioId).steps.length;
      return {
        ...state,
        scenarioId: action.scenarioId,
        cursor: clamp(action.cursor ?? 0, newMax),
      };
    }
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_SPEED":
      return { ...state, speed: action.speed };
  }
}
