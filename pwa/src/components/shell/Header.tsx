import { useTranslation } from "react-i18next";
import type { ShellMode } from "./AppShell";
import styles from "./shell.module.css";

export interface HeaderProps {
  mode: ShellMode;
  statusLabel: string;
  mostUrgentSlaPhrase?: string;
  scenarioTitle?: string;
  onOpenScenarioPicker?: () => void;
  lensEnabled?: boolean;
  onToggleLens?: () => void;
  languageSwitcher?: React.ReactNode;
}

export function Header({
  mode,
  statusLabel,
  mostUrgentSlaPhrase,
  scenarioTitle,
  onOpenScenarioPicker,
  lensEnabled,
  onToggleLens,
  languageSwitcher,
}: HeaderProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <header className={styles.headerBand} data-shell-header>
      <span className={styles.appName}>{t("ui.header.appName")}</span>
      <span className={styles.statusPill}>{statusLabel}</span>
      {mostUrgentSlaPhrase && (
        <span className={styles.slaPhrase}>{mostUrgentSlaPhrase}</span>
      )}

      {/* Render language switcher in all modes — in demo/dev it sits after the status pill */}
      {languageSwitcher}

      {(mode === "demo" || mode === "dev") && (
        <div className={styles.demoChromeRow} data-demo-chrome>
          {scenarioTitle && (
            <button
              className={styles.scenarioBtn}
              onClick={onOpenScenarioPicker}
              aria-label={scenarioTitle}
            >
              {scenarioTitle}
            </button>
          )}
          {mode === "demo" && (
            <button
              className={styles.lensBtn}
              data-active={lensEnabled ? "true" : "false"}
              onClick={onToggleLens}
            >
              {lensEnabled ? t("ui.header.lensOn") : t("ui.header.lensOff")}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
