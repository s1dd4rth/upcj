import { MobileTabs } from "./MobileTabs";
import { useIsWide } from "../../hooks/useIsWide";
import styles from "./shell.module.css";
import { useState } from "react";

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
  /** Content for the left rail column in the cockpit (wide) layout. */
  cockpitRailLeft?: React.ReactNode;
  /**
   * Margin callouts for the design lens at wide viewports.
   * Rendered inside the right rail when the cockpit layout is active.
   * At narrow viewports AppShell ignores this prop; the mobile lens takes over.
   */
  marginCallouts?: React.ReactNode;
  activeTab?: ShellTab;
  onTabChange?: (tab: ShellTab) => void;
}

export function AppShell({
  mode,
  header,
  tabs,
  engineTrace,
  cockpitRailLeft,
  marginCallouts,
  activeTab: controlledTab,
  onTabChange,
}: AppShellProps): React.ReactElement {
  const [internalTab, setInternalTab] = useState<ShellTab>("status");
  const isWide = useIsWide();

  const isControlled = controlledTab !== undefined;
  const activeTab = isControlled ? controlledTab : internalTab;

  function handleTabChange(tab: ShellTab) {
    if (!isControlled) {
      setInternalTab(tab);
    }
    onTabChange?.(tab);
  }

  if (isWide) {
    return (
      <div className={styles.shell} data-mode={mode} data-layout="cockpit">
        {header}
        <main className={styles.mainCockpit}>
          <div
            className={styles.cockpitRailLeft}
            data-cockpit-rail-left
          >
            {cockpitRailLeft}
          </div>
          <div className={styles.cockpitCenter} data-cockpit-center>
            {tabs.status}
            {engineTrace && (
              <details className={styles.engineTrace}>
                <summary>What just changed?</summary>
                <div>{engineTrace}</div>
              </details>
            )}
          </div>
          <div className={styles.cockpitRailRight} data-cockpit-rail-right>
            {marginCallouts && <div data-cockpit-margin-callouts>{marginCallouts}</div>}
            <div>{tabs.activity}</div>
            <div>{tabs.docs}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.shell} data-mode={mode} data-layout="mobile">
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
