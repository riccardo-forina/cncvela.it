// Centralized translations for the CNC Vela website
// Supported locales: it (default), en, de, fr

export const locales = ['it', 'en', 'de', 'fr'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'it';

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  it: '🇮🇹',
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
};

// BCP-47 tags for Intl date/time formatting. This is the site's standard
// convention (en-GB, not en-US) — used sitewide except weather.ts, which
// has its own en-US variant (see localeTagsUS).
export const localeTags: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
};

// Same as localeTags but with en-US — kept separate rather than unifying,
// since changing weather.ts's existing en-US behavior wasn't requested.
export const localeTagsUS: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
};

// Open Graph og:locale format (underscore, region-qualified).
export const ogLocaleTags: Record<Locale, string> = {
  it: 'it_IT',
  en: 'en_GB',
  de: 'de_DE',
  fr: 'fr_FR',
};

export const translations = {
  // ===== NAVIGATION =====
  nav: {
    home: { it: 'Home', en: 'Home', de: 'Home', fr: 'Accueil' },
    club: { it: 'Il Circolo', en: 'The Association', de: 'Der Verein', fr: 'Le Club' },
    courses: { it: 'Corsi', en: 'Courses', de: 'Kurse', fr: 'Cours' },
    regattas: { it: 'Regate', en: 'Regattas', de: 'Regatten', fr: 'Régates' },
    events: { it: 'Bacheca', en: 'Events', de: 'Termine', fr: 'Événements' },
    gallery: { it: 'Galleria', en: 'Gallery', de: 'Galerie', fr: 'Galerie' },
    weather: { it: 'Meteo', en: 'Weather', de: 'Wetter', fr: 'Météo' },
  },

  // ===== HOMEPAGE HERO =====
  hero: {
    title: {
      it: 'Vivi la Vela\nsul Lago Maggiore',
      en: 'Experience Sailing\non Lake Maggiore',
      de: 'Erlebe Segeln\nam Lago Maggiore',
      fr: 'Vivez la Voile\nsur le Lac Majeur',
    },
    subtitle: {
      it: 'Associazione Sportiva dal 1965 · Passione per la vela',
      en: 'Sports Association since 1965 · Passion for sailing',
      de: 'Sportverein seit 1965 · Leidenschaft für Segeln',
      fr: 'Association Sportive depuis 1965 · Passion pour la voile',
    },
    cta: {
      it: 'Unisciti a Noi',
      en: 'Join Us',
      de: 'Werde Mitglied',
      fr: 'Rejoignez-nous',
    },
  },

  // ===== STATS BAR =====
  stats: {
    years: { it: 'Anni di storia', en: 'Years of history', de: 'Jahre Geschichte', fr: "Années d'histoire" },
    fiv: { it: 'Affiliati dal 1975', en: 'FIV affiliated since 1975', de: 'FIV-Mitglied seit 1975', fr: 'Affilié à la FIV depuis 1975' },
    ages: { it: 'Soci di ogni età', en: 'Members of all ages', de: 'Mitglieder jeden Alters', fr: 'Membres de tout âge' },
    beach: { it: 'Spiaggia in concessione', en: 'Private beach', de: 'Privatstrand', fr: 'Plage privée' },
  },

  // ===== HOMEPAGE SECTIONS =====
  sections: {
    courses: {
      title: { it: 'Corsi per i Soci', en: 'Courses for Members', de: 'Kurse für Mitglieder', fr: 'Cours pour les Membres' },
      subtitle: {
        it: 'Scuola Vela riconosciuta FIV. Tre tipologie di corso per tutte le esigenze.',
        en: 'FIV certified Sailing School. Three course types for all needs.',
        de: 'FIV-zertifizierte Segelschule. Drei Kurstypen für alle Bedürfnisse.',
        fr: "École de Voile agréée FIV. Trois types de cours pour tous les besoins.",
      },
      viewAll: { it: 'Tutti i Corsi', en: 'All Courses', de: 'Alle Kurse', fr: 'Tous les Cours' },
    },
    events: {
      title: { it: 'Prossimi Eventi', en: 'Upcoming Events', de: 'Kommende Events', fr: 'Prochains Événements' },
      viewAll: { it: 'Vedi Tutti', en: 'View All', de: 'Alle ansehen', fr: 'Voir tout' },
      noEvents: {
        it: 'Nessun evento in programma',
        en: 'No upcoming events',
        de: 'Keine kommenden Events',
        fr: 'Aucun événement prévu',
      },
    },
    location: {
      title: { it: 'Dove Siamo', en: 'Where We Are', de: 'Wo wir sind', fr: 'Où Nous Trouver' },
      description: {
        it: 'Il Circolo Nautico Caldè si trova nella splendida baia di Caldè, frazione di Castelveccana, sulla sponda lombarda del Lago Maggiore. Una location unica, protetta dai venti e ideale per imparare a navigare.',
        en: 'Circolo Nautico Caldè is located in the beautiful bay of Caldè, a hamlet of Castelveccana, on the Lombard shore of Lake Maggiore. A unique location, sheltered from winds and ideal for learning to sail.',
        de: 'Der Circolo Nautico Caldè befindet sich in der wunderschönen Bucht von Caldè, einem Ortsteil von Castelveccana, am lombardischen Ufer des Lago Maggiore. Ein einzigartiger Ort, windgeschützt und ideal zum Segelnlernen.',
        fr: "Le Circolo Nautico Caldè se trouve dans la magnifique baie de Caldè, un hameau de Castelveccana, sur la rive lombarde du Lac Majeur. Un lieu unique, abrité des vents et idéal pour apprendre à naviguer.",
      },
      address: { it: 'Indirizzo', en: 'Address', de: 'Adresse', fr: 'Adresse' },
      phone: { it: 'Telefono', en: 'Phone', de: 'Telefon', fr: 'Téléphone' },
      email: { it: 'Email', en: 'Email', de: 'E-Mail', fr: 'E-mail' },
    },
    cta: {
      title: { it: 'Unisciti a Noi', en: 'Join Us', de: 'Werde Mitglied', fr: 'Rejoignez-nous' },
      description: {
        it: 'Entra a far parte della nostra comunità velica. La baia di Caldè ti aspetta.',
        en: 'Become part of our sailing community. The bay of Caldè awaits you.',
        de: 'Werde Teil unserer Segelgemeinschaft. Die Bucht von Caldè erwartet dich.',
        fr: 'Rejoignez notre communauté de voile. La baie de Caldè vous attend.',
      },
      becomeMember: { it: 'Diventa Socio', en: 'Become a Member', de: 'Mitglied werden', fr: 'Devenir Membre' },
      writeUs: { it: 'Scrivici', en: 'Write Us', de: 'Schreib uns', fr: 'Écrivez-nous' },
    },
  },

  // ===== COURSES =====
  courses: {
    pageTitle: { it: 'Corsi di Vela', en: 'Sailing Courses', de: 'Segelkurse', fr: 'Cours de Voile' },
    pageSubtitle: {
      it: 'Scuola Vela riconosciuta FIV dal 1975',
      en: 'FIV certified Sailing School since 1975',
      de: 'FIV-zertifizierte Segelschule seit 1975',
      fr: 'École de Voile agréée FIV depuis 1975',
    },
    membersOnly: {
      it: 'I corsi di vela sono riservati ai soci del Circolo Nautico Caldè.',
      en: 'Sailing courses are reserved for members of Circolo Nautico Caldè.',
      de: 'Segelkurse sind Mitgliedern des Circolo Nautico Caldè vorbehalten.',
      fr: 'Les cours de voile sont réservés aux membres du Circolo Nautico Caldè.',
    },
    upcomingCourses: { it: 'Prossimi Corsi', en: 'Upcoming Courses', de: 'Kommende Kurse', fr: 'Prochains Cours' },
    noCourses: {
      it: 'Non ci sono corsi programmati al momento.',
      en: 'No courses scheduled at this time.',
      de: 'Derzeit sind keine Kurse geplant.',
      fr: "Aucun cours n'est prévu pour le moment.",
    },
    pricing: { it: 'Tariffe Corsi', en: 'Course Pricing', de: 'Kurspreise', fr: 'Tarifs des Cours' },
    registration: { it: 'Iscrizione', en: 'Registration', de: 'Anmeldung', fr: 'Inscription' },
    downloadForm: { it: 'Scarica Modulo', en: 'Download Form', de: 'Formular herunterladen', fr: 'Télécharger le formulaire' },
    becomeMember: { it: 'Diventa Socio', en: 'Become a Member', de: 'Mitglied werden', fr: 'Devenir Membre' },
    deriveWeekly: {
      title: { it: 'Derive Settimanale', en: 'Dinghy Weekly', de: 'Jolle Wochenkurs', fr: 'Dériveur Semaine' },
      subtitle: { it: 'Corso intensivo', en: 'Intensive course', de: 'Intensivkurs', fr: 'Cours intensif' },
    },
    deriveWeekend: {
      title: { it: 'Derive Weekend', en: 'Dinghy Weekend', de: 'Jolle Wochenende', fr: 'Dériveur Week-end' },
      subtitle: { it: 'Corso nei weekend', en: 'Weekend course', de: 'Wochenendkurs', fr: 'Cours le week-end' },
    },
    keelboat: {
      title: { it: 'Cabinati', en: 'Keelboat', de: 'Kielboot', fr: 'Habitable' },
      subtitle: { it: 'Corso su cabinato', en: 'Keelboat course', de: 'Kielbootkurs', fr: 'Cours sur habitable' },
    },
    ageRange: { it: 'Età', en: 'Age', de: 'Alter', fr: 'Âge' },
    duration: { it: 'Durata', en: 'Duration', de: 'Dauer', fr: 'Durée' },
  },

  // ===== CLUB PAGE =====
  club: {
    pageTitle: { it: 'Il Circolo', en: 'The Association', de: 'Der Verein', fr: 'Le Club' },
    whoWeAre: { it: 'Chi Siamo', en: 'Who We Are', de: 'Wer wir sind', fr: 'Qui Sommes-Nous' },
    facilities: { it: 'Le Nostre Strutture', en: 'Our Facilities', de: 'Unsere Einrichtungen', fr: 'Nos Installations' },
    board: { it: 'Consiglio Direttivo', en: 'Board of Directors', de: 'Vorstand', fr: "Conseil d'Administration" },
    documents: { it: 'Documenti', en: 'Documents', de: 'Dokumente', fr: 'Documents' },
    becomeMember: { it: 'Diventa Socio', en: 'Become a Member', de: 'Mitglied werden', fr: 'Devenir Membre' },
    memberBenefits: { it: 'Vantaggi Soci', en: 'Member Benefits', de: 'Mitgliedervorteile', fr: 'Avantages Membres' },
    pricing: { it: 'Quote Associative', en: 'Membership Fees', de: 'Mitgliedsbeiträge', fr: "Cotisations d'Adhésion" },
    contact: { it: 'Contatti', en: 'Contact', de: 'Kontakt', fr: 'Contact' },
  },

  // ===== REGATTAS =====
  regattas: {
    pageTitle: { it: 'Calendario Regate', en: 'Regatta Calendar', de: 'Regattakalender', fr: 'Calendrier des Régates' },
    upcoming: { it: 'Prossime Regate', en: 'Upcoming Regattas', de: 'Kommende Regatten', fr: 'Prochaines Régates' },
    past: { it: 'Regate Passate', en: 'Past Regattas', de: 'Vergangene Regatten', fr: 'Régates Passées' },
    results: { it: 'Classifiche', en: 'Results', de: 'Ergebnisse', fr: 'Classements' },
    documents: { it: 'Documenti', en: 'Documents', de: 'Dokumente', fr: 'Documents' },
    notice: { it: 'Bando', en: 'Notice', de: 'Ausschreibung', fr: "Avis de course" },
    instructions: { it: 'Istruzioni', en: 'Instructions', de: 'Anweisungen', fr: 'Instructions' },
  },

  // ===== EVENTS/BACHECA =====
  events: {
    pageTitle: { it: 'Bacheca Eventi', en: 'Events Board', de: 'Veranstaltungen', fr: 'Tableau des Événements' },
    all: { it: 'Tutti', en: 'All', de: 'Alle', fr: 'Tous' },
    regattas: { it: 'Regate', en: 'Regattas', de: 'Regatten', fr: 'Régates' },
    courses: { it: 'Corsi', en: 'Courses', de: 'Kurse', fr: 'Cours' },
    social: { it: 'Eventi Sociali', en: 'Social Events', de: 'Gesellschaftliche Events', fr: 'Événements Conviviaux' },
    date: { it: 'Data', en: 'Date', de: 'Datum', fr: 'Date' },
    time: { it: 'Orario', en: 'Time', de: 'Uhrzeit', fr: 'Horaire' },
    status: {
      open: { it: 'Aperto', en: 'Open', de: 'Offen', fr: 'Ouvert' },
      closed: { it: 'Chiuso', en: 'Closed', de: 'Geschlossen', fr: 'Fermé' },
      completed: { it: 'Completato', en: 'Completed', de: 'Abgeschlossen', fr: 'Terminé' },
    },
  },

  // ===== GALLERY =====
  gallery: {
    pageTitle: { it: 'Galleria', en: 'Gallery', de: 'Galerie', fr: 'Galerie' },
    atmosphere: { it: 'Atmosfera', en: 'Atmosphere', de: 'Atmosphäre', fr: 'Ambiance' },
    school: { it: 'Scuola Vela', en: 'Sailing School', de: 'Segelschule', fr: 'École de Voile' },
    regattas: { it: 'Regate', en: 'Regattas', de: 'Regatten', fr: 'Régates' },
  },

  // ===== WEATHER =====
  weather: {
    pageTitle: { it: 'Meteo Caldè', en: 'Caldè Weather', de: 'Wetter Caldè', fr: 'Météo Caldè' },
    currentConditions: { it: 'Condizioni Attuali', en: 'Current Conditions', de: 'Aktuelle Bedingungen', fr: 'Conditions Actuelles' },
    forecast: { it: 'Previsioni', en: 'Forecast', de: 'Vorhersage', fr: 'Prévisions' },
    wind: { it: 'Vento', en: 'Wind', de: 'Wind', fr: 'Vent' },
    temperature: { it: 'Temperatura', en: 'Temperature', de: 'Temperatur', fr: 'Température' },
    humidity: { it: 'Umidità', en: 'Humidity', de: 'Luftfeuchtigkeit', fr: 'Humidité' },
    pressure: { it: 'Pressione', en: 'Pressure', de: 'Druck', fr: 'Pression' },
    legend: { it: 'Legenda', en: 'Legend', de: 'Legende', fr: 'Légende' },
    excellent: { it: 'Eccellente', en: 'Excellent', de: 'Ausgezeichnet', fr: 'Excellent' },
    good: { it: 'Buono', en: 'Good', de: 'Gut', fr: 'Bon' },
    fair: { it: 'Discreto', en: 'Fair', de: 'Mäßig', fr: 'Correct' },
    poor: { it: 'Scadente', en: 'Poor', de: 'Schlecht', fr: 'Faible' },
  },

  // ===== FOOTER =====
  footer: {
    rights: { it: 'Tutti i diritti riservati', en: 'All rights reserved', de: 'Alle Rechte vorbehalten', fr: 'Tous droits réservés' },
    privacy: { it: 'Privacy Policy', en: 'Privacy Policy', de: 'Datenschutz', fr: 'Politique de Confidentialité' },
    cookies: { it: 'Cookie Policy', en: 'Cookie Policy', de: 'Cookie-Richtlinie', fr: 'Politique de Cookies' },
    contact: { it: 'Contatti', en: 'Contact', de: 'Kontakt', fr: 'Contact' },
    usefulLinks: { it: 'Link Utili', en: 'Useful Links', de: 'Nützliche Links', fr: 'Liens Utiles' },
    courseRegistration: { it: 'Iscrizione Corsi', en: 'Course Registration', de: 'Kursanmeldung', fr: 'Inscription aux Cours' },
    documents: { it: 'Documenti', en: 'Documents', de: 'Dokumente', fr: 'Documents' },
    howToReach: { it: 'Come Raggiungerci', en: 'How to Reach Us', de: 'Anfahrt', fr: 'Comment Nous Rejoindre' },
    followFacebook: { it: 'Seguici su Facebook', en: 'Follow us on Facebook', de: 'Folge uns auf Facebook', fr: 'Suivez-nous sur Facebook' },
    followInstagram: { it: 'Seguici su Instagram', en: 'Follow us on Instagram', de: 'Folge uns auf Instagram', fr: 'Suivez-nous sur Instagram' },
    description: {
      it: 'Associazione Sportiva Dilettantistica dal 1965.',
      en: 'Amateur Sports Association since 1965.',
      de: 'Amateursportverein seit 1965.',
      fr: 'Association Sportive Amateur depuis 1965.',
    },
    safeguarding: { it: 'Safeguarding', en: 'Safeguarding', de: 'Kinderschutz', fr: 'Protection des Mineurs' },
    safeguardingDesc: {
      it: 'Tutela minori e prevenzione violenza',
      en: 'Child protection and violence prevention',
      de: 'Kinderschutz und Gewaltprävention',
      fr: 'Protection des mineurs et prévention de la violence',
    },
    responsible: { it: 'Resp.', en: 'Officer:', de: 'Verantw.:', fr: 'Resp. :' },
  },

  // ===== COMMON =====
  common: {
    learnMore: { it: 'Scopri di più', en: 'Learn more', de: 'Mehr erfahren', fr: 'En savoir plus' },
    viewDetails: { it: 'Vedi dettagli', en: 'View details', de: 'Details ansehen', fr: 'Voir les détails' },
    download: { it: 'Scarica', en: 'Download', de: 'Herunterladen', fr: 'Télécharger' },
    share: { it: 'Condividi', en: 'Share', de: 'Teilen', fr: 'Partager' },
    close: { it: 'Chiudi', en: 'Close', de: 'Schließen', fr: 'Fermer' },
    loading: { it: 'Caricamento...', en: 'Loading...', de: 'Laden...', fr: 'Chargement...' },
    error: { it: 'Errore', en: 'Error', de: 'Fehler', fr: 'Erreur' },
    clickToLoad: { it: 'Clicca per caricare', en: 'Click to load', de: 'Klicken zum Laden', fr: 'Cliquez pour charger' },
    mapClickToLoad: {
      it: 'Clicca per caricare la mappa',
      en: 'Click to load the map',
      de: 'Klicken um die Karte zu laden',
      fr: 'Cliquez pour charger la carte',
    },
    switchTheme: { it: 'Cambia tema', en: 'Switch theme', de: 'Design wechseln', fr: 'Changer le thème' },
    selectLanguage: { it: 'Seleziona lingua', en: 'Select language', de: 'Sprache wählen', fr: 'Choisir la langue' },
  },

  // ===== COOKIE CONSENT =====
  cookies: {
    title: { it: 'Utilizziamo i cookie', en: 'We use cookies', de: 'Wir verwenden Cookies', fr: 'Nous utilisons des cookies' },
    description: {
      it: 'Questo sito utilizza cookie tecnici necessari al funzionamento e cookie analitici per comprendere come viene utilizzato il sito.',
      en: 'This site uses technical cookies necessary for operation and analytical cookies to understand how the site is used.',
      de: 'Diese Website verwendet technische Cookies, die für den Betrieb erforderlich sind, und analytische Cookies, um zu verstehen, wie die Website genutzt wird.',
      fr: 'Ce site utilise des cookies techniques nécessaires à son fonctionnement et des cookies analytiques pour comprendre comment le site est utilisé.',
    },
    acceptAll: { it: 'Accetta tutti', en: 'Accept all', de: 'Alle akzeptieren', fr: 'Tout accepter' },
    acceptNecessary: { it: 'Solo necessari', en: 'Only necessary', de: 'Nur notwendige', fr: 'Uniquement nécessaires' },
    managePreferences: { it: 'Gestisci preferenze', en: 'Manage preferences', de: 'Einstellungen verwalten', fr: 'Gérer les préférences' },
  },

  // ===== 404 PAGE =====
  notFound: {
    pageTitle: { it: '404 - Pagina non trovata', en: '404 - Page not found', de: '404 - Seite nicht gefunden', fr: '404 - Page non trouvée' },
    code: { it: '404', en: '404', de: '404', fr: '404' },
    title: { it: 'Fuori Rotta', en: 'Off Course', de: 'Vom Kurs Abgekommen', fr: 'Hors Route' },
    description: {
      it: 'Sembra che tu abbia virato troppo presto.<br/>Questa pagina è finita sugli scogli o non è mai esistita.',
      en: 'Looks like you tacked too early.<br/>This page has run aground or never existed.',
      de: 'Es scheint, dass du zu früh gewendet hast.<br/>Diese Seite ist auf Grund gelaufen oder hat nie existiert.',
      fr: "On dirait que vous avez viré trop tôt.<br/>Cette page s'est échouée sur les rochers ou n'a jamais existé.",
    },
    backHome: { it: 'Torna in Porto', en: 'Back to Harbor', de: 'Zurück zum Hafen', fr: 'Retour au Port' },
  },

  // ===== ORGANIZATION (JSON-LD SEO) =====
  organization: {
    name: { it: 'Circolo Nautico Caldè', en: 'Circolo Nautico Caldè', de: 'Circolo Nautico Caldè', fr: 'Circolo Nautico Caldè' },
    description: {
      it: 'Circolo velico sul Lago Maggiore: Scuola Vela, Regate e Base Nautica a Caldè (Castelveccana).',
      en: 'Sailing club on Lake Maggiore: Sailing School, Regattas and Nautical Base in Caldè (Castelveccana).',
      de: 'Segelclub am Lago Maggiore: Segelschule, Regatten und Nautische Basis in Caldè (Castelveccana).',
      fr: 'Club de voile sur le Lac Majeur : École de Voile, Régates et Base Nautique à Caldè (Castelveccana).',
    },
    streetAddress: { it: 'Via Maggiore 18', en: 'Via Maggiore 18', de: 'Via Maggiore 18', fr: 'Via Maggiore 18' },
    addressLocality: { it: 'Castelveccana', en: 'Castelveccana', de: 'Castelveccana', fr: 'Castelveccana' },
    addressRegion: { it: 'VA', en: 'VA', de: 'VA', fr: 'VA' },
    postalCode: { it: '21010', en: '21010', de: '21010', fr: '21010' },
    addressCountry: { it: 'IT', en: 'IT', de: 'IT', fr: 'IT' },
    areaServed: {
      castelveccana: { it: 'Castelveccana', en: 'Castelveccana', de: 'Castelveccana', fr: 'Castelveccana' },
      luino: { it: 'Luino', en: 'Luino', de: 'Luino', fr: 'Luino' },
      laveno: { it: 'Laveno-Mombello', en: 'Laveno-Mombello', de: 'Laveno-Mombello', fr: 'Laveno-Mombello' },
      portoValtravaglia: { it: 'Porto Valtravaglia', en: 'Porto Valtravaglia', de: 'Porto Valtravaglia', fr: 'Porto Valtravaglia' },
      altoLago: { it: 'Alto Lago Maggiore', en: 'Upper Lake Maggiore', de: 'Oberer Lago Maggiore', fr: 'Haut Lac Majeur' },
      varese: { it: 'Varese', en: 'Varese', de: 'Varese', fr: 'Varese' },
    },
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
  cleanPath = cleanPath.replace(/^\/(it|en|de|fr)/, '').replace(/^\/+/, '/') || '/';

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
