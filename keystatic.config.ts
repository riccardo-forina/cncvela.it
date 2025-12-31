import { config, fields, singleton } from '@keystatic/core';

// =============================================================================
// HELPER - Campi multilingua
// =============================================================================
const localizedText = (label: string, options?: { multiline?: boolean; required?: boolean }) => 
  fields.object({
    it: fields.text({ 
      label: `🇮🇹 ${label}`, 
      multiline: options?.multiline,
      validation: options?.required ? { isRequired: true } : undefined
    }),
    en: fields.text({ label: `🇬🇧 ${label}`, multiline: options?.multiline }),
    de: fields.text({ label: `🇩🇪 ${label}`, multiline: options?.multiline }),
  }, { label });

// =============================================================================
// CONFIGURAZIONE KEYSTATIC
// =============================================================================
// CMS attivo solo in development locale e produzione
// Preview deployments usano local mode (sola lettura)
const isProduction = process.env.VERCEL_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export default config({
  storage: 
    isDevelopment
      ? { kind: 'local' }
      : isProduction
        ? {
            kind: 'github',
            repo: {
              owner: 'riccardo-forina',
              name: 'cncvela.it',
            },
            branchPrefix: 'cms/',
          }
        : { kind: 'local' }, // Preview: local mode (read-only, no OAuth needed)
  
  ui: {
    brand: {
      name: 'CNC Caldè',
    },
    navigation: {
      '📅 Eventi': ['events'],
      '🏠 Homepage': ['homepageContent'],
      '📄 Pagine': [
        'corsiContent', 
        'regateContent', 
        'bachecaContent', 
        'galleriaContent', 
        'circoloContent', 
        'meteoContent', 
        'privacyContent', 
        'safeguardingContent'
      ],
      '⛵ Corsi': ['courses', 'courseFees', 'fivFees'],
      'ℹ️ Info Circolo': ['contact', 'boardMembers', 'safeguardingOfficer', 'clubDocuments'],
      '💰 Tariffe': ['membershipFees', 'boatStorage', 'bankDetails'],
    },
  },

  singletons: {
    // =========================================================================
    // 📅 EVENTI
    // =========================================================================
    events: singleton({
      label: 'Eventi e Regate',
      path: 'src/data/events',
      format: { data: 'json' },
      schema: {
        events: fields.array(
          fields.object({
            id: fields.text({ 
              label: 'ID (slug)',
              description: 'Identificativo unico, es: regata-sass-gallet-2026',
              validation: { isRequired: true }
            }),
            type: fields.select({
              label: 'Tipo evento',
              options: [
                { label: 'Regata', value: 'regata' },
                { label: 'Corso', value: 'corso' },
                { label: 'Evento sociale', value: 'evento_sociale' },
              ],
              defaultValue: 'regata'
            }),
            title: localizedText('Titolo', { required: true }),
            subtitle: localizedText('Sottotitolo'),
            date: fields.text({ 
              label: 'Data (YYYY-MM-DD)',
              validation: { isRequired: true }
            }),
            endDate: fields.text({ 
              label: 'Data fine (YYYY-MM-DD)',
              description: 'Per eventi multi-giorno'
            }),
            time: fields.text({ label: 'Orario (HH:MM)' }),
            description: localizedText('Descrizione', { multiline: true }),
            status: fields.select({
              label: 'Stato',
              options: [
                { label: 'Aperto', value: 'open' },
                { label: 'Chiuso', value: 'closed' },
                { label: 'Completato', value: 'completed' },
              ],
              defaultValue: 'open'
            }),
            documents: fields.object({
              bando: fields.file({ 
                label: 'Bando di Regata (PDF)',
                directory: 'public/documenti/eventi',
                publicPath: '/documenti/eventi/',
              }),
              iscrizione: fields.file({ 
                label: 'Modulo Iscrizione (PDF)',
                directory: 'public/documenti/eventi',
                publicPath: '/documenti/eventi/',
              }),
              istruzioni: fields.file({ 
                label: 'Istruzioni di Regata (PDF)',
                directory: 'public/documenti/eventi',
                publicPath: '/documenti/eventi/',
              }),
              classifica: fields.file({ 
                label: 'Classifica (PDF)',
                directory: 'public/documenti/eventi',
                publicPath: '/documenti/eventi/',
              }),
            }, { label: 'Documenti (carica PDF)' }),
          }),
          { 
            label: 'Eventi',
            itemLabel: (props) => {
              const title = props.fields.title.fields.it.value || 'Nuovo evento';
              const date = props.fields.date.value || '';
              return `${title} (${date})`;
            }
          }
        ),
      },
    }),

    // =========================================================================
    // 🏠 HOMEPAGE
    // =========================================================================
    homepageContent: singleton({
      label: 'Homepage',
      path: 'src/data/homepage-content',
      format: { data: 'json' },
      schema: {
        meta: fields.object({
          title: localizedText('Meta Title', { required: true }),
          description: localizedText('Meta Description', { multiline: true }),
        }, { label: 'SEO Meta' }),
        hero: fields.object({
          title: localizedText('Titolo', { required: true }),
          titleAccent: localizedText('Titolo accento (seconda riga)'),
          subtitle: localizedText('Sottotitolo'),
          cta: localizedText('Testo CTA'),
          videoAria: localizedText('Aria label video'),
          playVideo: localizedText('Testo play video'),
        }, { label: 'Hero Section' }),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: 'Valore (es: 60, FIV, 0-99)' }),
            label: localizedText('Etichetta'),
          }),
          { 
            label: 'Statistiche',
            itemLabel: (props) => props.fields.value.value || 'Statistica'
          }
        ),
        gallery: fields.object({
          title: localizedText('Titolo sezione'),
          subtitle: localizedText('Sottotitolo'),
          viewAll: localizedText('Testo link'),
        }, { label: 'Sezione Galleria' }),
        courses: fields.object({
          title: localizedText('Titolo sezione'),
          subtitle: localizedText('Sottotitolo'),
          items: fields.array(
            fields.object({
              id: fields.text({ label: 'ID' }),
              badge: localizedText('Badge'),
              title: localizedText('Titolo'),
              description: localizedText('Descrizione'),
            }),
            { 
              label: 'Corsi preview',
              itemLabel: (props) => props.fields.title.fields.it.value || 'Corso'
            }
          ),
          learnMore: localizedText('Testo link'),
        }, { label: 'Sezione Corsi' }),
        location: fields.object({
          title: localizedText('Titolo sezione'),
          description: localizedText('Descrizione', { multiline: true }),
          addressLabel: localizedText('Label indirizzo'),
          phoneLabel: localizedText('Label telefono'),
          emailLabel: localizedText('Label email'),
          loadMap: localizedText('Testo carica mappa'),
        }, { label: 'Sezione Location' }),
        cta: fields.object({
          title: localizedText('Titolo'),
          description: localizedText('Descrizione'),
          primaryButton: localizedText('Bottone primario'),
          secondaryButton: localizedText('Bottone secondario'),
        }, { label: 'CTA Finale' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - CORSI
    // =========================================================================
    corsiContent: singleton({
      label: 'Pagina Corsi',
      path: 'src/data/corsi-content',
      format: { data: 'json' },
      schema: {
        page: fields.object({
          title: localizedText('Titolo pagina', { required: true }),
          subtitle: localizedText('Sottotitolo'),
          description: localizedText('Descrizione SEO'),
        }, { label: 'Header pagina' }),
        note: fields.object({
          title: localizedText('Titolo nota'),
          description: localizedText('Descrizione nota'),
          link: localizedText('Testo link'),
        }, { label: 'Nota corsi riservati' }),
        ourCourses: localizedText('Titolo sezione corsi'),
        upcomingCourses: fields.object({
          title: localizedText('Titolo'),
          empty: localizedText('Messaggio vuoto'),
          goToEvents: localizedText('Testo link'),
        }, { label: 'Prossimi corsi' }),
        pricing: fields.object({
          title: localizedText('Titolo sezione'),
        }, { label: 'Quote' }),
        registration: fields.object({
          title: localizedText('Titolo'),
          subtitle: localizedText('Sottotitolo'),
          formTitle: localizedText('Titolo form'),
          steps: fields.array(
            localizedText('Step'),
            { label: 'Passaggi' }
          ),
          downloadButton: localizedText('Bottone download'),
          sendButton: localizedText('Bottone invio'),
        }, { label: 'Iscrizione' }),
        bankDetails: fields.object({
          title: localizedText('Titolo'),
          accountHolder: localizedText('Label intestatario'),
          bank: localizedText('Label banca'),
        }, { label: 'Coordinate bancarie' }),
        safeguarding: fields.object({
          title: localizedText('Titolo'),
          description: localizedText('Descrizione'),
        }, { label: 'Safeguarding' }),
        labels: fields.object({
          duration: localizedText('Durata'),
          period: localizedText('Periodo'),
          boat: localizedText('Imbarcazione'),
        }, { label: 'Etichette' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - REGATE
    // =========================================================================
    regateContent: singleton({
      label: 'Pagina Regate',
      path: 'src/data/regate-content',
      format: { data: 'json' },
      schema: {
        page: fields.object({
          title: localizedText('Titolo pagina', { required: true }),
          subtitle: localizedText('Sottotitolo'),
          description: localizedText('Descrizione SEO'),
        }, { label: 'Header pagina' }),
        calendar: fields.object({
          title: localizedText('Titolo calendario'),
          fivLink: localizedText('Testo link FIV'),
        }, { label: 'Calendario' }),
        noRegattas: fields.object({
          title: localizedText('Titolo vuoto'),
          subtitle: localizedText('Sottotitolo vuoto'),
        }, { label: 'Nessuna regata' }),
        payment: fields.object({
          title: localizedText('Titolo'),
          description: localizedText('Descrizione'),
          causale: localizedText('Label causale'),
          causaleExample: localizedText('Esempio causale'),
        }, { label: 'Pagamento' }),
        pastResults: fields.object({
          title: localizedText('Titolo classifiche'),
        }, { label: 'Classifiche passate' }),
        documents: fields.object({
          bando: localizedText('Bando'),
          iscrizione: localizedText('Iscrizione'),
          istruzioni: localizedText('Istruzioni'),
          classifica: localizedText('Classifica'),
          download: localizedText('Download'),
          notAvailable: localizedText('Non disponibile'),
          afterRace: localizedText('Dopo la gara'),
          downloadPdf: localizedText('Download PDF'),
        }, { label: 'Etichette documenti' }),
        table: fields.object({
          pos: localizedText('Posizione'),
          boat: localizedText('Barca'),
          skipper: localizedText('Skipper'),
          club: localizedText('Club'),
          model: localizedText('Modello'),
          time: localizedText('Tempo'),
        }, { label: 'Colonne tabella' }),
        noResults: localizedText('Nessun risultato'),
        labels: fields.object({
          regata: localizedText('Regata'),
          startTime: localizedText('Ora partenza'),
          accountHolder: localizedText('Intestatario'),
          bank: localizedText('Banca'),
        }, { label: 'Etichette varie' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - BACHECA
    // =========================================================================
    bachecaContent: singleton({
      label: 'Pagina Bacheca',
      path: 'src/data/bacheca-content',
      format: { data: 'json' },
      schema: {
        page: fields.object({
          title: localizedText('Titolo pagina', { required: true }),
          subtitle: localizedText('Sottotitolo'),
          description: localizedText('Descrizione SEO'),
        }, { label: 'Header pagina' }),
        filters: fields.object({
          all: localizedText('Tutto'),
          corso: localizedText('Corsi'),
          regata: localizedText('Regate'),
          evento_sociale: localizedText('Eventi'),
        }, { label: 'Filtri' }),
        labels: fields.object({
          noEvents: localizedText('Nessun evento'),
          noFilterResults: localizedText('Nessun risultato filtro'),
          pastEvents: localizedText('Eventi passati'),
          stayUpdated: localizedText('Titolo aggiornamenti'),
          stayUpdatedDescription: localizedText('Descrizione aggiornamenti'),
          contactUs: localizedText('Contattaci'),
        }, { label: 'Etichette' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - GALLERIA
    // =========================================================================
    galleriaContent: singleton({
      label: 'Pagina Galleria',
      path: 'src/data/galleria-content',
      format: { data: 'json' },
      schema: {
        page: fields.object({
          title: localizedText('Titolo pagina', { required: true }),
          subtitle: localizedText('Sottotitolo'),
          description: localizedText('Descrizione SEO'),
        }, { label: 'Header pagina' }),
        categories: fields.object({
          all: localizedText('Tutte'),
          corsi: localizedText('Corsi'),
          regate: localizedText('Regate'),
          hero: localizedText('Hero'),
        }, { label: 'Categorie' }),
        sections: fields.object({
          scuolaVela: localizedText('Scuola Vela'),
          regate: localizedText('Regate'),
          panorami: localizedText('Panorami'),
        }, { label: 'Sezioni' }),
        lightbox: fields.object({
          close: localizedText('Chiudi'),
          prev: localizedText('Precedente'),
          next: localizedText('Successiva'),
        }, { label: 'Lightbox' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - IL CIRCOLO
    // =========================================================================
    circoloContent: singleton({
      label: 'Pagina Il Circolo',
      path: 'src/data/circolo-content',
      format: { data: 'json' },
      schema: {
        pageTitle: localizedText('Titolo pagina', { required: true }),
        pageDescription: localizedText('Descrizione SEO', { multiline: true }),
        whoWeAre: fields.object({
          title: localizedText('Titolo sezione'),
          content: localizedText('Contenuto', { multiline: true }),
        }, { label: 'Chi Siamo' }),
        facilities: fields.object({
          title: localizedText('Titolo sezione'),
          beach: fields.object({
            title: localizedText('Titolo'),
            shortDesc: localizedText('Descrizione breve'),
            longDesc: localizedText('Descrizione estesa', { multiline: true }),
          }, { label: 'Spiaggia' }),
          pontile: fields.object({
            title: localizedText('Titolo'),
            shortDesc: localizedText('Descrizione breve'),
            longDesc: localizedText('Descrizione estesa', { multiline: true }),
          }, { label: 'Pontile' }),
          sede: fields.object({
            title: localizedText('Titolo'),
            shortDesc: localizedText('Descrizione breve'),
            longDesc: localizedText('Descrizione estesa', { multiline: true }),
          }, { label: 'Sede' }),
          boatStorage: fields.object({
            title: localizedText('Titolo'),
            desc: localizedText('Descrizione', { multiline: true }),
          }, { label: 'Ricovero imbarcazioni' }),
          buoys: fields.object({
            title: localizedText('Titolo'),
            desc: localizedText('Descrizione', { multiline: true }),
          }, { label: 'Boe' }),
        }, { label: 'Strutture' }),
        membership: fields.object({
          title: localizedText('Titolo sezione'),
          intro: localizedText('Introduzione', { multiline: true }),
          benefits: fields.array(
            localizedText('Beneficio'),
            { label: 'Benefici' }
          ),
          viewFeesButton: localizedText('Testo bottone'),
        }, { label: 'Diventa Socio' }),
        fees: fields.object({
          title: localizedText('Titolo sezione'),
        }, { label: 'Quote' }),
        bankDetailsLabels: fields.object({
          title: localizedText('Titolo'),
          accountHolder: localizedText('Label intestatario'),
          bank: localizedText('Label banca'),
        }, { label: 'Label Coordinate Bancarie' }),
        documentsLabels: fields.object({
          title: localizedText('Titolo'),
          downloadPdf: localizedText('Testo download'),
        }, { label: 'Label Documenti' }),
        registration: fields.object({
          title: localizedText('Titolo'),
          steps: fields.array(
            localizedText('Step'),
            { label: 'Passaggi' }
          ),
          downloadButton: localizedText('Testo bottone download'),
          sendButton: localizedText('Testo bottone invio'),
        }, { label: 'Registrazione' }),
        contactLabels: fields.object({
          title: localizedText('Titolo sezione'),
          clubAddress: localizedText('Label indirizzo'),
          fiscalData: localizedText('Label dati fiscali'),
          loadMap: localizedText('Testo carica mappa'),
        }, { label: 'Label Contatti' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - METEO
    // =========================================================================
    meteoContent: singleton({
      label: 'Pagina Meteo',
      path: 'src/data/meteo-content',
      format: { data: 'json' },
      schema: {
        page: fields.object({
          title: localizedText('Titolo pagina', { required: true }),
          subtitle: localizedText('Sottotitolo'),
          description: localizedText('Descrizione SEO'),
        }, { label: 'Header pagina' }),
        legend: fields.object({
          title: localizedText('Titolo'),
          description: localizedText('Descrizione'),
          levels: fields.object({
            calm: localizedText('Bonaccia'),
            light: localizedText('Leggero'),
            moderate: localizedText('Moderato'),
            strong: localizedText('Forte'),
            veryStrong: localizedText('Molto forte'),
          }, { label: 'Livelli' }),
        }, { label: 'Legenda vento' }),
        source: fields.object({
          title: localizedText('Titolo'),
          position: localizedText('Posizione'),
          model: localizedText('Modello'),
        }, { label: 'Fonte dati' }),
        sailing: fields.object({
          title: localizedText('Titolo'),
          recommendedFor: localizedText('Consigliato per'),
        }, { label: 'Condizioni vela' }),
        current: fields.object({
          wind: localizedText('Vento'),
          direction: localizedText('Direzione'),
          temperature: localizedText('Temperatura'),
          humidity: localizedText('Umidità'),
          updated: localizedText('Aggiornato'),
        }, { label: 'Condizioni attuali' }),
        forecast: fields.object({
          hourly: localizedText('Previsione oraria'),
          daily: localizedText('Previsione giornaliera'),
          disclaimer: localizedText('Disclaimer'),
          loading: localizedText('Caricamento'),
          error: localizedText('Errore'),
        }, { label: 'Previsioni' }),
        windStatus: fields.object({
          calm: localizedText('Bonaccia'),
          light: localizedText('Leggero'),
          moderate: localizedText('Moderato'),
          strong: localizedText('Forte'),
          veryStrong: localizedText('Molto forte'),
        }, { label: 'Stato vento' }),
        recommendations: fields.object({
          calm: localizedText('Bonaccia'),
          light: localizedText('Leggero'),
          moderate: localizedText('Moderato'),
          strong: localizedText('Forte'),
          veryStrong: localizedText('Molto forte'),
        }, { label: 'Raccomandazioni' }),
        days: fields.object({
          today: localizedText('Oggi'),
          tomorrow: localizedText('Domani'),
        }, { label: 'Giorni' }),
        weather: fields.object({
          clear: localizedText('Sereno'),
          partlyCloudy: localizedText('Poco nuvoloso'),
          cloudy: localizedText('Nuvoloso'),
          fog: localizedText('Nebbia'),
          drizzle: localizedText('Pioggerella'),
          lightRain: localizedText('Pioggia leggera'),
          rain: localizedText('Pioggia'),
          heavyRain: localizedText('Pioggia forte'),
          snow: localizedText('Neve'),
          showers: localizedText('Rovesci'),
          thunderstorm: localizedText('Temporale'),
        }, { label: 'Condizioni meteo' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - PRIVACY
    // =========================================================================
    privacyContent: singleton({
      label: 'Pagina Privacy',
      path: 'src/data/privacy-content',
      format: { data: 'json' },
      schema: {
        page: fields.object({
          title: localizedText('Titolo pagina', { required: true }),
          description: localizedText('Descrizione SEO'),
          lastUpdated: localizedText('Ultimo aggiornamento'),
        }, { label: 'Header pagina' }),
        // Nota: la struttura completa della privacy è molto grande,
        // includiamo solo le sezioni principali modificabili frequentemente
        sections: fields.object({
          dataController: fields.object({
            title: localizedText('Titolo'),
          }, { label: 'Titolare trattamento' }),
          whatData: fields.object({
            title: localizedText('Titolo'),
            intro: localizedText('Introduzione'),
          }, { label: 'Dati raccolti' }),
          purposes: fields.object({
            title: localizedText('Titolo'),
            intro: localizedText('Introduzione'),
          }, { label: 'Finalità' }),
          rights: fields.object({
            title: localizedText('Titolo'),
            intro: localizedText('Introduzione'),
            contact: localizedText('Contatto'),
          }, { label: 'Diritti' }),
          disclaimer: localizedText('Disclaimer finale'),
        }, { label: 'Sezioni principali' }),
      },
    }),

    // =========================================================================
    // 📄 PAGINE - SAFEGUARDING
    // =========================================================================
    safeguardingContent: singleton({
      label: 'Pagina Safeguarding',
      path: 'src/data/safeguarding-content',
      format: { data: 'json' },
      schema: {
        page: fields.object({
          title: localizedText('Titolo pagina', { required: true }),
          subtitle: localizedText('Sottotitolo'),
          description: localizedText('Descrizione SEO'),
          lastUpdated: localizedText('Ultimo aggiornamento'),
        }, { label: 'Header pagina' }),
        content: fields.object({
          intro: localizedText('Introduzione', { multiline: true }),
          commitment: localizedText('Impegno', { multiline: true }),
        }, { label: 'Contenuto' }),
        sections: fields.object({
          regulations: fields.object({
            title: localizedText('Titolo'),
            content: localizedText('Contenuto', { multiline: true }),
          }, { label: 'Riferimenti normativi' }),
          contact: fields.object({
            title: localizedText('Titolo'),
            content: localizedText('Contenuto'),
          }, { label: 'Contatti' }),
        }, { label: 'Sezioni' }),
        labels: fields.object({
          safeguardingOfficer: localizedText('Responsabile'),
          downloadDocument: localizedText('Download documento'),
        }, { label: 'Etichette' }),
      },
    }),

    // =========================================================================
    // ⛵ CORSI - DETTAGLI
    // =========================================================================
    courses: singleton({
      label: 'Dettagli Corsi',
      path: 'src/data/courses',
      format: { data: 'json' },
      schema: {
        courses: fields.array(
          fields.object({
            id: fields.text({ label: 'ID', validation: { isRequired: true } }),
            title: localizedText('Titolo', { required: true }),
            subtitle: localizedText('Sottotitolo'),
            icon: fields.select({
              label: 'Icona',
              options: [
                { label: 'Barca a vela', value: 'sailboat' },
                { label: 'Yacht', value: 'yacht' },
              ],
              defaultValue: 'sailboat'
            }),
            duration: localizedText('Durata'),
            period: localizedText('Periodo'),
            boatType: localizedText('Tipo imbarcazione'),
            price: fields.number({ label: 'Prezzo (€)', validation: { isRequired: true } }),
            priceNote: localizedText('Nota prezzo'),
            description: localizedText('Descrizione', { multiline: true }),
            includes: fields.object({
              it: fields.array(fields.text({ label: 'Voce' }), { label: '🇮🇹 Include' }),
              en: fields.array(fields.text({ label: 'Item' }), { label: '🇬🇧 Includes' }),
              de: fields.array(fields.text({ label: 'Punkt' }), { label: '🇩🇪 Enthält' }),
            }, { label: 'Cosa include' }),
            accommodation: localizedText('Foresteria'),
            order: fields.number({ label: 'Ordine visualizzazione' }),
          }),
          { 
            label: 'Corsi',
            itemLabel: (props) => props.fields.title.fields.it.value || 'Corso'
          }
        ),
        labels: fields.object({
          whatIncludes: localizedText('Cosa include'),
          accommodation: localizedText('Foresteria'),
        }, { label: 'Etichette' }),
      },
    }),

    // =========================================================================
    // ⛵ CORSI - TARIFFE
    // =========================================================================
    courseFees: singleton({
      label: 'Tariffe Corsi',
      path: 'src/data/course-fees',
      format: { data: 'json' },
      schema: {
        title: localizedText('Titolo', { required: true }),
        items: fields.array(
          fields.object({
            name: localizedText('Nome'),
            price: fields.number({ label: 'Prezzo (€)', validation: { isRequired: true } }),
            note: localizedText('Note'),
          }),
          { 
            label: 'Tariffe',
            itemLabel: (props) => `${props.fields.name.fields.it.value} - €${props.fields.price.value}`
          }
        ),
        discounts: fields.array(
          fields.object({
            description: localizedText('Descrizione'),
            discount: fields.text({ label: 'Sconto' }),
          }),
          { label: 'Sconti' }
        ),
      },
    }),

    // =========================================================================
    // ⛵ CORSI - TESSERE FIV
    // =========================================================================
    fivFees: singleton({
      label: 'Tessere FIV',
      path: 'src/data/fiv-fees',
      format: { data: 'json' },
      schema: {
        title: localizedText('Titolo', { required: true }),
        note: localizedText('Nota'),
        items: fields.array(
          fields.object({
            name: localizedText('Nome'),
            price: fields.number({ label: 'Prezzo (€)', validation: { isRequired: true } }),
            note: localizedText('Note'),
          }),
          { 
            label: 'Tessere',
            itemLabel: (props) => `${props.fields.name.fields.it.value} - €${props.fields.price.value}`
          }
        ),
      },
    }),

    // =========================================================================
    // ℹ️ INFO CIRCOLO - CONTATTI
    // =========================================================================
    contact: singleton({
      label: 'Contatti',
      path: 'src/data/contact',
      format: { data: 'json' },
      schema: {
        clubName: fields.text({ label: 'Nome club', validation: { isRequired: true } }),
        legalName: fields.text({ label: 'Ragione sociale' }),
        phone: fields.text({ label: 'Telefono' }),
        fax: fields.text({ label: 'Fax' }),
        email: fields.text({ label: 'Email' }),
        website: fields.text({ label: 'Sito web' }),
        fiscalCode: fields.text({ label: 'Codice fiscale' }),
        vatNumber: fields.text({ label: 'P.IVA' }),
        address: fields.object({
          street: fields.text({ label: 'Via' }),
          city: fields.text({ label: 'Città' }),
          province: fields.text({ label: 'Provincia' }),
          postalCode: fields.text({ label: 'CAP' }),
          country: localizedText('Paese'),
        }, { label: 'Indirizzo' }),
      },
    }),

    // =========================================================================
    // ℹ️ INFO CIRCOLO - CONSIGLIO DIRETTIVO
    // =========================================================================
    boardMembers: singleton({
      label: 'Consiglio Direttivo',
      path: 'src/data/board-members',
      format: { data: 'json' },
      schema: {
        title: localizedText('Titolo sezione'),
        members: fields.array(
          fields.object({
            name: fields.text({ label: 'Nome' }),
            role: localizedText('Ruolo'),
          }),
          { 
            label: 'Membri',
            itemLabel: (props) => `${props.fields.role.fields.it.value}: ${props.fields.name.value}`
          }
        ),
        auditor: fields.object({
          name: fields.text({ label: 'Nome' }),
          role: localizedText('Ruolo'),
        }, { label: 'Revisore dei Conti' }),
        probiviri: fields.object({
          title: localizedText('Titolo'),
          members: fields.array(
            fields.object({
              name: fields.text({ label: 'Nome' }),
            }),
            { 
              label: 'Membri',
              itemLabel: (props) => props.fields.name.value || 'Membro'
            }
          ),
        }, { label: 'Collegio dei Probiviri' }),
      },
    }),

    // =========================================================================
    // ℹ️ INFO CIRCOLO - SAFEGUARDING OFFICER
    // =========================================================================
    safeguardingOfficer: singleton({
      label: 'Responsabile Safeguarding',
      path: 'src/data/safeguarding',
      format: { data: 'json' },
      schema: {
        title: localizedText('Titolo sezione'),
        officer: fields.object({
          name: fields.text({ label: 'Nome responsabile' }),
          role: localizedText('Ruolo'),
          email: fields.text({ label: 'Email' }),
          appointmentDate: fields.text({ label: 'Data nomina (YYYY-MM-DD)' }),
        }, { label: 'Responsabile' }),
        description: localizedText('Descrizione', { multiline: true }),
        documents: fields.array(
          fields.object({
            name: localizedText('Nome documento'),
            url: fields.text({ label: 'URL file' }),
          }),
          { 
            label: 'Documenti',
            itemLabel: (props) => props.fields.name.fields.it.value || 'Documento'
          }
        ),
      },
    }),

    // =========================================================================
    // ℹ️ INFO CIRCOLO - DOCUMENTI
    // =========================================================================
    clubDocuments: singleton({
      label: 'Documenti Circolo',
      path: 'src/data/documents',
      format: { data: 'json' },
      schema: {
        items: fields.array(
          fields.object({
            name: localizedText('Nome documento'),
            url: fields.text({ label: 'URL file' }),
            icon: fields.select({
              label: 'Icona',
              options: [
                { label: 'Documento', value: 'document' },
                { label: 'Utenti', value: 'users' },
                { label: 'Certificato', value: 'certificate' },
              ],
              defaultValue: 'document'
            }),
          }),
          { 
            label: 'Documenti',
            itemLabel: (props) => props.fields.name.fields.it.value || 'Documento'
          }
        ),
      },
    }),

    // =========================================================================
    // 💰 TARIFFE - QUOTE SOCI
    // =========================================================================
    membershipFees: singleton({
      label: 'Quote Soci',
      path: 'src/data/membership-fees',
      format: { data: 'json' },
      schema: {
        title: localizedText('Titolo', { required: true }),
        items: fields.array(
          fields.object({
            id: fields.text({ label: 'ID' }),
            name: localizedText('Nome'),
            price: fields.number({ label: 'Prezzo (€)', validation: { isRequired: true } }),
            note: localizedText('Note'),
          }),
          { 
            label: 'Quote',
            itemLabel: (props) => `${props.fields.name.fields.it.value} - €${props.fields.price.value}`
          }
        ),
      },
    }),

    // =========================================================================
    // 💰 TARIFFE - RICOVERO BARCHE
    // =========================================================================
    boatStorage: singleton({
      label: 'Ricovero Barche',
      path: 'src/data/boat-storage',
      format: { data: 'json' },
      schema: {
        buoy: fields.object({
          title: localizedText('Titolo'),
          note: localizedText('Note'),
          items: fields.array(
            fields.object({
              id: fields.text({ label: 'ID' }),
              name: localizedText('Nome'),
              price: fields.number({ label: 'Prezzo (€)', validation: { isRequired: true } }),
            }),
            { 
              label: 'Boe',
              itemLabel: (props) => `${props.fields.name.fields.it.value} - €${props.fields.price.value}`
            }
          ),
        }, { label: 'Quota Boa' }),
        dinghy: fields.object({
          title: localizedText('Titolo'),
          items: fields.array(
            fields.object({
              id: fields.text({ label: 'ID' }),
              name: localizedText('Nome'),
              price: fields.number({ label: 'Prezzo (€)', validation: { isRequired: true } }),
            }),
            { 
              label: 'Derive/Canoe',
              itemLabel: (props) => `${props.fields.name.fields.it.value} - €${props.fields.price.value}`
            }
          ),
        }, { label: 'Quota Deriva/Canoa' }),
      },
    }),

    // =========================================================================
    // 💰 TARIFFE - COORDINATE BANCARIE
    // =========================================================================
    bankDetails: singleton({
      label: 'Coordinate Bancarie',
      path: 'src/data/bank-details',
      format: { data: 'json' },
      schema: {
        bankName: fields.text({ label: 'Nome banca' }),
        branch: fields.text({ label: 'Filiale' }),
        accountHolder: fields.text({ label: 'Intestatario' }),
        iban: fields.text({ label: 'IBAN' }),
      },
    }),
  },
});
