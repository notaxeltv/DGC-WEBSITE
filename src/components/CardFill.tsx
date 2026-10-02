import { useState } from "react";
import { CONDITION_LABELS } from "../config";
import { lookupCardByCode, type CardDraft } from "../lib/cardLookup";

const REVERSE = [
  { value: "", label: "Non reverse" },
  { value: "reverse", label: "Reverse" },
  { value: "stamped", label: "Stamped" },
];

export default function CardFill() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [expansion, setExpansion] = useState("");
  const [expansionCode, setExpansionCode] = useState("");
  const [number, setNumber] = useState("");
  const [rarity, setRarity] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [language, setLanguage] = useState("ITA");
  const [condition, setCondition] = useState("NM");
  const [foil, setFoil] = useState(false);
  const [reverse, setReverse] = useState("");

  function apply(card: CardDraft) {
    setName(card.name);
    setExpansion(card.setName);
    setExpansionCode(card.setCode);
    setNumber(card.number);
    setRarity(card.rarity);
    setImage(card.imageUrl);
    setFoil(false);
    setReverse("");
    setNote(
      "Dati compilati dal codice. Il nome è quello inglese: cambialo se la copia è in un'altra lingua. Foil e reverse non si deducono dal codice.",
    );
  }

  async function lookup() {
    const value = code.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    setNote(null);
    setCopied(false);
    const result = await lookupCardByCode(value);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    apply(result.card);
  }

  async function copy() {
    const text = [
      `Nome: ${name}`,
      `Set: ${expansion}`,
      `Codice set: ${expansionCode}`,
      `Numero: ${number}`,
      `Rarità: ${rarity}`,
      `Lingua: ${language}`,
      `Condizione: ${condition}`,
      `Foil: ${foil ? "sì" : "no"}`,
      `Reverse: ${reverse || "no"}`,
      image ? `Immagine: ${image}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      window.prompt("Copia i dati:", text);
    }
  }

  const ready = Boolean(name);

  return (
    <section className="section">
      <div className="container card-fill">
        <h1 className="section__title">Compila una carta</h1>
        <p className="section__lead">
          Inserisci il codice del set e il numero. I dati si compilano da soli e puoi correggerli prima di copiarli nel gestionale.
        </p>

        <form
          className="filters card-fill__form"
          onSubmit={(event) => {
            event.preventDefault();
            void lookup();
          }}
        >
          <input
            className="filters__search"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="es. PAL 193, sv2-193, TRR-15"
            aria-label="Codice carta"
            autoComplete="off"
          />
          <button className="btn btn--primary" type="submit" disabled={loading || !code.trim()}>
            {loading ? "Cerco..." : "Compila"}
          </button>
        </form>

        {error && <p className="notice notice--error">{error}</p>}
        {note && <p className="notice">{note}</p>}

        <div className="card-fill__grid">
          {image && <img className="card-fill__image" src={image} alt={name || "Carta"} />}
          <div className="filters card-fill__fields">
            <label>
              Nome
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Espansione
              <input value={expansion} onChange={(event) => setExpansion(event.target.value)} />
            </label>
            <label>
              Codice set
              <input value={expansionCode} onChange={(event) => setExpansionCode(event.target.value)} />
            </label>
            <label>
              Numero
              <input value={number} onChange={(event) => setNumber(event.target.value)} />
            </label>
            <label>
              Rarità
              <input value={rarity} onChange={(event) => setRarity(event.target.value)} />
            </label>
            <label>
              Lingua
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="ITA">Italiano</option>
                <option value="ENG">Inglese</option>
                <option value="JAP">Giapponese</option>
              </select>
            </label>
            <label>
              Condizione
              <select value={condition} onChange={(event) => setCondition(event.target.value)}>
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{value} – {label}</option>
                ))}
              </select>
            </label>
            <label>
              Reverse
              <select value={reverse} onChange={(event) => setReverse(event.target.value)}>
                {REVERSE.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="card-fill__check">
              <input type="checkbox" checked={foil} onChange={(event) => setFoil(event.target.checked)} />
              Foil sull'illustrazione
            </label>
          </div>
        </div>

        <div className="card-fill__actions">
          <button className="btn btn--primary" type="button" onClick={() => void copy()} disabled={!ready}>
            {copied ? "Dati copiati" : "Copia i dati"}
          </button>
          <a className="btn btn--outline" href="/">Torna al sito</a>
        </div>
      </div>
    </section>
  );
}
