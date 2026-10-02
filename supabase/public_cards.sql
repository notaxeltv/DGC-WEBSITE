-- ============================================================
-- Vista pubblica per il sito vetrina (Dark Ghost Cards)
-- Esegui in Supabase -> SQL Editor.
--
-- La vista espone SOLO i dati da mostrare ai visitatori.
-- NON include: purchase_price, purchase_date, purchase_source,
--              notes, owner_id, updated_by, purchase_id.
--
-- Se hai GIA' creato la vista, puoi rieseguire questo script per
-- aggiornarla (aggiunge created_at e, se vuoi, il gioco).
-- ============================================================

-- 1) Se in precedenza hai creato una policy pubblica sulla tabella, rimuovila
--    (altrimenti i dati riservati restano leggibili da chiunque):
drop policy if exists "Lettura pubblica carte" on public.cards;

-- ------------------------------------------------------------
-- PASSO A (FACOLTATIVO) - filtro per gioco sul sito
-- Il database non ha una colonna "gioco". Per usarla:
--   1. esegui UNA VOLTA questa riga:
--        alter table public.cards add column if not exists game text;
--   2. compila la colonna per le tue carte, ad esempio:
--        update public.cards set game = 'Pokémon' where set_code in ('...');
--      (oppure da Table Editor, riga per riga)
--   3. togli i due trattini davanti a "game," nella vista qui sotto.
-- Finche' non lo fai, il filtro per gioco resta nascosto sul sito.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- PASSO B - link diretti alla singola carta sui marketplace
-- Aggiunge 4 colonne di testo (vuote) alla tabella. Non toccano i dati esistenti.
-- Dopo averle create, incolla il link dell'annuncio nella colonna giusta
-- (da Table Editor, riga per riga) e il sito mostrerà il pulsante solo per i
-- marketplace compilati. Sono accettati solo link che iniziano con http(s)://
-- ------------------------------------------------------------
alter table public.cards add column if not exists cardtrader_url text;
alter table public.cards add column if not exists cardmarket_url text;
alter table public.cards add column if not exists vinted_url text;
alter table public.cards add column if not exists ebay_url text;

-- ------------------------------------------------------------
-- PASSO C - rarità e tipo di reverse
-- Due colonne di testo, vuote. Non modificano le carte già caricate.
-- Rarità: il nome usato da CardMarket, in italiano o in inglese
--   (es. "Holo Rare", "Rara olografica", "Illustration Rare", "Ultra Rare").
--   La rara olografica è una rarità: il foil sta sull'illustrazione.
--
-- reverse_style, solo uno di questi valori (o vuoto):
--   epoca    Timbro del logo/nome del set dentro l'illustrazione.
--            Vale da EX Team Rocket Returns e per i set EX successivi
--            con lo stesso timbro (Deoxys, Emerald, Unseen Forces...).
--            Non è il set Team Rocket del 2000, che non aveva queste reverse.
--   moderna  Da Scarlet e Violet in poi, quindi anche Evoluzioni a Paldea:
--            il foil è sul corpo della carta (motivo a ciottoli e simboli
--            del tipo), non un timbro del set. Restano "moderna" anche le
--            reverse più recenti a Poké Ball, Master Ball o simboli energia.
--   generica È una reverse, ma di un altro motivo (es. i fuochi d'artificio
--            della Legendary Collection) oppure il tipo non è ancora indicato.
--   vuoto    Non è una reverse.
-- Non scrivere la reverse in is_foil: quel campo resta il foil sull'arte.
-- ------------------------------------------------------------
alter table public.cards add column if not exists rarity text;
alter table public.cards add column if not exists reverse_style text;

-- 2) Crea (o ricrea) la vista.
--    Lo status delle carte in vendita nel tuo database e' 'in_stock'.
--    (per controllare i valori: select status, count(*) from public.cards group by status;)
drop view if exists public.public_cards;

create view public.public_cards as
select
  id,
  name,
  set_name,
  set_code,
  number,
  language,
  condition,
  is_foil,
  is_japanese,
  rarity,                                                -- rarità (PASSO C)
  reverse_style,                                         -- epoca | moderna | generica (PASSO C)
  -- game,                                               -- <-- PASSO A: togli "--" dopo averlo fatto
  coalesce(target_price, current_market_price) as price,  -- prezzo mostrato sul sito
  image_url,
  created_at,                                            -- serve per "Ultimi arrivi"
  updated_at,
  cardtrader_url,                                        -- link agli annunci (PASSO B)
  cardmarket_url,
  vinted_url,
  ebay_url
from public.cards
where status = 'in_stock';

-- 3) Permessi: i visitatori (anon) possono solo leggere la vista.
grant select on public.public_cards to anon, authenticated;

-- ------------------------------------------------------------
-- Verifica finale (deve mostrare solo le carte in vendita,
-- senza prezzi d'acquisto o note):
--   select * from public.public_cards limit 5;
-- ------------------------------------------------------------
