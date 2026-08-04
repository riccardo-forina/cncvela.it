export interface LocalizedText {
  it: string;
  en?: string;
  de?: string;
  fr?: string;
}

export interface EventResult {
  pos: number;
  boat: string;
  skipper: string;
  club?: string;
  model?: string;
  time?: string;
  points?: number;
}

export interface Event {
  id: string;
  type: string; // 'corso' | 'regata' | 'evento_sociale' - permissivo per JSON
  title: LocalizedText;
  subtitle?: LocalizedText;
  date: string;
  endDate?: string;
  time?: string;
  description: LocalizedText;
  registrationUrl?: string;
  documents?: {
    bando?: string | null;
    iscrizione?: string | null;
    istruzioni?: string | null;
    classifica?: string | null;
  };
  additionalDocuments?: Array<{
    label: LocalizedText;
    url: string;
  }>;
  results?: EventResult[];
  status: string; // 'open' | 'closed' | 'completed' - permissivo per JSON
}

