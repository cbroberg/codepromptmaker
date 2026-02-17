export type PromptLanguage = 'en' | 'da';

export const SUPPORTED_LANGUAGES: Record<PromptLanguage, string> = {
  en: 'English',
  da: 'Danish',
};

export const DEFAULT_LANGUAGE: PromptLanguage = 'en';
