import React, { createContext, useCallback, useContext, useState } from 'react';

export type PantallaId = 'inicio' | 'noticia' | 'respuesta' | 'accesibilidad';
export interface NavParams { noticiaId?: string; pregunta?: string; }
interface NavEntry { pantalla: PantallaId; params: NavParams; }

interface NavigationContextValue {
  pantalla: PantallaId;
  params: NavParams;
  navegar: (destino: PantallaId, params?: NavParams) => void;
  volver: () => void;
  puedeVolver: boolean;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<NavEntry[]>([{ pantalla: 'inicio', params: {} }]);
  const current = history[history.length - 1];

  const navegar = useCallback((destino: PantallaId, params: NavParams = {}) => {
    window.scrollTo(0, 0);
    setHistory(h => [...h, { pantalla: destino, params }]);
  }, []);

  const volver = useCallback(() => {
    setHistory(h => h.length > 1 ? h.slice(0, -1) : h);
  }, []);

  return (
    <NavigationContext.Provider value={{
      pantalla: current.pantalla,
      params: current.params,
      navegar,
      volver,
      puedeVolver: history.length > 1,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
