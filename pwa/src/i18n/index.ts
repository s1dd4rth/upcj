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

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export { i18n };
export default i18n;
