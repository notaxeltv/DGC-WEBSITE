import { useState } from "react";
import Catalog from "./components/Catalog";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import IntroVideo, { introAlreadySeen } from "./components/IntroVideo";
import WishlistPanel from "./components/WishlistPanel";
import { useCards } from "./hooks/useCards";
import { useWishlist } from "./hooks/useWishlist";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !introAlreadySeen());
  const { cards, loading, error, demo } = useCards();
  const wishlist = useWishlist();

  const totalCopies = cards.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <>
      {showIntro && <IntroVideo onDone={() => setShowIntro(false)} />}
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
