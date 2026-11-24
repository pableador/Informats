export type Categoria =
  | 'España'
  | 'Internacional'
  | 'Valencia'
  | 'Economía'
  | 'Mundo Digital'
  | 'Deporte'
  | 'Política'
  | 'Cultura'
  | 'Sociedad'
  | 'Salud'
  | 'Trámites';

export interface Noticia {
  id: string;
  titulo: string;
  categorias: Categoria[];
  resumenSencillo: string;
  contenido: string;
  imagenUrl: string;
  imagenAlt: string;
  organismoFuente: string;
  estadoEvidencia: 'Verificada' | 'En revisión' | 'Oficial';
  pasosActuar?: string[];
  enlaceOficial?: string;
  fechaPublicacion: string;
  likesIniciales: number;
}

export type TamanoLetra = 'mediana' | 'grande' | 'muy_grande';

export interface PreferenciasAccesibilidad {
  tamanoLetra: TamanoLetra;
  altoContraste: boolean;
  lecturaAsistida: boolean;
  velocidadVoz: number;
}

export interface UsuarioDemo {
  id: string;
  nombre: string;
  email: string;
  noticiasGuardadas: string[];
}

export interface DudaRespuesta {
  id: string;
  noticiaId: string;
  preguntaOriginal: string;
  respuestaClara: string;
  requisitos?: string;
  enlaceOficial?: string;
  orden: number;
}
