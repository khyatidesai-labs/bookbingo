import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReadingShelf from './components/ReadingShelf';
import NewLaunchesSection from './components/NewLaunchesSection';
import TrendingNow from './components/TrendingNow';
import DiscoverSection from './components/DiscoverSection';
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
  const { openedBookId, closeBook, savedDrawerOpen, closeSavedDrawer, dynamicBook } = useApp();
  const book = openedBookId
    ? (BOOK_BY_ID[openedBookId] ?? dynamicBook ?? null)
    : null;
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
      <div className="min-h-screen bg-primary-50 font-body">
        <Navbar />
        <Hero />
        <ReadingShelf />
        <NewLaunchesSection />
        <TrendingNow />
        <DiscoverSection />
        <BingoSection />
        <CommunitySection />
        <FeaturedCollections />
        <Footer />
        <GlobalOverlays />
      </div>
    </AppProvider>
  );
}
