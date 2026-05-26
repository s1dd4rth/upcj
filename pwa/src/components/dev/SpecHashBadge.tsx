import { adapter } from "../../engine-adapter";

/**
 * Renders the engine spec hash truncated to 12 chars; full hash on hover.
 */
export function SpecHashBadge(): React.ReactElement {
  const fullHash = adapter.specHash();
  return (
    <span
      data-spec-hash
      title={fullHash}
      style={{
        fontFamily: "monospace",
        fontSize: "var(--t-xs)",
        color: "var(--ink-muted)",
        background: "var(--bg)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--s-1)",
        padding: "0.1em 0.4em",
        cursor: "default",
      }}
    >
      {fullHash.slice(0, 12)}…
    </span>
  );
}
