import { config, fields, singleton } from '@keystatic/core';

export default config({
  storage: 
    process.env.NODE_ENV === 'development'
      ? { kind: 'local' }
      : {
          kind: 'github',
          repo: {
            owner: 'riccardo-forina',
            name: 'cncvela.it',
          },
        },
  
  ui: {
    brand: {
      name: 'CNC Caldè',
    },
    navigation: {
      'Contenuti': ['events', 'siteContent'],
      'Configurazione': ['board', 'pricing'],
    },
  },

  singletons: {
    // ===== EVENTI =====
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
                { label: 'Evento sociale', value: 'sociale' },
              ],
              defaultValue: 'regata'
            }),
            title: fields.text({ 
              label: 'Titolo',
              validation: { isRequired: true }
            }),
            subtitle: fields.text({ label: 'Sottotitolo' }),
            date: fields.text({ 
              label: 'Data (YYYY-MM-DD)',
              validation: { isRequired: true }
            }),
            endDate: fields.text({ 
              label: 'Data fine (YYYY-MM-DD)',
              description: 'Per eventi multi-giorno'
            }),
            time: fields.text({ label: 'Orario (HH:MM)' }),
            description: fields.text({ 
              label: 'Descrizione',
              multiline: true 
            }),
            featured: fields.checkbox({ 
              label: 'In evidenza',
              description: 'Mostra in homepage'
            }),
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
              bando: fields.text({ label: 'URL Bando' }),
              iscrizione: fields.text({ label: 'URL Modulo Iscrizione' }),
              istruzioni: fields.text({ label: 'URL Istruzioni di Regata' }),
              classifica: fields.text({ label: 'URL Classifica' }),
            }, { label: 'Documenti' }),
          }),
          { 
            label: 'Eventi',
            itemLabel: (props) => {
              const title = props.fields.title.value || 'Nuovo evento';
              const date = props.fields.date.value || '';
              return `${title} (${date})`;
            }
          }
        ),
      },
    }),

    // ===== CONTENUTI SITO =====
    siteContent: singleton({
      label: 'Contenuti Homepage',
      path: 'src/data/site-content',
      format: { data: 'json' },
      schema: {
        hero: fields.object({
          title: fields.text({ label: 'Titolo Hero' }),
          subtitle: fields.text({ label: 'Sottotitolo Hero' }),
        }, { label: 'Hero Homepage' }),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: 'Valore' }),
            label: fields.text({ label: 'Etichetta' }),
          }),
          { label: 'Statistiche' }
        ),
      },
    }),

    // ===== CONSIGLIO DIRETTIVO =====
    board: singleton({
      label: 'Info Circolo',
      path: 'src/data/board',
      format: { data: 'json' },
      schema: {
        contact: fields.object({
          clubName: fields.text({ label: 'Nome club' }),
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
            country: fields.text({ label: 'Paese' }),
          }, { label: 'Indirizzo' }),
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
        
        auditor: fields.object({
          role: fields.text({ label: 'Ruolo' }),
          name: fields.text({ label: 'Nome' }),
        }, { label: 'Revisore dei Conti' }),
        
        probiviri: fields.array(
          fields.object({
            role: fields.text({ label: 'Ruolo' }),
            name: fields.text({ label: 'Nome' }),
          }),
          { label: 'Collegio dei Probiviri' }
        ),
        
        safeguarding: fields.object({
          officer: fields.object({
            name: fields.text({ label: 'Nome responsabile' }),
            email: fields.text({ label: 'Email' }),
          }),
          policy: fields.text({ label: 'URL Policy' }),
          model: fields.text({ label: 'URL Modello Organizzativo' }),
          code: fields.text({ label: 'URL Codice di Condotta' }),
        }, { label: 'Safeguarding' }),
        
        documents: fields.array(
          fields.object({
            name: fields.text({ label: 'Nome documento' }),
            url: fields.text({ label: 'URL file' }),
            icon: fields.text({ label: 'Icona (document/users/certificate)' }),
          }),
          { 
            label: 'Documenti',
            itemLabel: (props) => props.fields.name.value || 'Documento'
          }
        ),
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
          ordinario: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
          familiare: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
          juniores: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
        }, { label: 'Quote associative' }),
        
        fivCards: fields.object({
          allievo: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
          unico: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
          baseTesseramento: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
        }, { label: 'Tessere FIV' }),
        
        boatStorage: fields.object({
          dpiccole: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
          dmedie: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
          cabinati: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            description: fields.text({ label: 'Descrizione' }),
          }),
        }, { label: 'Ricovero barche' }),
        
        courses: fields.object({
          deriveSettimanale: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            name: fields.text({ label: 'Nome' }),
          }),
          deriveWeekend: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            name: fields.text({ label: 'Nome' }),
          }),
          cabinati: fields.object({
            price: fields.integer({ label: 'Prezzo (€)' }),
            name: fields.text({ label: 'Nome' }),
          }),
          discounts: fields.array(
            fields.object({
              description: fields.text({ label: 'Descrizione' }),
              amount: fields.text({ label: 'Sconto' }),
            }),
            { label: 'Sconti' }
          ),
        }, { label: 'Corsi' }),
      },
    }),
  },
});
