import CardFill from "./components/CardFill";
import Catalog from "./components/Catalog";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import WishlistPanel from "./components/WishlistPanel";
import { useCards } from "./hooks/useCards";
import { useWishlist } from "./hooks/useWishlist";

function isCardFillPage() {
  return window.location.pathname.replace(/\/$/, "") === "/carica";
}

export default function App() {
  if (isCardFillPage()) {
    return (
      <>
        <Header />
        <main>
          <CardFill />
        </main>
        <Footer />
      </>
    );
  }
  return <Showcase />;
}

function Showcase() {
  const { cards, loading, error, demo } = useCards();
  const wishlist = useWishlist();

  const totalCopies = cards.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <>
      <Header />
      <main>
        <Hero totalCards={cards.length} totalCopies={totalCopies} />
        <Catalog cards={cards} loading={loading} error={error} demo={demo} wishlist={wishlist} />
      </main>
      <Footer />
      <WishlistPanel wishlist={wishlist} />
    </>
  );
}
