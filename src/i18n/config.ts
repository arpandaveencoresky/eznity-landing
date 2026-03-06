import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './resources/en/translations.json';

const resources = {
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for better UX
    },
  });

export default i18n;

