import { useState } from "react";
import { MobileTabs } from "./MobileTabs";
import styles from "./shell.module.css";

export type ShellMode = "product" | "demo" | "dev";
export type ShellTab = "status" | "activity" | "docs";

export interface AppShellProps {
  mode: ShellMode;
  header: React.ReactNode;
  tabs: {
    status: React.ReactNode;
    activity: React.ReactNode;
    docs: React.ReactNode;
  };
  engineTrace?: React.ReactNode;
  activeTab?: ShellTab;
  onTabChange?: (tab: ShellTab) => void;
}

export function AppShell({
  mode,
  header,
  tabs,
  engineTrace,
  activeTab: controlledTab,
  onTabChange,
}: AppShellProps): React.ReactElement {
  const [internalTab, setInternalTab] = useState<ShellTab>("status");

  const isControlled = controlledTab !== undefined;
  const activeTab = isControlled ? controlledTab : internalTab;

  function handleTabChange(tab: ShellTab) {
    if (!isControlled) {
      setInternalTab(tab);
    }
    onTabChange?.(tab);
  }

  return (
    <div className={styles.shell} data-mode={mode}>
      {header}
      <main className={styles.main}>
        {activeTab === "status" && (
          <>
            {tabs.status}
            {engineTrace && (
              <details className={styles.engineTrace}>
                <summary>What just changed?</summary>
                <div>{engineTrace}</div>
              </details>
            )}
          </>
        )}
        {activeTab === "activity" && tabs.activity}
        {activeTab === "docs" && tabs.docs}
      </main>
      <MobileTabs activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}
