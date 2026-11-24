import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NOTICIAS_INICIALES } from '../../data/noticias';
import { Header } from '../../components/Header/Header';
import { IncibeFooter } from '../../components/IncibeFooter/IncibeFooter';
import { LikeButton } from '../../components/LikeButton/LikeButton';
import styles from './NoticiaPage.module.css';

interface NoticiaPageProps {
  noticiaId: string;
  onVolver: () => void;
  onOpenAccessibility: () => void;
  onOpenAccount: () => void;
  onToggleLike: (id: string) => void;
  likedMap: Record<string, boolean>;
  likeCounts: Record<string, number>;
  onNavigateToDudas: (noticiaId: string) => void;
}

export const NoticiaPage: React.FC<NoticiaPageProps> = ({
  noticiaId,
  onVolver,
  onOpenAccessibility,
  onOpenAccount,
  onToggleLike,
  likedMap,
  likeCounts,
  onNavigateToDudas,
}) => {
  const noticia = NOTICIAS_INICIALES.find((n) => n.id === noticiaId) ?? NOTICIAS_INICIALES[0];

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isReading, setIsReading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [noticiaId]);

  // Cleanup speech on unmount or noticia change
  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [noticiaId, speechSupported]);

  const handleLeer = useCallback(() => {
    if (!speechSupported) return;

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const textoCompleto = [
      noticia.titulo,
      noticia.resumenSencillo,
      noticia.contenido,
      ...(noticia.pasosActuar ?? []),
    ].join('. ');

    const utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  }, [isReading, noticia, speechSupported]);

  const handleCompartirWhatsApp = useCallback(() => {
    const texto = noticia.enlaceOficial
      ? `${noticia.titulo} ${noticia.enlaceOficial}`
      : noticia.titulo;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [noticia]);

  const likeCount = likeCounts[noticia.id] ?? noticia.likesIniciales;
  const isLiked = likedMap[noticia.id] ?? false;

  // Parse contenido into paragraphs
  const contenidoParrafos = noticia.contenido.split('\n\n').filter(Boolean);

  return (
    <div className={styles.page}>
      <Header
        onOpenAccessibility={onOpenAccessibility}
        onOpenAccount={onOpenAccount}
        onVolver={onVolver}
        showVolver={true}
      />

      <main className={styles.scrollContent} id="main-content" tabIndex={-1}>
        {/* Categorías */}
        {noticia.categorias.length > 0 && (
          <div className={styles.categorias} aria-label="Categorías de la noticia">
            {noticia.categorias.map((cat) => (
              <span key={cat} className={styles.categoriaPill}>
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Titular */}
        <h1 className={styles.titulo}>{noticia.titulo}</h1>

        {/* Resumen/Subtítulo */}
        <p className={styles.subtitulo}>{noticia.resumenSencillo}</p>

        {/* Imagen */}
        {noticia.imagenUrl && (
          <div className={styles.imagenWrapper}>
            <img
              src={noticia.imagenUrl}
              alt={noticia.imagenAlt}
              className={styles.imagen}
            />
          </div>
        )}

        {/* Me gusta */}
        <div className={styles.likeWrapper}>
          <LikeButton
            newsId={noticia.id}
            isLiked={isLiked}
            count={likeCount}
            onToggle={onToggleLike}
            newsTitle={noticia.titulo}
          />
        </div>

        {/* Bloque estado de información */}
        <div className={styles.infoBloque} role="region" aria-label="Información sobre la fuente">
          <div className={styles.infoFuente}>
            {/* file-check-2 icon SVG (Lucide) */}
            <svg
              className={styles.infoIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="m9 15 2 2 4-4" />
            </svg>
            <span className={styles.infoOrganismo}>{noticia.organismoFuente}</span>
          </div>
          <p className={styles.infoEstado}>
            Estado de evidencia:{' '}
            <strong>{noticia.estadoEvidencia}</strong>
          </p>
        </div>

        {/* Herramientas de lectura */}
        <div className={styles.herramientas} role="group" aria-label="Herramientas de lectura">
          <button
            type="button"
            className={styles.btnPrimario}
            onClick={handleLeer}
            disabled={!speechSupported}
            aria-label={
              !speechSupported
                ? 'Lectura en voz alta no disponible en este navegador'
                : isReading
                ? 'Detener lectura en voz alta'
                : 'Escuchar esta noticia en voz alta'
            }
            aria-pressed={isReading}
          >
            {/* volume-2 icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span>{isReading ? 'Detener lectura' : 'Escuchar en voz alta'}</span>
          </button>

          <button
            type="button"
            className={styles.btnSecundario}
            onClick={onOpenAccessibility}
            aria-label="Cambiar el tamaño de la letra"
          >
            {/* type icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </svg>
            <span>Tamaño de letra</span>
          </button>

          <button
            type="button"
            className={styles.btnSecundario}
            onClick={handleCompartirWhatsApp}
            aria-label="Compartir esta noticia por WhatsApp"
          >
            {/* message-circle icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Compartir por WhatsApp</span>
          </button>
        </div>

        {/* Sección: Qué está pasando */}
        <section className={styles.seccion} aria-labelledby="seccion-que-pasa">
          <h2 id="seccion-que-pasa" className={styles.seccionH2}>
            Qué está pasando
          </h2>
          {contenidoParrafos.map((parrafo, idx) => (
            <p key={idx} className={styles.seccionParrafo}>
              {parrafo}
            </p>
          ))}
        </section>

        {/* Sección: Qué significa para ti */}
        <section className={styles.seccion} aria-labelledby="seccion-significa">
          <h2 id="seccion-significa" className={styles.seccionH2}>
            Qué significa para ti
          </h2>
          <p className={styles.seccionParrafo}>{noticia.resumenSencillo}</p>
        </section>

        {/* Sección: Qué puedes hacer ahora */}
        {noticia.pasosActuar && noticia.pasosActuar.length > 0 && (
          <section className={styles.seccion} aria-labelledby="seccion-pasos">
            <h2 id="seccion-pasos" className={styles.seccionH2}>
              Qué puedes hacer ahora
            </h2>
            <ol className={styles.pasosList}>
              {noticia.pasosActuar.map((paso, idx) => (
                <li key={idx} className={styles.paso}>
                  <h3 className={styles.pasoTitulo}>{idx + 1}. Paso {idx + 1}</h3>
                  <p className={styles.pasoDesc}>{paso}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Bloque: ¿Te queda alguna duda? */}
        <div className={styles.dudas} role="complementary" aria-label="Sección de dudas">
          <h2 className={styles.dudasTitulo}>¿Te queda alguna duda?</h2>
          <p className={styles.dudasDesc}>
            Puedes preguntarnos cualquier cosa sobre esta noticia. Te daremos una respuesta clara y sencilla.
          </p>
          <button
            type="button"
            className={styles.dudasBtn}
            onClick={() => onNavigateToDudas(noticia.id)}
            aria-label="Ir a la pantalla para preguntar sobre esta noticia"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Preguntar sobre esta noticia</span>
          </button>
        </div>
      </main>

      <IncibeFooter />
    </div>
  );
};
