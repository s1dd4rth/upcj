import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUi from "./en/ui.json";
import enScenarios from "./en/scenarios.json";
import enOwners from "./en/owners.json";
import enLens from "./en/lens.json";
import enActivity from "./en/activity.json";
import enDesign from "./en/design.json";

import hiUi from "./hi/ui.json";
import hiScenarios from "./hi/scenarios.json";
import hiOwners from "./hi/owners.json";
import hiActivity from "./hi/activity.json";
import hiLens from "./hi/lens.json";
import hiDesign from "./hi/design.json";

const en = {
  ...enUi,
  ...enScenarios,
  ...enOwners,
  ...enLens,
  ...enActivity,
  ...enDesign,
};

const hi = {
  ...hiUi,
  ...hiScenarios,
  ...hiOwners,
  ...hiActivity,
  ...hiLens,
  ...hiDesign,
};

// Read persisted language preference; default to "en"
// Guard against environments where localStorage exists but is not fully functional
// (e.g. some jsdom workers during test setup)
function _readSavedLang(): string {
  try {
    return (typeof localStorage !== "undefined" && localStorage.getItem("upcj.lang")) || "en";
  } catch {
    return "en";
  }
}
const startLang: "en" | "hi" = _readSavedLang() === "hi" ? "hi" : "en";

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: startLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

// Reflect initial language on <html lang> so assistive tech and CSS :lang() are correct
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("lang", startLang);
}

export { i18n };
export default i18n;
