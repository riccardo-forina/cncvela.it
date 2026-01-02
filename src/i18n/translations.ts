// Centralized translations for the CNC Vela website
// Supported locales: it (default), en, de

export const locales = ['it', 'en', 'de'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'it';

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
  de: 'Deutsch',
};

export const translations = {
  // ===== NAVIGATION =====
  nav: {
    home: { it: 'Home', en: 'Home', de: 'Home' },
    club: { it: 'Il Circolo', en: 'The Club', de: 'Der Verein' },
    courses: { it: 'Corsi', en: 'Courses', de: 'Kurse' },
    regattas: { it: 'Regate', en: 'Regattas', de: 'Regatten' },
    events: { it: 'Bacheca', en: 'Events', de: 'Termine' },
    gallery: { it: 'Galleria', en: 'Gallery', de: 'Galerie' },
    weather: { it: 'Meteo', en: 'Weather', de: 'Wetter' },
  },

  // ===== HOMEPAGE HERO =====
  hero: {
    title: {
      it: 'Vivi la Vela\nsul Lago Maggiore',
      en: 'Experience Sailing\non Lake Maggiore',
      de: 'Erlebe Segeln\nam Lago Maggiore',
    },
    subtitle: {
      it: 'Associazione Sportiva dal 1965 · Passione per la vela',
      en: 'Sports Association since 1965 · Passion for sailing',
      de: 'Sportverein seit 1965 · Leidenschaft für Segeln',
    },
    cta: {
      it: 'Unisciti a Noi',
      en: 'Join Us',
      de: 'Werde Mitglied',
    },
  },

  // ===== STATS BAR =====
  stats: {
    years: { it: 'Anni di storia', en: 'Years of history', de: 'Jahre Geschichte' },
    fiv: { it: 'Affiliati dal 1975', en: 'FIV affiliated since 1975', de: 'FIV-Mitglied seit 1975' },
    ages: { it: 'Soci di ogni età', en: 'Members of all ages', de: 'Mitglieder jeden Alters' },
    beach: { it: 'Spiaggia in concessione', en: 'Private beach', de: 'Privatstrand' },
  },

  // ===== HOMEPAGE SECTIONS =====
  sections: {
    courses: {
      title: { it: 'Corsi per i Soci', en: 'Courses for Members', de: 'Kurse für Mitglieder' },
      subtitle: {
        it: 'Scuola Vela riconosciuta FIV. Tre tipologie di corso per tutte le esigenze.',
        en: 'FIV certified Sailing School. Three course types for all needs.',
        de: 'FIV-zertifizierte Segelschule. Drei Kurstypen für alle Bedürfnisse.',
      },
      viewAll: { it: 'Tutti i Corsi', en: 'All Courses', de: 'Alle Kurse' },
    },
    events: {
      title: { it: 'Prossimi Eventi', en: 'Upcoming Events', de: 'Kommende Events' },
      viewAll: { it: 'Vedi Tutti', en: 'View All', de: 'Alle ansehen' },
      noEvents: {
        it: 'Nessun evento in programma',
        en: 'No upcoming events',
        de: 'Keine kommenden Events',
      },
    },
    location: {
      title: { it: 'Dove Siamo', en: 'Where We Are', de: 'Wo wir sind' },
      description: {
        it: 'Il Circolo Nautico Caldè si trova nella splendida baia di Caldè, frazione di Castelveccana, sulla sponda lombarda del Lago Maggiore. Una location unica, protetta dai venti e ideale per imparare a navigare.',
        en: 'Circolo Nautico Caldè is located in the beautiful bay of Caldè, a hamlet of Castelveccana, on the Lombard shore of Lake Maggiore. A unique location, sheltered from winds and ideal for learning to sail.',
        de: 'Der Circolo Nautico Caldè befindet sich in der wunderschönen Bucht von Caldè, einem Ortsteil von Castelveccana, am lombardischen Ufer des Lago Maggiore. Ein einzigartiger Ort, windgeschützt und ideal zum Segelnlernen.',
      },
      address: { it: 'Indirizzo', en: 'Address', de: 'Adresse' },
      phone: { it: 'Telefono', en: 'Phone', de: 'Telefon' },
      email: { it: 'Email', en: 'Email', de: 'E-Mail' },
    },
    cta: {
      title: { it: 'Unisciti a Noi', en: 'Join Us', de: 'Werde Mitglied' },
      description: {
        it: 'Entra a far parte della nostra comunità velica. La baia di Caldè ti aspetta.',
        en: 'Become part of our sailing community. The bay of Caldè awaits you.',
        de: 'Werde Teil unserer Segelgemeinschaft. Die Bucht von Caldè erwartet dich.',
      },
      becomeMember: { it: 'Diventa Socio', en: 'Become a Member', de: 'Mitglied werden' },
      writeUs: { it: 'Scrivici', en: 'Write Us', de: 'Schreib uns' },
    },
  },

  // ===== COURSES =====
  courses: {
    pageTitle: { it: 'Corsi di Vela', en: 'Sailing Courses', de: 'Segelkurse' },
    pageSubtitle: {
      it: 'Scuola Vela riconosciuta FIV dal 1975',
      en: 'FIV certified Sailing School since 1975',
      de: 'FIV-zertifizierte Segelschule seit 1975',
    },
    membersOnly: {
      it: 'I corsi di vela sono riservati ai soci del Circolo Nautico Caldè.',
      en: 'Sailing courses are reserved for members of Circolo Nautico Caldè.',
      de: 'Segelkurse sind Mitgliedern des Circolo Nautico Caldè vorbehalten.',
    },
    upcomingCourses: { it: 'Prossimi Corsi', en: 'Upcoming Courses', de: 'Kommende Kurse' },
    noCourses: {
      it: 'Non ci sono corsi programmati al momento.',
      en: 'No courses scheduled at this time.',
      de: 'Derzeit sind keine Kurse geplant.',
    },
    pricing: { it: 'Tariffe Corsi', en: 'Course Pricing', de: 'Kurspreise' },
    registration: { it: 'Iscrizione', en: 'Registration', de: 'Anmeldung' },
    downloadForm: { it: 'Scarica Modulo', en: 'Download Form', de: 'Formular herunterladen' },
    becomeMember: { it: 'Diventa Socio', en: 'Become a Member', de: 'Mitglied werden' },
    deriveWeekly: {
      title: { it: 'Derive Settimanale', en: 'Dinghy Weekly', de: 'Jolle Wochenkurs' },
      subtitle: { it: 'Corso intensivo', en: 'Intensive course', de: 'Intensivkurs' },
    },
    deriveWeekend: {
      title: { it: 'Derive Weekend', en: 'Dinghy Weekend', de: 'Jolle Wochenende' },
      subtitle: { it: 'Corso nei weekend', en: 'Weekend course', de: 'Wochenendkurs' },
    },
    keelboat: {
      title: { it: 'Cabinati', en: 'Keelboat', de: 'Kielboot' },
      subtitle: { it: 'Corso su cabinato', en: 'Keelboat course', de: 'Kielbootkurs' },
    },
    ageRange: { it: 'Età', en: 'Age', de: 'Alter' },
    duration: { it: 'Durata', en: 'Duration', de: 'Dauer' },
  },

  // ===== CLUB PAGE =====
  club: {
    pageTitle: { it: 'Il Circolo', en: 'The Club', de: 'Der Verein' },
    whoWeAre: { it: 'Chi Siamo', en: 'Who We Are', de: 'Wer wir sind' },
    facilities: { it: 'Le Nostre Strutture', en: 'Our Facilities', de: 'Unsere Einrichtungen' },
    board: { it: 'Consiglio Direttivo', en: 'Board of Directors', de: 'Vorstand' },
    documents: { it: 'Documenti', en: 'Documents', de: 'Dokumente' },
    becomeMember: { it: 'Diventa Socio', en: 'Become a Member', de: 'Mitglied werden' },
    memberBenefits: { it: 'Vantaggi Soci', en: 'Member Benefits', de: 'Mitgliedervorteile' },
    pricing: { it: 'Quote Associative', en: 'Membership Fees', de: 'Mitgliedsbeiträge' },
    contact: { it: 'Contatti', en: 'Contact', de: 'Kontakt' },
  },

  // ===== REGATTAS =====
  regattas: {
    pageTitle: { it: 'Calendario Regate', en: 'Regatta Calendar', de: 'Regattakalender' },
    upcoming: { it: 'Prossime Regate', en: 'Upcoming Regattas', de: 'Kommende Regatten' },
    past: { it: 'Regate Passate', en: 'Past Regattas', de: 'Vergangene Regatten' },
    results: { it: 'Classifiche', en: 'Results', de: 'Ergebnisse' },
    documents: { it: 'Documenti', en: 'Documents', de: 'Dokumente' },
    notice: { it: 'Bando', en: 'Notice', de: 'Ausschreibung' },
    instructions: { it: 'Istruzioni', en: 'Instructions', de: 'Anweisungen' },
  },

  // ===== EVENTS/BACHECA =====
  events: {
    pageTitle: { it: 'Bacheca Eventi', en: 'Events Board', de: 'Veranstaltungen' },
    all: { it: 'Tutti', en: 'All', de: 'Alle' },
    regattas: { it: 'Regate', en: 'Regattas', de: 'Regatten' },
    courses: { it: 'Corsi', en: 'Courses', de: 'Kurse' },
    social: { it: 'Eventi Sociali', en: 'Social Events', de: 'Gesellschaftliche Events' },
    date: { it: 'Data', en: 'Date', de: 'Datum' },
    time: { it: 'Orario', en: 'Time', de: 'Uhrzeit' },
    status: {
      open: { it: 'Aperto', en: 'Open', de: 'Offen' },
      closed: { it: 'Chiuso', en: 'Closed', de: 'Geschlossen' },
      completed: { it: 'Completato', en: 'Completed', de: 'Abgeschlossen' },
    },
  },

  // ===== GALLERY =====
  gallery: {
    pageTitle: { it: 'Galleria', en: 'Gallery', de: 'Galerie' },
    atmosphere: { it: 'Atmosfera', en: 'Atmosphere', de: 'Atmosphäre' },
    school: { it: 'Scuola Vela', en: 'Sailing School', de: 'Segelschule' },
    regattas: { it: 'Regate', en: 'Regattas', de: 'Regatten' },
  },

  // ===== WEATHER =====
  weather: {
    pageTitle: { it: 'Meteo Caldè', en: 'Caldè Weather', de: 'Wetter Caldè' },
    currentConditions: { it: 'Condizioni Attuali', en: 'Current Conditions', de: 'Aktuelle Bedingungen' },
    forecast: { it: 'Previsioni', en: 'Forecast', de: 'Vorhersage' },
    wind: { it: 'Vento', en: 'Wind', de: 'Wind' },
    temperature: { it: 'Temperatura', en: 'Temperature', de: 'Temperatur' },
    humidity: { it: 'Umidità', en: 'Humidity', de: 'Luftfeuchtigkeit' },
    pressure: { it: 'Pressione', en: 'Pressure', de: 'Druck' },
    legend: { it: 'Legenda', en: 'Legend', de: 'Legende' },
    excellent: { it: 'Eccellente', en: 'Excellent', de: 'Ausgezeichnet' },
    good: { it: 'Buono', en: 'Good', de: 'Gut' },
    fair: { it: 'Discreto', en: 'Fair', de: 'Mäßig' },
    poor: { it: 'Scadente', en: 'Poor', de: 'Schlecht' },
  },

  // ===== FOOTER =====
  footer: {
    rights: { it: 'Tutti i diritti riservati', en: 'All rights reserved', de: 'Alle Rechte vorbehalten' },
    privacy: { it: 'Privacy Policy', en: 'Privacy Policy', de: 'Datenschutz' },
    cookies: { it: 'Cookie Policy', en: 'Cookie Policy', de: 'Cookie-Richtlinie' },
    contact: { it: 'Contatti', en: 'Contact', de: 'Kontakt' },
    usefulLinks: { it: 'Link Utili', en: 'Useful Links', de: 'Nützliche Links' },
    courseRegistration: { it: 'Iscrizione Corsi', en: 'Course Registration', de: 'Kursanmeldung' },
    documents: { it: 'Documenti', en: 'Documents', de: 'Dokumente' },
    howToReach: { it: 'Come Raggiungerci', en: 'How to Reach Us', de: 'Anfahrt' },
    followFacebook: { it: 'Seguici su Facebook', en: 'Follow us on Facebook', de: 'Folge uns auf Facebook' },
    followInstagram: { it: 'Seguici su Instagram', en: 'Follow us on Instagram', de: 'Folge uns auf Instagram' },
    description: { 
      it: 'Associazione Sportiva Dilettantistica dal 1965.', 
      en: 'Amateur Sports Association since 1965.', 
      de: 'Amateursportverein seit 1965.' 
    },
    safeguarding: { it: 'Safeguarding', en: 'Safeguarding', de: 'Kinderschutz' },
    safeguardingDesc: { 
      it: 'Tutela minori e prevenzione violenza', 
      en: 'Child protection and violence prevention', 
      de: 'Kinderschutz und Gewaltprävention' 
    },
    responsible: { it: 'Resp.', en: 'Officer:', de: 'Verantw.:' },
  },

  // ===== COMMON =====
  common: {
    learnMore: { it: 'Scopri di più', en: 'Learn more', de: 'Mehr erfahren' },
    viewDetails: { it: 'Vedi dettagli', en: 'View details', de: 'Details ansehen' },
    download: { it: 'Scarica', en: 'Download', de: 'Herunterladen' },
    share: { it: 'Condividi', en: 'Share', de: 'Teilen' },
    close: { it: 'Chiudi', en: 'Close', de: 'Schließen' },
    loading: { it: 'Caricamento...', en: 'Loading...', de: 'Laden...' },
    error: { it: 'Errore', en: 'Error', de: 'Fehler' },
    clickToLoad: { it: 'Clicca per caricare', en: 'Click to load', de: 'Klicken zum Laden' },
    mapClickToLoad: { 
      it: 'Clicca per caricare la mappa', 
      en: 'Click to load the map', 
      de: 'Klicken um die Karte zu laden' 
    },
  },

  // ===== COOKIE CONSENT =====
  cookies: {
    title: { it: 'Utilizziamo i cookie', en: 'We use cookies', de: 'Wir verwenden Cookies' },
    description: {
      it: 'Questo sito utilizza cookie tecnici necessari al funzionamento e cookie analitici per comprendere come viene utilizzato il sito.',
      en: 'This site uses technical cookies necessary for operation and analytical cookies to understand how the site is used.',
      de: 'Diese Website verwendet technische Cookies, die für den Betrieb erforderlich sind, und analytische Cookies, um zu verstehen, wie die Website genutzt wird.',
    },
    acceptAll: { it: 'Accetta tutti', en: 'Accept all', de: 'Alle akzeptieren' },
    acceptNecessary: { it: 'Solo necessari', en: 'Only necessary', de: 'Nur notwendige' },
    managePreferences: { it: 'Gestisci preferenze', en: 'Manage preferences', de: 'Einstellungen verwalten' },
  },

  // ===== 404 PAGE =====
  notFound: {
    pageTitle: { it: '404 - Pagina non trovata', en: '404 - Page not found', de: '404 - Seite nicht gefunden' },
    code: { it: '404', en: '404', de: '404' },
    title: { it: 'Fuori Rotta', en: 'Off Course', de: 'Vom Kurs Abgekommen' },
    description: {
      it: 'Sembra che tu abbia virato troppo presto.<br/>Questa pagina è finita sugli scogli o non è mai esistita.',
      en: 'Looks like you tacked too early.<br/>This page has run aground or never existed.',
      de: 'Es scheint, dass du zu früh gewendet hast.<br/>Diese Seite ist auf Grund gelaufen oder hat nie existiert.',
    },
    backHome: { it: 'Torna in Porto', en: 'Back to Harbor', de: 'Zurück zum Hafen' },
  },
} as const;

// Helper function to get translation
export function t(key: string, locale: Locale): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  if (value && typeof value === 'object' && locale in value) {
    return value[locale];
  }
  
  console.warn(`Translation not found for locale ${locale}: ${key}`);
  return key;
}

// Helper to get locale from URL (handles base path like /cncvela.it/)
export function getLocaleFromUrl(url: URL): Locale {
  // Remove base path if present
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  let pathname = url.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || '/';
  }
  
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return defaultLocale;
}

// Helper to get localized path (handles base path like /cncvela.it/)
export function getLocalizedPath(path: string, locale: Locale, basePath?: string): string {
  const base = basePath ?? import.meta.env.BASE_URL.replace(/\/$/, '');
  
  // Remove base path and existing locale from the path
  let cleanPath = path;
  if (base && cleanPath.startsWith(base)) {
    cleanPath = cleanPath.slice(base.length) || '/';
  }
  cleanPath = cleanPath.replace(/^\/(it|en|de)/, '').replace(/^\/+/, '/') || '/';
  
  // Build the new path
  let newPath: string;
  if (locale === defaultLocale) {
    newPath = cleanPath;
  } else {
    newPath = `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
  }
  
  // Add base path back
  return base + newPath;
}

