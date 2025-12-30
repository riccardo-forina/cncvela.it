import { config, fields, collection, singleton } from '@keystatic/core';

// Helper per creare link a Google Translate
const googleTranslateUrl = (text: string, targetLang: string) => 
  `https://translate.google.com/?sl=it&tl=${targetLang}&text=${encodeURIComponent(text)}`;

// Lingue supportate
const locales = ['it', 'en', 'de'] as const;
const localeLabels = {
  it: '🇮🇹 Italiano',
  en: '🇬🇧 English', 
  de: '🇩🇪 Deutsch'
};

// Detect environment
const isServer = typeof window === 'undefined';
const isVercel = isServer && !!process.env.VERCEL;

export default config({
  storage: isVercel 
    ? {
        // Produzione: usa GitHub con OAuth
        kind: 'github',
        repo: {
          owner: 'riccardo-forina',
          name: 'cncvela.it',
        },
      }
    : {
        // Sviluppo locale: salva su file system
        kind: 'local',
      },
  
  ui: {
    brand: {
      name: 'CNC Caldè',
    },
    navigation: {
      'Contenuti': ['events', 'courses', 'pages'],
      'Configurazione': ['siteSettings', 'board', 'pricing'],
    },
  },

  collections: {
    // ===== EVENTI =====
    events: collection({
      label: 'Eventi',
      slugField: 'id',
      path: 'src/data/events/*',
      format: { data: 'json' },
      schema: {
        id: fields.text({ 
          label: 'ID (slug)',
          description: 'Identificativo unico, es: regata-sass-gallet-2026',
          validation: { isRequired: true }
        }),
        title: fields.object({
          it: fields.text({ label: '🇮🇹 Titolo', validation: { isRequired: true } }),
          en: fields.text({ label: '🇬🇧 Title' }),
          de: fields.text({ label: '🇩🇪 Titel' }),
        }, { label: 'Titolo' }),
        date: fields.date({ 
          label: 'Data evento',
          validation: { isRequired: true }
        }),
        endDate: fields.date({ 
          label: 'Data fine (opzionale)',
          description: 'Per eventi multi-giorno'
        }),
        type: fields.select({
          label: 'Tipo evento',
          options: [
            { label: 'Regata', value: 'regata' },
            { label: 'Corso', value: 'corso' },
            { label: 'Evento sociale', value: 'sociale' },
          ],
          defaultValue: 'regata'
        }),
        description: fields.object({
          it: fields.text({ label: '🇮🇹 Descrizione', multiline: true }),
          en: fields.text({ label: '🇬🇧 Description', multiline: true }),
          de: fields.text({ label: '🇩🇪 Beschreibung', multiline: true }),
        }, { label: 'Descrizione' }),
        featured: fields.checkbox({ 
          label: 'In evidenza',
          description: 'Mostra in homepage'
        }),
        documents: fields.array(
          fields.object({
            name: fields.text({ label: 'Nome documento' }),
            url: fields.text({ label: 'URL file' }),
          }),
          { 
            label: 'Documenti allegati',
            itemLabel: (props) => props.fields.name.value || 'Documento'
          }
        ),
        results: fields.array(
          fields.object({
            name: fields.text({ label: 'Nome classifica' }),
            url: fields.text({ label: 'URL file PDF' }),
          }),
          { 
            label: 'Risultati/Classifiche',
            itemLabel: (props) => props.fields.name.value || 'Classifica'
          }
        ),
      },
    }),

    // ===== CORSI =====
    courses: collection({
      label: 'Corsi',
      slugField: 'id',
      path: 'src/content/courses/*',
      format: { contentField: 'content' },
      schema: {
        id: fields.text({ 
          label: 'ID (slug)',
          validation: { isRequired: true }
        }),
        title: fields.object({
          it: fields.text({ label: '🇮🇹 Titolo', validation: { isRequired: true } }),
          en: fields.text({ label: '🇬🇧 Title' }),
          de: fields.text({ label: '🇩🇪 Titel' }),
        }, { label: 'Titolo' }),
        subtitle: fields.object({
          it: fields.text({ label: '🇮🇹 Sottotitolo' }),
          en: fields.text({ label: '🇬🇧 Subtitle' }),
          de: fields.text({ label: '🇩🇪 Untertitel' }),
        }, { label: 'Sottotitolo' }),
        icon: fields.text({ 
          label: 'Icona',
          description: 'Nome icona: sailboat, users, anchor'
        }),
        ageRange: fields.text({ 
          label: 'Fascia età',
          description: 'Es: 6-14, 14-99'
        }),
        duration: fields.object({
          it: fields.text({ label: '🇮🇹 Durata' }),
          en: fields.text({ label: '🇬🇧 Duration' }),
          de: fields.text({ label: '🇩🇪 Dauer' }),
        }, { label: 'Durata' }),
        order: fields.integer({ 
          label: 'Ordine visualizzazione',
          defaultValue: 0
        }),
        content: fields.mdx({ 
          label: 'Contenuto dettagliato',
          description: 'Descrizione completa del corso'
        }),
      },
    }),

    // ===== PAGINE =====
    pages: collection({
      label: 'Pagine',
      slugField: 'slug',
      path: 'src/content/pages/*',
      format: { contentField: 'content' },
      schema: {
        slug: fields.text({ 
          label: 'Slug',
          validation: { isRequired: true }
        }),
        title: fields.object({
          it: fields.text({ label: '🇮🇹 Titolo', validation: { isRequired: true } }),
          en: fields.text({ label: '🇬🇧 Title' }),
          de: fields.text({ label: '🇩🇪 Titel' }),
        }, { label: 'Titolo' }),
        description: fields.object({
          it: fields.text({ label: '🇮🇹 Descrizione SEO' }),
          en: fields.text({ label: '🇬🇧 SEO Description' }),
          de: fields.text({ label: '🇩🇪 SEO Beschreibung' }),
        }, { label: 'Descrizione SEO' }),
        content: fields.mdx({ 
          label: 'Contenuto',
        }),
      },
    }),
  },

  singletons: {
    // ===== IMPOSTAZIONI SITO =====
    siteSettings: singleton({
      label: 'Impostazioni Sito',
      path: 'src/data/settings',
      format: { data: 'json' },
      schema: {
        heroTitle: fields.object({
          it: fields.text({ label: '🇮🇹 Titolo Hero' }),
          en: fields.text({ label: '🇬🇧 Hero Title' }),
          de: fields.text({ label: '🇩🇪 Hero Titel' }),
        }, { label: 'Titolo Homepage Hero' }),
        heroSubtitle: fields.object({
          it: fields.text({ label: '🇮🇹 Sottotitolo Hero' }),
          en: fields.text({ label: '🇬🇧 Hero Subtitle' }),
          de: fields.text({ label: '🇩🇪 Hero Untertitel' }),
        }, { label: 'Sottotitolo Homepage Hero' }),
      },
    }),

    // ===== CONSIGLIO DIRETTIVO =====
    board: singleton({
      label: 'Consiglio Direttivo',
      path: 'src/data/board',
      format: { data: 'json' },
      schema: {
        contact: fields.object({
          clubName: fields.text({ label: 'Nome club' }),
          legalName: fields.text({ label: 'Ragione sociale' }),
          phone: fields.text({ label: 'Telefono' }),
          email: fields.text({ label: 'Email' }),
          fiscalCode: fields.text({ label: 'Codice fiscale' }),
          vatNumber: fields.text({ label: 'P.IVA' }),
          address: fields.object({
            street: fields.text({ label: 'Via' }),
            city: fields.text({ label: 'Città' }),
            province: fields.text({ label: 'Provincia' }),
            postalCode: fields.text({ label: 'CAP' }),
          }),
        }, { label: 'Contatti' }),
        board: fields.object({
          members: fields.array(
            fields.object({
              role: fields.text({ label: 'Ruolo' }),
              name: fields.text({ label: 'Nome' }),
            }),
            { 
              label: 'Membri consiglio',
              itemLabel: (props) => `${props.fields.role.value}: ${props.fields.name.value}`
            }
          ),
        }, { label: 'Consiglio Direttivo' }),
        safeguarding: fields.object({
          officer: fields.object({
            name: fields.text({ label: 'Nome responsabile' }),
            email: fields.text({ label: 'Email' }),
          }),
        }, { label: 'Safeguarding' }),
      },
    }),

    // ===== TARIFFE =====
    pricing: singleton({
      label: 'Tariffe',
      path: 'src/data/pricing',
      format: { data: 'json' },
      schema: {
        year: fields.integer({ label: 'Anno tariffe' }),
        membership: fields.object({
          adult: fields.integer({ label: 'Quota socio adulto (€)' }),
          family: fields.integer({ label: 'Quota famiglia (€)' }),
          junior: fields.integer({ label: 'Quota junior (€)' }),
        }, { label: 'Quote associative' }),
        courses: fields.array(
          fields.object({
            id: fields.text({ label: 'ID corso' }),
            name: fields.object({
              it: fields.text({ label: '🇮🇹 Nome' }),
              en: fields.text({ label: '🇬🇧 Name' }),
              de: fields.text({ label: '🇩🇪 Name' }),
            }),
            price: fields.integer({ label: 'Prezzo (€)' }),
          }),
          { 
            label: 'Prezzi corsi',
            itemLabel: (props) => props.fields.name.value?.it || 'Corso'
          }
        ),
        discounts: fields.array(
          fields.object({
            description: fields.object({
              it: fields.text({ label: '🇮🇹 Descrizione' }),
              en: fields.text({ label: '🇬🇧 Description' }),
              de: fields.text({ label: '🇩🇪 Beschreibung' }),
            }),
            amount: fields.text({ label: 'Sconto (es: -50€, -10%)' }),
          }),
          { label: 'Sconti' }
        ),
      },
    }),
  },
});

