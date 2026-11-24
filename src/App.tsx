import { useState } from 'react';
import styles from './App.module.css';
import { Header } from './components/Header/Header';
import { SearchBar } from './components/SearchBar/SearchBar';
import { NewsSection } from './components/NewsSection/NewsSection';
import { IncibeFooter } from './components/IncibeFooter/IncibeFooter';
import { AccessibilityModal } from './components/Modals/AccessibilityModal';
import { AccountModal } from './components/Modals/AccountModal';
import { useNewsFilter } from './hooks/useNewsFilter';
import { useNavigation } from './context/NavigationContext';
import { NoticiaPage, RespuestaPage } from './pages';

export function App() {
  const { pantalla, params, navegar, volver } = useNavigation();
  const {
    searchQuery,
    setSearchQuery,
    selectedTopics,
    toggleTopic,
    clearTopics,
    resetAll,
    filteredNews,
    likedMap,
    likeCounts,
    toggleLike,
    isFiltered,
  } = useNewsFilter();

  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const likedCountTotal = Object.values(likedMap).filter(Boolean).length;

  const handleVolver = () => {
    if (pantalla !== 'inicio') {
      volver();
    } else if (isFiltered) {
      resetAll();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.appContainer}>
      <a href="#main-content" className={styles.skipLink}>
        Saltar al contenido principal
      </a>

      <div className={styles.mobileFrame}>
        {pantalla === 'inicio' && (
          <>
            <div className={styles.stickyTopZone}>
              <Header
                onOpenAccessibility={() => setIsAccessibilityOpen(true)}
                onOpenAccount={() => setIsAccountOpen(true)}
                onVolver={handleVolver}
                showVolver={true}
              />
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                resultCount={filteredNews.length}
              />
            </div>

            <NewsSection
              news={filteredNews}
              likedMap={likedMap}
              likeCounts={likeCounts}
              onToggleLike={toggleLike}
              onReadNews={(noticia) => navegar('noticia', { noticiaId: noticia.id })}
              selectedTopics={selectedTopics}
              onToggleTopic={toggleTopic}
              onClearTopics={clearTopics}
              onResetAll={resetAll}
              searchQuery={searchQuery}
            />

            <IncibeFooter />
          </>
        )}

        {pantalla === 'noticia' && params.noticiaId && (
          <NoticiaPage
            noticiaId={params.noticiaId}
            onVolver={volver}
            onOpenAccessibility={() => setIsAccessibilityOpen(true)}
            onOpenAccount={() => setIsAccountOpen(true)}
            onToggleLike={toggleLike}
            likedMap={likedMap}
            likeCounts={likeCounts}
            onNavigateToDudas={(id) => navegar('respuesta', { noticiaId: id })}
          />
        )}

        {pantalla === 'respuesta' && params.noticiaId && (
          <RespuestaPage
            noticiaId={params.noticiaId}
            preguntaOriginal={params.pregunta}
            onVolver={volver}
            onOpenAccessibility={() => setIsAccessibilityOpen(true)}
            onOpenAccount={() => setIsAccountOpen(true)}
            onToggleLike={toggleLike}
            likedMap={likedMap}
            likeCounts={likeCounts}
          />
        )}

        {/* Diálogos y modales accesibles */}
        <AccessibilityModal
          isOpen={isAccessibilityOpen}
          onClose={() => setIsAccessibilityOpen(false)}
        />

        <AccountModal
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          savedLikesCount={likedCountTotal}
        />
      </div>
    </div>
  );
}

export default App;
