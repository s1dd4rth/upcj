import { useTranslation } from "react-i18next";
import type { EngineTraceVM } from "../../state/selectors";

export interface EngineTraceProps {
  vm: EngineTraceVM | null;
  expanded?: boolean;
}

export function EngineTrace({ vm, expanded }: EngineTraceProps): React.ReactElement | null {
  const { t } = useTranslation();

  if (vm === null) return null;

  const payloadJson = JSON.stringify(vm.eventApplied.payload, null, 2);

  return (
    <details
      data-engine-trace
      open={!!expanded}
      className="engine-trace"
    >
      <summary className="engine-trace-summary">
        {t("ui.engineTrace.summary")}
      </summary>

      <div className="engine-trace-body">
        <p>
          <strong>{t("ui.engineTrace.eventApplied")}: </strong>
          <code>{vm.eventApplied.name}</code>
        </p>
        <pre className="engine-trace-payload">{payloadJson}</pre>

        <p>
          {t("ui.engineTrace.statusTransition", {
            before: vm.statusBefore,
            after: vm.statusAfter,
          })}
        </p>

        <p>
          {t("ui.engineTrace.newInteractionId", { id: vm.newInteractionId })}
        </p>
      </div>
    </details>
  );
}
