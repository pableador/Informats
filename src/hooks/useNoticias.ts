import { useState, useEffect, useCallback } from 'react';
import type { Noticia } from '../types';
import { fetchNoticias } from '../services/noticias.service';
import { NOTICIAS_INICIALES } from '../data/noticias';

export function useNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>(NOTICIAS_INICIALES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNoticias();
      setNoticias(data);
      setError(null);
    } catch (e) {
      console.warn('Supabase fetch failed, using local data:', e);
      setNoticias(NOTICIAS_INICIALES);
      setError('Usando datos locales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { noticias, loading, error, refetch: load };
}
