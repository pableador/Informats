import React, { useState, useRef, useEffect } from 'react';
import styles from './RespuestaPage.module.css';
import { NOTICIAS_INICIALES } from '../../data/noticias';
import { Header } from '../../components/Header/Header';
import { IncibeFooter } from '../../components/IncibeFooter/IncibeFooter';
import { LikeButton } from '../../components/LikeButton/LikeButton';

interface RespuestaPageProps {
  noticiaId: string;
  preguntaOriginal?: string;
  onVolver: () => void;
  onOpenAccessibility: () => void;
  onOpenAccount: () => void;
  onToggleLike: (id: string) => void;
  likedMap: Record<string, boolean>;
  likeCounts: Record<string, number>;
}

export const RespuestaPage: React.FC<RespuestaPageProps> = ({
  noticiaId,
  preguntaOriginal,
  onVolver,
  onOpenAccessibility,
  onOpenAccount,
  onToggleLike,
  likedMap,
  likeCounts,
}) => {
  const noticia =
    NOTICIAS_INICIALES.find((n) => n.id === noticiaId) ?? NOTICIAS_INICIALES[0];

  // TTS
  const [hablando, setHablando] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Más preguntas
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleEscuchar = () => {
    if (hablando) {
      window.speechSynthesis.cancel();
      setHablando(false);
      return;
    }
    const textoCompleto = [
      preguntaOriginal ?? '',
      noticia.titulo,
      noticia.resumenSencillo,
      noticia.contenido,
      ...(noticia.pasosActuar ?? []),
    ]
      .filter(Boolean)
      .join('. ');

    const utt = new SpeechSynthesisUtterance(textoCompleto);
    utt.lang = 'es-ES';
    utt.onend = () => setHablando(false);
    utt.onerror = () => setHablando(false);
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
    setHablando(true);
  };

  const handleCompartir = () => {
    const url = encodeURIComponent(window.location.href);
    const texto = encodeURIComponent(
      `Mira esta información sobre: ${noticia.titulo}`
    );
    window.open(
      `https://api.whatsapp.com/send?text=${texto}%20${url}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleEnviarPregunta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPregunta.trim()) return;
    setNuevaPregunta('');
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  };

  const isLiked = likedMap[noticia.id] ?? false;
  const likeCount = likeCounts[noticia.id] ?? noticia.likesIniciales;

  return (
    <div className={styles.page}>
      <Header
        onOpenAccessibility={onOpenAccessibility}
        onOpenAccount={onOpenAccount}
        onVolver={onVolver}
        showVolver
      />

      <main id="main-content" className={styles.scrollContent}>
        {/* Bloque pregunta original */}
        <section className={styles.preguntaBloque} aria-label="Tu pregunta">
          <span className={styles.preguntaLabel}>Tu pregunta</span>
          <p className={styles.preguntaTexto}>
            {preguntaOriginal ??
              '¿Tienes más preguntas sobre esta noticia?'}
          </p>
        </section>

        {/* Categorías */}
        {noticia.categorias.length > 0 && (
          <div className={styles.categorias} aria-label="Categorías">
            {noticia.categorias.map((cat) => (
              <span key={cat} className={styles.categoria}>
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Titular H1 */}
        <h1 className={styles.titulo}>{noticia.titulo}</h1>

        {/* Subtítulo / resumen */}
        <p className={styles.subtitulo}>{noticia.resumenSencillo}</p>

        {/* Imagen contextual */}
        <div className={styles.imagenWrapper}>
          <img
            src={noticia.imagenUrl}
            alt={noticia.imagenAlt}
            className={styles.imagen}
          />
        </div>

        {/* Me gusta */}
        <div className={styles.likeRow}>
          <LikeButton
            newsId={noticia.id}
            isLiked={isLiked}
            count={likeCount}
            onToggle={onToggleLike}
            newsTitle={noticia.titulo}
          />
        </div>

        {/* Bloque estado / organismo fuente */}
        <div className={styles.infoBloque} aria-label="Fuente y estado">
          <span className={styles.estadoBadge}>{noticia.estadoEvidencia}</span>
          <span className={styles.organismoFuente}>
            {noticia.organismoFuente}
          </span>
        </div>

        {/* Herramientas de lectura */}
        <div className={styles.herramientas} role="group" aria-label="Herramientas de lectura">
          <button
            type="button"
            className={styles.btnHerramienta}
            onClick={handleEscuchar}
            aria-pressed={hablando}
            aria-label={hablando ? 'Detener lectura en voz alta' : 'Escuchar en voz alta'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{hablando ? 'Detener' : 'Escuchar'}</span>
          </button>

          <button
            type="button"
            className={styles.btnHerramienta}
            onClick={onOpenAccessibility}
            aria-label="Cambiar tamaño de letra"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <text x="2" y="18" fontFamily="serif" fontSize="16" fill="currentColor">A</text>
              <text x="11" y="21" fontFamily="serif" fontSize="20" fill="currentColor">A</text>
            </svg>
            <span>Letra</span>
          </button>

          <button
            type="button"
            className={styles.btnHerramienta}
            onClick={handleCompartir}
            aria-label="Compartir por WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
                fill="currentColor"
              />
              <path
                d="M12 2a10 10 0 0 0-8.593 15.09L2 22l5.09-1.376A10 10 0 1 0 12 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span>Compartir</span>
          </button>
        </div>

        {/* Qué se sabe */}
        <section className={styles.seccion} aria-labelledby="que-se-sabe">
          <h2 id="que-se-sabe" className={styles.seccionH2}>
            Qué se sabe
          </h2>
          <p className={styles.seccionParrafo}>{noticia.contenido}</p>
        </section>

        {/* Qué significa para ti */}
        <section className={styles.seccion} aria-labelledby="que-significa">
          <h2 id="que-significa" className={styles.seccionH2}>
            Qué significa para ti
          </h2>
          <p className={styles.seccionParrafo}>
            Esta información afecta directamente a tu situación. Te recomendamos
            leer los requisitos y los pasos de acción para saber qué puedes
            hacer.
          </p>
        </section>

        {/* Bloque requisitos */}
        <div className={styles.requisitosBloque} role="note" aria-label="Comprueba tu contrato">
          <strong className={styles.requisitosTitulo}>
            Comprueba tu contrato
          </strong>
          <p className={styles.requisitosTexto}>
            Asegúrate de que cumples los requisitos antes de solicitar cualquier
            prestación. Revisa los documentos necesarios y los plazos vigentes.
          </p>
        </div>

        {/* Qué puedes hacer ahora — pasos */}
        {noticia.pasosActuar && noticia.pasosActuar.length > 0 && (
          <section className={styles.seccion} aria-labelledby="que-hacer">
            <h2 id="que-hacer" className={styles.seccionH2}>
              Qué puedes hacer ahora
            </h2>
            <ol className={styles.pasosList}>
              {noticia.pasosActuar.map((paso, idx) => (
                <li key={idx} className={styles.paso}>
                  <span className={styles.pasoNumero}>{idx + 1}</span>
                  <span className={styles.pasoTexto}>{paso}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Enlace oficial */}
        {noticia.enlaceOficial && (
          <div className={styles.enlaceOficialWrapper}>
            <a
              href={noticia.enlaceOficial}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.enlaceOficialBtn}
              aria-label={`Ir al organismo oficial: ${noticia.organismoFuente} (se abre en nueva pestaña)`}
            >
              <span>Ir al organismo oficial</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 17L17 7M17 7H7M17 7v10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Más preguntas */}
        <section className={styles.masPreguntas} aria-labelledby="mas-preguntas-title">
          <h2 id="mas-preguntas-title" className={styles.masPreguntasTitulo}>
            ¿Tienes más preguntas?
          </h2>
          <p className={styles.masPreguntasDesc}>
            Escribe tu duda y te responderemos lo antes posible.
          </p>
          <form onSubmit={handleEnviarPregunta} className={styles.masPreguntasForm}>
            <label htmlFor="nueva-pregunta" className={styles.masPreguntasLabel}>
              Tu pregunta
            </label>
            <textarea
              id="nueva-pregunta"
              className={styles.masPreguntasInput}
              value={nuevaPregunta}
              onChange={(e) => setNuevaPregunta(e.target.value)}
              placeholder="Escribe aquí tu pregunta…"
              rows={3}
              aria-required="true"
            />
            <button
              type="submit"
              className={styles.masPreguntasBtn}
              disabled={!nuevaPregunta.trim()}
            >
              Enviar pregunta
            </button>
          </form>
          {toastVisible && (
            <div
              role="status"
              aria-live="polite"
              className={styles.toastMensaje}
            >
              Gracias, hemos recibido tu pregunta.
            </div>
          )}
        </section>
      </main>

      <IncibeFooter />
    </div>
  );
};

export default RespuestaPage;
