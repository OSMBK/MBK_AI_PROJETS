import { AudioMemo, StudentVocalNote } from '../types';

export const INITIAL_AUDIO_MEMOS: AudioMemo[] = [
  {
    id: 'memo-1',
    scholarId: 'pythagore',
    scholarName: 'Pythagore de Samos',
    scholarAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFN1ezVjqbQIanki3GON0Aw8ZdX8pCcvQgabwrol3wA_9J_-kT8YuOA_pRyzRjgo2FMXW0OOqFWNi4ZEE7ixyva-qqHBH7T957QuwktFT4EbdULmwjc6pFtnexEzhrP1HoC0RF6XHPAmTOetek8gZstW1Q72mTXCG-d1ywpnUE7tGkPb8S7JqctTX3PC0R_zEcwu2sUefC0U2_OlvpIFqWCOIJz5uj5p4ifo8Ulzfz5ylSk73xqoM',
    category: 'Mathématiques',
    topic: 'Mathématiques • Samos',
    title: 'La démonstration du théorème par les aires',
    quoteExcerpt: '« Contemple l\'espace non comme une distance vide, mais comme la juxtaposition de carrés purs qui s\'équilibrent dans l\'harmonie. »',
    duration: '02:45',
    currentProgress: '01:14',
    recordedDate: 'Aujourd\'hui',
    tag: 'Théorème Fondateur',
    audioPlayedPercent: 45
  },
  {
    id: 'memo-2',
    scholarId: 'newton',
    scholarName: 'Sir Isaac Newton',
    scholarAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDvi_OxdQ6ce5MqBG8Z2oQ1O9XYSl0lw3vb9JQ_UcyBNMeFBolwvC07jdllF0GFbXGjSaY1v6r3f0fzRVC8EaOr_nadSz_NzwM7OqJB1f37DWkzRItdGtmZD0YYV5OWFCOrKK4GUH8s4RBxuPM0axhPzOZjuOKz90c1iPRu6nbQAb3-LGvBOoLztYqHj5SjpN1CjR3Edds4aYrdlJn8czB7j1O3h5NTEmax7yc8M_lpSvcOF5wTRM',
    category: 'Optique',
    topic: 'Physique & Optique',
    title: 'Newton & le spectre lumineux : la séparation du prisme',
    quoteExcerpt: '« Les rayons de lumière ne se colorent point par accident ; leur réfrangibilité distincte est innée et absolue. »',
    duration: '03:10',
    currentProgress: '00:00',
    recordedDate: 'Enregistré hier',
    tag: 'Expérience #4',
    audioPlayedPercent: 0
  },
  {
    id: 'memo-3',
    scholarId: 'socrate',
    scholarName: 'Socrate d’Athènes',
    scholarAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2gX4KiStE2dXtQn2j2EJbl4_7gNNG2bnnkNcpQJjo3lip5-iUTIM0exepg2RnKurDbY1iePdyoTFCAPzIVu5QZ3UhxD9CXj7ZqM8gDlfDweAwpbXAj5E80h8dhLdotUPJnhntFe770909lJ4zaXms34apqnhHKyRVq3xtQm0MbhbNlxXm0KQ8ZdmcDjo49ZxsHSDoqnUktmmlq-GF_nZgdwF13tmtlD--H0iCIMxv4cdCh0Q5Ivs',
    category: 'Métaphysique',
    topic: 'Métaphysique • Athènes',
    title: 'L\'allégorie de la caverne selon Socrate (Dialogue audio)',
    quoteExcerpt: '« Celui qui sort à la clarté du midi est d\'abord aveuglé ; il faut du temps pour contempler les réalités célestes plutôt que leurs ombres projetées. »',
    duration: '04:15',
    currentProgress: '00:00',
    recordedDate: 'Il y a 3 jours',
    tag: 'Élégie audio',
    audioPlayedPercent: 0
  }
];

export const INITIAL_STUDENT_NOTES: StudentVocalNote[] = [
  {
    id: 'note-1',
    title: 'Méditation sur la réfraction',
    timestamp: 'Il y a 3 h',
    duration: '01:22',
    studentTranscript: '« J\'ai cherché à comprendre pourquoi l\'angle de réfraction dépend du milieu traversé. Est-ce une résistance mécanique ou une densité corpusculaire ? »',
    feedbackScholarId: 'newton',
    feedbackScholarName: 'Newton',
    feedbackStatus: 'Validé',
    feedbackText: 'Excellente intuition. Vous avez justement distingué l\'action de la matière dense sur l\'accélération corpusculaire. Consultez le Livre II de l\'Opticks.'
  },
  {
    id: 'note-2',
    title: 'Doute méthodique & Vérité',
    timestamp: 'Hier',
    duration: '02:04',
    studentTranscript: '« Si la perception première est trompeuse dans la caverne, comment être certain que la lumière du soleil extérieur ne soit pas elle-même une illusion supérieure ? »',
    feedbackScholarId: 'socrate',
    feedbackScholarName: 'Socrate',
    feedbackStatus: 'En débat',
    feedbackText: 'C\'est là le piège du relativisme, mon ami. Le Soleil n\'éclaire pas seulement : il engendre la vérité même. Approfondissons lors de notre prochain dialogue.'
  }
];
