import type { Noticia, Categoria, DudaRespuesta } from '../types';
import { NOTICIAS_INICIALES } from '../data/noticias';
import { supabase } from './supabase';

type NoticiaRow = {
  id: string;
  tema_id: string;
  titulo: string;
  resumen_sencillo: string;
  contenido: string;
  imagen_url: string | null;
  organismo_fuente: string | null;
  estado_evidencia: string;
  pasos_actuar: string | null;
  fecha_publicacion: string;
};

function parsePasosActuar(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0);
}

function mapNoticiaFromDB(row: NoticiaRow, temaMap: Record<string, string>): Noticia {
  const nombreTema = temaMap[row.tema_id] ?? 'España';
  return {
    id: row.id,
    titulo: row.titulo,
    categorias: [nombreTema as Categoria],
    resumenSencillo: row.resumen_sencillo,
    contenido: row.contenido,
    imagenUrl: row.imagen_url ?? '',
    imagenAlt: row.titulo,
    organismoFuente: row.organismo_fuente ?? '',
    estadoEvidencia: (row.estado_evidencia as Noticia['estadoEvidencia']) ?? 'Verificada',
    pasosActuar: parsePasosActuar(row.pasos_actuar),
    fechaPublicacion: row.fecha_publicacion,
    likesIniciales: 0,
  };
}

export async function fetchNoticias(): Promise<Noticia[]> {
  const { data: temasData } = await supabase
    .from('temas')
    .select('id, nombre');

  const temaMap: Record<string, string> = {};
  if (temasData) {
    for (const tema of temasData) {
      temaMap[tema.id] = tema.nombre;
    }
  }

  const { data, error } = await supabase
    .from('noticias')
    .select('id,tema_id,titulo,resumen_sencillo,contenido,imagen_url,organismo_fuente,estado_evidencia,pasos_actuar,fecha_publicacion');

  if (error || !data || data.length === 0) {
    return NOTICIAS_INICIALES;
  }

  return (data as NoticiaRow[]).map(row => mapNoticiaFromDB(row, temaMap));
}

export async function fetchNoticiaById(id: string): Promise<Noticia | null> {
  const local = NOTICIAS_INICIALES.find(n => n.id === id);
  if (local) return local;

  const { data: temasData } = await supabase
    .from('temas')
    .select('id, nombre');

  const temaMap: Record<string, string> = {};
  if (temasData) {
    for (const tema of temasData) {
      temaMap[tema.id] = tema.nombre;
    }
  }

  const { data, error } = await supabase
    .from('noticias')
    .select('id,tema_id,titulo,resumen_sencillo,contenido,imagen_url,organismo_fuente,estado_evidencia,pasos_actuar,fecha_publicacion')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return mapNoticiaFromDB(data as NoticiaRow, temaMap);
}

export async function fetchDudasByNoticiaId(noticiaId: string): Promise<DudaRespuesta[]> {
  const { data, error } = await supabase
    .from('dudas_respuestas')
    .select('*')
    .eq('noticia_id', noticiaId)
    .order('orden');

  if (error || !data) return [];

  return data.map(row => ({
    id: row.id,
    noticiaId: row.noticia_id,
    preguntaOriginal: row.pregunta_original,
    respuestaClara: row.respuesta_clara,
    requisitos: row.requisitos ?? undefined,
    enlaceOficial: row.enlace_oficial ?? undefined,
    orden: row.orden,
  }));
}
