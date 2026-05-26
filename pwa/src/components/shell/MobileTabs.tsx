import { useTranslation } from "react-i18next";
import type { ShellTab } from "./AppShell";
import styles from "./shell.module.css";

export interface MobileTabsProps {
  activeTab: ShellTab;
  onChange: (tab: ShellTab) => void;
}

const TABS: ShellTab[] = ["status", "activity", "docs"];

export function MobileTabs({ activeTab, onChange }: MobileTabsProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <nav className={styles.bottomNav} aria-label={t("ui.tabs.status")}>
      {TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            className={styles.tabBtn}
            data-active={isActive ? "true" : undefined}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab)}
          >
            {t(`ui.tabs.${tab}`)}
          </button>
        );
      })}
    </nav>
  );
}
