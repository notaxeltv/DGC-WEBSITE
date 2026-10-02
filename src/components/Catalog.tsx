import { useEffect, useMemo, useState } from "react";
import { NEW_ARRIVALS, PAGE_SIZE } from "../config";
import type { Wishlist } from "../hooks/useWishlist";
import type { Card } from "../lib/types";
import CardItem from "./CardItem";
import CardModal from "./CardModal";
import ConditionGuide from "./ConditionGuide";

type Sort = "name" | "price-asc" | "price-desc" | "recent";
const SORTS: Sort[] = ["name", "price-asc", "price-desc", "recent"];

interface Props {
  cards: Card[];
  loading: boolean;
  error: string | null;
  demo: boolean;
  wishlist: Wishlist;
}

const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));

/** Legge i filtri dal link (es. ?q=charizard&gioco=Pokémon) così le ricerche si possono condividere */
function readUrl() {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get("ord") as Sort | null;
  return {
    search: p.get("q") ?? "",
    game: p.get("gioco") ?? "",
    condition: p.get("cond") ?? "",
    language: p.get("lingua") ?? "",
    sort: sort && SORTS.includes(sort) ? sort : ("name" as Sort),
  };
}

export default function Catalog({ cards, loading, error, demo, wishlist }: Props) {
  const initial = useMemo(readUrl, []);
  const [search, setSearch] = useState(initial.search);
  const [game, setGame] = useState(initial.game);
  const [condition, setCondition] = useState(initial.condition);
  const [language, setLanguage] = useState(initial.language);
  const [sort, setSort] = useState<Sort>(initial.sort);
  const [selected, setSelected] = useState<Card | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const games = useMemo(() => unique(cards.map((c) => c.game)), [cards]);
  const conditions = useMemo(() => unique(cards.map((c) => c.condition)), [cards]);
  const languages = useMemo(() => unique(cards.map((c) => c.language)), [cards]);

  // Tiene il link della pagina allineato ai filtri
  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (game) p.set("gioco", game);
    if (condition) p.set("cond", condition);
    if (language) p.set("lingua", language);
    if (sort !== "name") p.set("ord", sort);
    const qs = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
  }, [search, game, condition, language, sort]);

  // Quando cambiano i filtri si riparte dalla prima pagina
  useEffect(() => setVisible(PAGE_SIZE), [search, game, condition, language, sort]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = cards.filter(
      (c) =>
        (!q || `${c.name} ${c.set}`.toLowerCase().includes(q)) &&
        (!game || c.game === game) &&
        (!condition || c.condition === condition) &&
        (!language || c.language === language),
    );
    const byPrice = (a: Card, b: Card) => (a.price ?? Infinity) - (b.price ?? Infinity);
    switch (sort) {
      case "price-asc": return list.sort(byPrice);
      case "price-desc": return list.sort((a, b) => byPrice(b, a));
      case "recent": return list.sort((a, b) => (b.createdAt ?? b.updatedAt ?? "").localeCompare(a.createdAt ?? a.updatedAt ?? ""));
      default: return list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [cards, search, game, condition, language, sort]);

  const reset = () => { setSearch(""); setGame(""); setCondition(""); setLanguage(""); };
  const hasFilters = Boolean(search || game || condition || language);

  const newArrivals = useMemo(() => {
    if (hasFilters || cards.length < NEW_ARRIVALS.minCatalog) return [];
    return cards
      .filter((c) => c.createdAt)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, NEW_ARRIVALS.count);
  }, [cards, hasFilters]);

  const shown = filtered.slice(0, visible);
  const inList = (c: Card) => wishlist.items.find((i) => i.id === c.id)?.qty ?? 0;

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
              {newArrivals.map((c) => <CardItem key={c.id} card={c} onOpen={setSelected} />)}
            </div>
          </div>
        )}

        <div className="filters">
          <input
            className="filters__search"
            type="search"
            placeholder="Cerca una carta o un'espansione…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {games.length > 0 && (
            <select value={game} onChange={(e) => setGame(e.target.value)} aria-label="Gioco">
              <option value="">Tutti i giochi</option>
              {games.map((g) => <option key={g}>{g}</option>)}
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
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordina">
            <option value="name">Nome A–Z</option>
            <option value="price-asc">Prezzo ↑</option>
            <option value="price-desc">Prezzo ↓</option>
            <option value="recent">Più recenti</option>
          </select>
        </div>

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
              {shown.map((c) => <CardItem key={c.id} card={c} onOpen={setSelected} />)}
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
          onClose={() => setSelected(null)}
          onAdd={wishlist.add}
          inList={inList(selected)}
        />
      )}
      {showGuide && <ConditionGuide present={conditions} onClose={() => setShowGuide(false)} />}
    </section>
  );
}
