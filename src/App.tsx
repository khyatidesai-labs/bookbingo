import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReadingShelf from './components/ReadingShelf';
import TrendingNow from './components/TrendingNow';
import ProfessionCategories from './components/ProfessionCategories';
import MoodSection from './components/MoodSection';
import BingoSection from './components/BingoSection';
import CommunitySection from './components/CommunitySection';
import FeaturedCollections from './components/FeaturedCollections';
import Footer from './components/Footer';
import BookDetailModal from './components/BookDetailModal';
import SavedBooksDrawer from './components/SavedBooksDrawer';
import AuthModal from './components/AuthModal';
import { AppProvider, useApp } from './context/AppContext';
import { BOOK_BY_ID } from './data/books';

function GlobalOverlays() {
  const { openedBookId, closeBook, savedDrawerOpen, closeSavedDrawer } = useApp();
  const book = openedBookId ? BOOK_BY_ID[openedBookId] ?? null : null;
  return (
    <>
      <BookDetailModal book={book} onClose={closeBook} />
      <SavedBooksDrawer open={savedDrawerOpen} onClose={closeSavedDrawer} />
      <AuthModal />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F8FAFC] font-body">
        <Navbar />
        <Hero />
        <ReadingShelf />
        <TrendingNow />
        <ProfessionCategories />
        <MoodSection />
        <BingoSection />
        <CommunitySection />
        <FeaturedCollections />
        <Footer />
        <GlobalOverlays />
      </div>
    </AppProvider>
  );
}
