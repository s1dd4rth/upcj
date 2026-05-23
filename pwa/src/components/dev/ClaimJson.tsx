import type { Claim } from "../../engine-adapter";

export interface ClaimJsonProps {
  claim: Claim;
}

/**
 * Collapsible pretty-print of the current claim JSON.
 * Collapsed by default.
 */
export function ClaimJson({ claim }: ClaimJsonProps): React.ReactElement {
  return (
    <details
      data-claim-json
      style={{ marginTop: "var(--s-3)" }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontSize: "var(--t-xs)",
          color: "var(--ink-muted)",
          userSelect: "none",
        }}
      >
        Claim JSON
      </summary>
      <pre
        style={{
          fontSize: "var(--t-xs)",
          overflowX: "auto",
          background: "var(--bg)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--s-2)",
          padding: "var(--s-3)",
          marginTop: "var(--s-2)",
          lineHeight: 1.5,
        }}
      >
        {JSON.stringify(claim, null, 2)}
      </pre>
    </details>
  );
}
