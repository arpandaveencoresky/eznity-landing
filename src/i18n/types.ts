import 'react-i18next';
import enTranslations from './resources/en/translations.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslations;
    };
  }
}

