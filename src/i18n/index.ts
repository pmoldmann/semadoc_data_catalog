import en from './en.json';

const translations = { en } as const;

export type Locale = 'en';
export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en'];

export function t(locale: Locale): typeof en {
  return translations[locale] ?? translations[defaultLocale];
}

export function getLocalizedPath(locale: Locale, path: string): string {
  const cleanPath = path.replace(/^\/(en)/, '').replace(/^\//, '');
  return `/${locale}${cleanPath ? `/${cleanPath}` : ''}`;
}

export function getLocaleFromUrl(url: URL): Locale {
  return defaultLocale;
}
