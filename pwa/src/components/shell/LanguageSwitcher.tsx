import { useTranslation } from "react-i18next";
import styles from "./shell.module.css";

export function LanguageSwitcher(): React.ReactElement {
  const { i18n, t } = useTranslation();

  const change = (lng: "en" | "hi") => {
    void i18n.changeLanguage(lng);
    try {
      localStorage.setItem("upcj.lang", lng);
    } catch {
      // Ignore if localStorage is not available (e.g. private browsing restrictions)
    }
    document.documentElement.setAttribute("lang", lng);
  };

  return (
    <div
      className={styles.languageSwitcher}
      data-language-switcher
      role="group"
      aria-label={t("ui.languageSwitcher.label")}
    >
      <button
        type="button"
        className={styles.langBtn}
        data-lang="en"
        aria-pressed={i18n.language === "en"}
        onClick={() => change("en")}
      >
        {/* Always shown in English script regardless of active language */}
        {t("ui.languageSwitcher.en", { lng: "en" })}
      </button>
      <button
        type="button"
        className={styles.langBtn}
        data-lang="hi"
        aria-pressed={i18n.language === "hi"}
        onClick={() => change("hi")}
      >
        {/* Always shown in Devanagari script regardless of active language */}
        {t("ui.languageSwitcher.hi", { lng: "hi" })}
      </button>
    </div>
  );
}
