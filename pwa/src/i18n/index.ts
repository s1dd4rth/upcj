import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUi from "./en/ui.json";
import enScenarios from "./en/scenarios.json";
import enOwners from "./en/owners.json";
import enLens from "./en/lens.json";
import enActivity from "./en/activity.json";

const en = {
  ...enUi,
  ...enScenarios,
  ...enOwners,
  ...enLens,
  ...enActivity,
};

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export { i18n };
export default i18n;
