/**
 * Configurazione centrale del sito.
 * Se i nomi di tabella/colonne della tua dashboard sono diversi,
 * modifica SOLO questo file: il resto del sito si adegua.
 */

export const SITE = {
  name: "Dark Ghost Cards",
  tagline: "Compravendita di carte collezionabili",
  // Video di apertura in /public/video/.
  // intro.mp4 = 16:9, per computer e telefono in orizzontale.
  // intro-9x16.mp4 = 9:16, per il telefono in verticale.
  introVideo: "/video/intro.mp4",
  introVideoPortrait: "/video/intro-9x16.mp4",
  // Contatti: lascia "" quelli che non hai, il sito li nasconde automaticamente.
  // Ogni canale compare come icona/logo cliccabile. Inserisci il link completo (https://...).
  contacts: {
    whatsapp: "https://chat.whatsapp.com/J3NfYStZbudEOITAd14xIh", // invito al gruppo
    instagram: "https://www.instagram.com/darkghost_cards/",
    tiktok: "https://www.tiktok.com/@darkghostcards",
    cardtrader: "https://www.cardtrader.com/it-IT/users/alex-iozzi",
    cardmarket: "", // es. "https://www.cardmarket.com/it/Pokemon/Users/tuonome"
    ebay: "", // es. "https://www.ebay.it/usr/tuonome"
    vinted: "https://www.vinted.it/member/230538171",
    email: "darkghost.cards@gmail.com",
  },
};

/** true se hai inserito almeno un contatto */
export const HAS_CONTACTS = Object.values(SITE.contacts).some(Boolean);

/**
 * Il sito NON legge la tabella "cards" (contiene prezzi d'acquisto, note, ecc.)
 * ma la vista pubblica "public_cards", che espone solo i dati da mostrare.
 * La vista si crea con lo script in supabase/public_cards.sql
 */
export const CARDS_TABLE = "public_cards";

/**
 * Mappa: campo usato dal sito -> nome colonna nella vista.
 * Metti null se la colonna non esiste.
 */
export const COLUMNS: Record<
  | "id" | "name" | "set" | "number" | "game" | "condition" | "language" | "japanese"
  | "rarity" | "price" | "quantity" | "image" | "foil" | "updatedAt" | "createdAt"
  | "cardtraderUrl" | "cardmarketUrl" | "vintedUrl" | "ebayUrl",
  string | null
> = {
  id: "id",
  name: "name", // nome carta
  set: "set_name", // espansione / set
  number: "number", // numero carta nel set
  // Colonna "gioco" nella vista (vedi supabase/public_cards.sql, passo A).
  // Finché la colonna non esiste nella vista, il filtro per gioco resta nascosto.
  game: "game",
  condition: "condition", // condizione
  language: "language", // lingua
  japanese: "is_japanese", // carta giapponese (sì/no)
  rarity: null, // nel DB non c'è la colonna "rarità"
  price: "price", // prezzo di vendita (calcolato nella vista)
  // Nessuna colonna quantità: ogni riga = 1 copia e le righe uguali vengono raggruppate.
  quantity: null,
  image: "image_url", // URL immagine (da API CardTrader)
  foil: "is_foil",
  updatedAt: "updated_at",
  createdAt: "created_at", // data di inserimento, serve per "Ultimi arrivi"
  // Link diretti all'annuncio della singola carta (colonne da aggiungere: vedi supabase/public_cards.sql)
  cardtraderUrl: "cardtrader_url",
  cardmarketUrl: "cardmarket_url",
  vintedUrl: "vinted_url",
  ebayUrl: "ebay_url",
};

/**
 * Sezione "Ultimi arrivi" sopra il catalogo.
 * Compare solo se il catalogo ha più di `minCatalog` carte (altrimenti ripeterebbe la lista)
 * e se non ci sono filtri attivi.
 */
export const NEW_ARRIVALS = { count: 6, minCatalog: 7 };

/** Quante carte mostrare per volta; il resto con "Carica altre" */
export const PAGE_SIZE = 24;

/**
 * Aggiornamento automatico del catalogo.
 * Realtime NON funziona sulle viste, quindi il sito ricarica i dati ogni N secondi
 * e quando il visitatore torna sulla scheda del browser.
 */
export const REFRESH_SECONDS = 30;

/**
 * Raggruppa le copie identiche (stesso nome, espansione, condizione, lingua,
 * foil e prezzo) in un'unica carta con la quantità sommata.
 */
export const GROUP_IDENTICAL_COPIES = true;

/**
 * Filtri opzionali per mostrare solo il materiale in vendita.
 * Esempio: { sold: false } oppure { status: "available" }.
 * Lascia vuoto {} per mostrare tutte le righe.
 */
export const ONLY_WHERE: Record<string, string | number | boolean> = {};

/**
 * Prezzo minimo (in euro) per comparire nel catalogo.
 * Le carte sotto questa soglia (es. bulk di comuni da 0,10 €) e quelle SENZA prezzo
 * non vengono mostrate. Metti 0 per mostrare tutto.
 */
export const MIN_PRICE = 20;

/**
 * Se true, mostra solo le carte con quantità > 0.
 * Metti false per mostrare anche quelle esaurite (con badge "Esaurita").
 */
export const HIDE_OUT_OF_STOCK = true;

/** Etichette leggibili per le condizioni */
export const CONDITION_LABELS: Record<string, string> = {
  M: "Mint",
  NM: "Near Mint",
  SP: "Slightly Played",
  EX: "Excellent",
  GD: "Good",
  LP: "Lightly Played",
  MP: "Moderately Played",
  PL: "Played",
  HP: "Heavily Played",
  PO: "Poor",
};

/**
 * Guida alle condizioni (finestra "Guida alle condizioni" nel catalogo).
 * Testi generici di uso comune tra i collezionisti: modificali con i criteri
 * che usi davvero tu per valutare le carte.
 */
export const CONDITION_GUIDE: Record<string, string> = {
  M: "Perfetta, come appena estratta dalla bustina. Nessun difetto visibile.",
  NM: "Quasi perfetta. Al massimo minimi segni su bordi o angoli, visibili solo da vicino.",
  SP: "Lievi segni d'uso: leggero whitening sui bordi o piccoli graffi superficiali.",
  EX: "Ottime condizioni, con piccoli segni su bordi, angoli o superficie.",
  GD: "Segni d'uso evidenti ma nessun danno grave: whitening diffuso, piccole pieghe leggere.",
  LP: "Usura leggera ma visibile su bordi, angoli e superficie.",
  MP: "Usura moderata: bordi rovinati, graffi e segni ben visibili.",
  PL: "Carta giocata: usura marcata, piegature o segni diffusi.",
  HP: "Molto usurata: pieghe, graffi profondi o macchie, ma ancora intera.",
  PO: "Danneggiata: strappi, pieghe marcate o rovinata in modo evidente.",
};

/**
 * Dati legali nel footer. Compila SOLO quelli che ti servono, gli altri restano nascosti.
 * Quali dati indicare dipende dalla tua attività: chiedi al tuo commercialista.
 */
export const LEGAL = {
  businessName: "", // es. ragione sociale o nome dell'attività
  vat: "", // es. "IT01234567890"
  address: "", // sede
  privacyUrl: "", // link alla tua informativa privacy
  cookieUrl: "", // link alla cookie policy
};
