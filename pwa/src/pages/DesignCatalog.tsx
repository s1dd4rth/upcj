import { useTranslation } from "react-i18next";
import { ANNOTATIONS } from "../components/lens/annotations";
import type { Annotation } from "../components/lens/annotations";
import { SCENARIOS, DEFAULT_SCENARIO_ID, getScenario } from "../scenarios";
import { selectClaimAt } from "../state/selectors";

// ---------------------------------------------------------------------------
// Deep-link helper
// ---------------------------------------------------------------------------

function deepLinkFor(annotation: Annotation): string {
  if (annotation.key.step) {
    return `#/demo?scenario=${annotation.key.step.scenarioId}&step=${annotation.key.step.cursor}&lens=on`;
  }
  if (annotation.key.state) {
    // find the earliest cursor in DEFAULT_SCENARIO_ID where the claim status === key.state
    const scenario = getScenario(DEFAULT_SCENARIO_ID);
    let firstCursor: number | undefined;
    for (let c = 0; c <= scenario.steps.length; c++) {
      try {
        const claim = selectClaimAt(scenario, c);
        if (claim.status === annotation.key.state) {
          firstCursor = c;
          break;
        }
      } catch { /* ignore */ }
    }
    if (firstCursor !== undefined) {
      return `#/demo?scenario=${scenario.id}&step=${firstCursor}&lens=on`;
    }
    // state not reached by the default scenario; search the other scenarios
    for (const s of SCENARIOS) {
      for (let c = 0; c <= s.steps.length; c++) {
        try {
          const claim = selectClaimAt(s, c);
          if (claim.status === annotation.key.state) {
            return `#/demo?scenario=${s.id}&step=${c}&lens=on`;
          }
        } catch { /* ignore */ }
      }
    }
  }
  if (annotation.key.elementId) {
    // pick a sensible default: cashless-planned-happy at cursor 4
    return `#/demo?scenario=cashless-planned-happy&step=4&lens=on`;
  }
  return `#/demo?lens=on`;
}

// ---------------------------------------------------------------------------
// Heuristic number list (1..10)
// ---------------------------------------------------------------------------

const HEURISTIC_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// ---------------------------------------------------------------------------
// AnnotationItem
// ---------------------------------------------------------------------------

interface AnnotationItemProps {
  annotation: Annotation;
  seeInDemoLabel: string;
}

function AnnotationItem({ annotation, seeInDemoLabel }: AnnotationItemProps) {
  const { t } = useTranslation();
  const link = deepLinkFor(annotation);
  return (
    <li style={{ marginBottom: "0.5rem" }}>
      <span>{t(annotation.textKey)}</span>
      {" — "}
      <a href={link} style={{ color: "var(--color-accent, #0066cc)" }}>
        {seeInDemoLabel} →
      </a>
    </li>
  );
}

// ---------------------------------------------------------------------------
// DesignCatalog
// ---------------------------------------------------------------------------

export default function DesignCatalog() {
  const { t } = useTranslation();

  const errorPreventionAnnotations = ANNOTATIONS.filter(
    (a) => a.principle === "error-prevention"
  );
  const clarityAnnotations = ANNOTATIONS.filter(
    (a) => a.principle === "clarity"
  );
  const systemDesignAnnotations = ANNOTATIONS.filter(
    (a) => a.principle === "system-design"
  );
  const dataModelingAnnotations = ANNOTATIONS.filter(
    (a) => a.principle === "data-modeling"
  );

  const seeInDemo = t("design.seeInDemo");

  return (
    <main
      style={{
        maxWidth: "56rem",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
        lineHeight: 1.6,
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section data-design-section="hero" style={{ marginBottom: "3rem" }}>
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          {t("design.title")}
        </h1>
        <p style={{ marginBottom: "1.25rem", color: "var(--color-text-secondary, #555)" }}>
          {t("design.intro")}
        </p>
        <a
          href="#/demo?lens=on"
          style={{
            display: "inline-block",
            padding: "0.5rem 1.25rem",
            background: "var(--color-accent, #0066cc)",
            color: "#fff",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {t("design.showDemo")}
        </a>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Error prevention                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section data-design-section="error-prevention" style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          {t("design.sections.error-prevention.heading")}
        </h2>
        <p style={{ marginBottom: "1rem", color: "var(--color-text-secondary, #555)" }}>
          {t("design.sections.error-prevention.intro")}
        </p>
        {errorPreventionAnnotations.length > 0 && (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {errorPreventionAnnotations.map((a) => (
              <AnnotationItem key={a.id} annotation={a} seeInDemoLabel={seeInDemo} />
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Clarity & plain language                                            */}
      {/* ------------------------------------------------------------------ */}
      <section data-design-section="clarity" style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          {t("design.sections.clarity.heading")}
        </h2>
        <p style={{ marginBottom: "1rem", color: "var(--color-text-secondary, #555)" }}>
          {t("design.sections.clarity.intro")}
        </p>
        {clarityAnnotations.length > 0 && (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {clarityAnnotations.map((a) => (
              <AnnotationItem key={a.id} annotation={a} seeInDemoLabel={seeInDemo} />
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The 10 Nielsen heuristics                                           */}
      {/* ------------------------------------------------------------------ */}
      <section data-design-section="heuristics" style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {t("design.sections.heuristics.heading")}
        </h2>
        <p style={{ marginBottom: "1.5rem", color: "var(--color-text-secondary, #555)" }}>
          {t("design.sections.heuristics.intro")}
        </p>
        {HEURISTIC_NUMBERS.map((n) => {
          const heuristicAnnotations = ANNOTATIONS.filter(
            (a) => a.principle === `heuristic-${n}`
          );
          return (
            <div key={n} style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                {n}: {t(`design.heuristics.${n}.name`)}
              </h3>
              <p
                style={{
                  marginBottom: "0.75rem",
                  color: "var(--color-text-secondary, #555)",
                  borderLeft: "3px solid var(--color-border, #ddd)",
                  paddingLeft: "0.75rem",
                }}
              >
                {t(`design.heuristics.${n}.honors`)}
              </p>
              {heuristicAnnotations.length > 0 && (
                <ul style={{ paddingLeft: "1.25rem" }}>
                  {heuristicAnnotations.map((a) => (
                    <AnnotationItem key={a.id} annotation={a} seeInDemoLabel={seeInDemo} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* System-design choices                                               */}
      {/* ------------------------------------------------------------------ */}
      <section data-design-section="system-design" style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          {t("design.sections.system-design.heading")}
        </h2>
        <p style={{ marginBottom: "1rem", color: "var(--color-text-secondary, #555)" }}>
          {t("design.sections.system-design.intro")}
        </p>
        {systemDesignAnnotations.length > 0 && (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {systemDesignAnnotations.map((a) => (
              <AnnotationItem key={a.id} annotation={a} seeInDemoLabel={seeInDemo} />
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Data-modeling decisions                                             */}
      {/* ------------------------------------------------------------------ */}
      <section data-design-section="data-modeling" style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          {t("design.sections.data-modeling.heading")}
        </h2>
        <p style={{ marginBottom: "1rem", color: "var(--color-text-secondary, #555)" }}>
          {t("design.sections.data-modeling.intro")}
        </p>
        {dataModelingAnnotations.length > 0 && (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {dataModelingAnnotations.map((a) => (
              <AnnotationItem key={a.id} annotation={a} seeInDemoLabel={seeInDemo} />
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Try it                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section data-design-section="tryIt" style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          {t("design.sections.tryIt.heading")}
        </h2>
        <p style={{ marginBottom: "1rem", color: "var(--color-text-secondary, #555)" }}>
          {t("design.sections.tryIt.intro")}
        </p>
        <ul style={{ paddingLeft: "1.25rem" }}>
          {SCENARIOS.map((s) => (
            <li key={s.id} style={{ marginBottom: "0.5rem" }}>
              <a
                href={`#/demo?scenario=${s.id}&lens=on`}
                style={{ color: "var(--color-accent, #0066cc)" }}
              >
                {t(s.titleKey)}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
