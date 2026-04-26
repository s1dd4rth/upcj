type RawState = {
  meta?: { step?: string };
  on?: Record<string, string>;
};

type RawLifecycle = {
  object: string;
  initial: string;
  states: Record<string, RawState>;
};

export class Lifecycle {
  readonly object: string;
  readonly initial: string;
  private readonly raw: Record<string, RawState>;

  constructor(spec: RawLifecycle) {
    this.object  = spec.object;
    this.initial = spec.initial;
    this.raw     = spec.states;
  }

  nextState(currentState: string, eventName: string): { target: string; meta: { step?: string } } | null {
    const node = this.raw[currentState];
    if (!node || !node.on) return null;
    const target = node.on[eventName];
    if (!target) return null;
    const meta = this.raw[target]?.meta ?? {};
    return { target, meta };
  }

  states(): string[] {
    return Object.keys(this.raw);
  }

  transitions(): { from: string; event: string; to: string }[] {
    const out: { from: string; event: string; to: string }[] = [];
    for (const [from, node] of Object.entries(this.raw)) {
      for (const [event, to] of Object.entries(node.on ?? {})) {
        out.push({ from, event, to });
      }
    }
    return out;
  }
}
