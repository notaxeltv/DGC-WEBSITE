import { useEffect, useMemo, useState } from "react";
import { NEW_ARRIVALS, PAGE_SIZE } from "../config";
import type { Wishlist } from "../hooks/useWishlist";
import type { Card } from "../lib/types";
import CardItem from "./CardItem";
import CardModal from "./CardModal";
import ConditionGuide from "./ConditionGuide";

type Sort = "name" | "price-asc" | "price-desc" | "recent";
type FoilFilter = "" | "si" | "no";
type PriceBand = "" | "sotto50" | "50-100" | "oltre100";

const SORTS: Sort[] = ["name", "price-asc", "price-desc", "recent"];
const PRICES: PriceBand[] = ["", "sotto50", "50-100", "oltre100"];

const PRICE_LABEL: Record<Exclude<PriceBand, "">, string> = {
  sotto50: "Sotto 50 €",
  "50-100": "50–100 €",
  oltre100: "Oltre 100 €",
};

interface Props {
  cards: Card[];
  loading: boolean;
  error: string | null;
  demo: boolean;
  wishlist: Wishlist;
}

const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const asFoil = (v: string | null): FoilFilter => (v === "si" || v === "no" ? v : "");
const asPrice = (v: string | null): PriceBand => (PRICES.includes(v as PriceBand) ? (v as PriceBand) : "");

/** Legge i filtri dal link (es. ?q=charizard&gioco=Pokémon) così le ricerche si possono condividere */
function readUrl() {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get("ord") as Sort | null;
  return {
    search: p.get("q") ?? "",
    game: p.get("gioco") ?? "",
    setName: p.get("esp") ?? "",
    condition: p.get("cond") ?? "",
    language: p.get("lingua") ?? "",
    foil: asFoil(p.get("foil")),
    price: asPrice(p.get("prezzo")),
    sort: sort && SORTS.includes(sort) ? sort : ("name" as Sort),
    cardId: p.get("carta") ?? "",
  };
}

function matchesPrice(price: number | null, band: PriceBand) {
  if (!band) return true;
  if (price === null) return false;
  if (band === "sotto50") return price < 50;
  if (band === "50-100") return price >= 50 && price <= 100;
  return price > 100;
}

export default function Catalog({ cards, loading, error, demo, wishlist }: Props) {
  const initial = useMemo(readUrl, []);
  const [search, setSearch] = useState(initial.search);
  const [game, setGame] = useState(initial.game);
  const [setName, setSetName] = useState(initial.setName);
  const [condition, setCondition] = useState(initial.condition);
  const [language, setLanguage] = useState(initial.language);
  const [foil, setFoil] = useState<FoilFilter>(initial.foil);
  const [price, setPrice] = useState<PriceBand>(initial.price);
  const [sort, setSort] = useState<Sort>(initial.sort);
  const [cardId, setCardId] = useState(initial.cardId);
  const [showGuide, setShowGuide] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const games = useMemo(() => unique(cards.map((c) => c.game)), [cards]);
  const sets = useMemo(() => unique(cards.map((c) => c.set)), [cards]);
  const conditions = useMemo(() => unique(cards.map((c) => c.condition)), [cards]);
  const languages = useMemo(() => unique(cards.map((c) => c.language)), [cards]);

  const selected = cards.find((c) => c.id === cardId) ?? null;

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (game) p.set("gioco", game);
    if (setName) p.set("esp", setName);
    if (condition) p.set("cond", condition);
    if (language) p.set("lingua", language);
    if (foil) p.set("foil", foil);
    if (price) p.set("prezzo", price);
    if (sort !== "name") p.set("ord", sort);
    if (cardId) p.set("carta", cardId);
    const qs = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
  }, [search, game, setName, condition, language, foil, price, sort, cardId]);

  useEffect(() => setVisible(PAGE_SIZE), [search, game, setName, condition, language, foil, price, sort]);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [sheet]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^#/, "");
    const list = cards.filter((c) => {
      const hay = `${c.name} ${c.set} ${c.number}`.toLowerCase();
      return (
        (!q || hay.includes(q)) &&
        (!game || c.game === game) &&
        (!setName || c.set === setName) &&
        (!condition || c.condition === condition) &&
        (!language || c.language === language) &&
        (!foil || (foil === "si" ? c.foil : !c.foil)) &&
        matchesPrice(c.price, price)
      );
    });
    const byPrice = (a: Card, b: Card) => (a.price ?? Infinity) - (b.price ?? Infinity);
    switch (sort) {
      case "price-asc": return list.sort(byPrice);
      case "price-desc": return list.sort((a, b) => byPrice(b, a));
      case "recent": return list.sort((a, b) => (b.createdAt ?? b.updatedAt ?? "").localeCompare(a.createdAt ?? a.updatedAt ?? ""));
      default: return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [cards, search, game, setName, condition, language, foil, price, sort]);

  const reset = () => {
    setSearch("");
    setGame("");
    setSetName("");
    setCondition("");
    setLanguage("");
    setFoil("");
    setPrice("");
  };

  const hasFilters = Boolean(search || game || setName || condition || language || foil || price);
  const panelCount = [game, setName, condition, language, foil, price].filter(Boolean).length;

  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (search) chips.push({ key: "q", label: search, clear: () => setSearch("") });
  if (game) chips.push({ key: "game", label: game, clear: () => setGame("") });
  if (setName) chips.push({ key: "set", label: setName, clear: () => setSetName("") });
  if (condition) chips.push({ key: "cond", label: condition, clear: () => setCondition("") });
  if (language) chips.push({ key: "lang", label: language, clear: () => setLanguage("") });
  if (foil) chips.push({ key: "foil", label: foil === "si" ? "Solo foil" : "Senza foil", clear: () => setFoil("") });
  if (price) chips.push({ key: "price", label: PRICE_LABEL[price], clear: () => setPrice("") });

  const newArrivals = useMemo(() => {
    if (hasFilters || cards.length < NEW_ARRIVALS.minCatalog) return [];
    return cards
      .filter((c) => c.createdAt)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, NEW_ARRIVALS.count);
  }, [cards, hasFilters]);

  const shown = filtered.slice(0, visible);
  const inList = (c: Card) => wishlist.items.find((i) => i.id === c.id)?.qty ?? 0;

  const priceButtons = (Object.keys(PRICE_LABEL) as Exclude<PriceBand, "">[]).map((band) => (
    <button
      key={band}
      type="button"
      className={`price-band ${price === band ? "is-on" : ""}`}
      aria-pressed={price === band}
      onClick={() => setPrice(price === band ? "" : band)}
    >
      {PRICE_LABEL[band]}
    </button>
  ));

  return (
    <section className="section" id="catalogo">
      <div className="container">
        <h2 className="section__title">Catalogo</h2>
        <p className="section__lead">Disponibilità, prezzi e condizioni aggiornati in tempo reale.</p>

        {demo && (
          <div className="notice">
            Modalità demo: Supabase non è ancora collegato. Compila il file <code>.env</code> per vedere le tue carte.
          </div>
        )}
        {error && <div className="notice notice--error">Impossibile caricare le carte: {error}</div>}

        {newArrivals.length > 0 && (
          <div className="arrivals">
            <h3 className="arrivals__title">Ultimi arrivi</h3>
            <div className="strip">
              {newArrivals.map((c) => <CardItem key={c.id} card={c} onOpen={(card) => setCardId(card.id)} />)}
            </div>
          </div>
        )}

        <div className="filters">
          <input
            className="filters__search"
            type="search"
            placeholder="Cerca nome, espansione o numero…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="btn btn--outline filters__toggle" onClick={() => setSheet(true)}>
            Filtri{panelCount > 0 ? ` (${panelCount})` : ""}
          </button>

          {sheet && <button type="button" className="filters__backdrop" aria-label="Chiudi filtri" onClick={() => setSheet(false)} />}

          <div className={`filters__more ${sheet ? "is-open" : ""}`}>
            <p className="filters__sheet-title">Filtri</p>
            {games.length > 0 && (
              <select value={game} onChange={(e) => setGame(e.target.value)} aria-label="Gioco">
                <option value="">Tutti i giochi</option>
                {games.map((g) => <option key={g}>{g}</option>)}
              </select>
            )}
            {sets.length > 0 && (
              <select value={setName} onChange={(e) => setSetName(e.target.value)} aria-label="Espansione">
                <option value="">Tutte le espansioni</option>
                {sets.map((g) => <option key={g}>{g}</option>)}
              </select>
            )}
            <select value={condition} onChange={(e) => setCondition(e.target.value)} aria-label="Condizione">
              <option value="">Ogni condizione</option>
              {conditions.map((g) => <option key={g}>{g}</option>)}
            </select>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Lingua">
              <option value="">Ogni lingua</option>
              {languages.map((g) => <option key={g}>{g}</option>)}
            </select>
            <select value={foil} onChange={(e) => setFoil(asFoil(e.target.value))} aria-label="Foil">
              <option value="">Foil e non</option>
              <option value="si">Solo foil</option>
              <option value="no">Senza foil</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordina">
              <option value="name">Nome A–Z</option>
              <option value="price-asc">Prezzo ↑</option>
              <option value="price-desc">Prezzo ↓</option>
              <option value="recent">Più recenti</option>
            </select>
            <div className="price-bands">{priceButtons}</div>
            <button type="button" className="btn btn--primary filters__apply" onClick={() => setSheet(false)}>
              Mostra {filtered.length} {filtered.length === 1 ? "risultato" : "risultati"}
            </button>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="chips">
            {chips.map((chip) => (
              <button key={chip.key} type="button" className="chip" onClick={chip.clear}>
                {chip.label} ×
              </button>
            ))}
          </div>
        )}

        <div className="results-bar">
          <span>{filtered.length} {filtered.length === 1 ? "risultato" : "risultati"}</span>
          <span className="results-bar__actions">
            <button className="link" onClick={() => setShowGuide(true)}>Guida alle condizioni</button>
            {hasFilters && <button className="link" onClick={reset}>Azzera filtri</button>}
          </span>
        </div>

        {loading ? (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, i) => <div className="card card--skeleton" key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="empty">Nessuna carta trovata. 👻</p>
        ) : (
          <>
            <div className="grid">
              {shown.map((c) => <CardItem key={c.id} card={c} onOpen={(card) => setCardId(card.id)} />)}
            </div>
            {filtered.length > shown.length && (
              <div className="more">
                <button className="btn btn--outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Carica altre ({filtered.length - shown.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <CardModal
          card={selected}
          onClose={() => setCardId("")}
          onAdd={wishlist.add}
          inList={inList(selected)}
        />
      )}
      {showGuide && <ConditionGuide present={conditions} onClose={() => setShowGuide(false)} />}
    </section>
  );
}
