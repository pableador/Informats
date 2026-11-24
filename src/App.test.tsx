import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from './App';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { NavigationProvider } from './context/NavigationContext';

function renderApp() {
  return render(
    <AccessibilityProvider>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </AccessibilityProvider>
  );
}

describe('Informats - Pantalla «Inicio · Hoy, con claridad»', () => {
  it('renders all 4 news cards initially', () => {
    renderApp();

    expect(screen.getByText('¿Qué está pasando?')).toBeInTheDocument();
    expect(screen.getByText('Revisa nuestra selección de noticias:')).toBeInTheDocument();

    expect(screen.getByText('SMS de tu banco: señales de alerta y cómo protegerte')).toBeInTheDocument();
    expect(screen.getByText('Tu pensión por internet: dónde consultar tus datos')).toBeInTheDocument();
    expect(screen.getByText('Bono social de la luz: requisitos y pasos para pedirlo')).toBeInTheDocument();
    expect(screen.getByText('Tu cita médica: cómo pedirla sin desplazarte')).toBeInTheDocument();
  });

  it('allows liking a news item and updates the count immediately', async () => {
    const user = userEvent.setup();
    renderApp();

    // Noticia 1 tiene 128 likes inicialmente
    expect(screen.getByText('128')).toBeInTheDocument();

    const likeButtons = screen.getAllByRole('button', { name: /me gusta/i });
    const firstLikeBtn = likeButtons[0];

    // Pulsar like
    await user.click(firstLikeBtn);

    // Ahora debe mostrar 129
    expect(screen.getByText('129')).toBeInTheDocument();

    // Pulsar de nuevo para desmarcar
    await user.click(firstLikeBtn);

    // Vuelve a 128
    expect(screen.getByText('128')).toBeInTheDocument();
  });

  it('filters news by typing in the search bar', async () => {
    const user = userEvent.setup();
    renderApp();

    const searchInput = screen.getByPlaceholderText('Escribir o hablar');
    await user.type(searchInput, 'médica');

    // Debe mostrar la noticia de cita médica
    expect(screen.getByText('Tu cita médica: cómo pedirla sin desplazarte')).toBeInTheDocument();

    // No debe mostrar la de SMS
    expect(
      screen.queryByText('SMS de tu banco: señales de alerta y cómo protegerte')
    ).not.toBeInTheDocument();
  });

  it('shows empty state when no results match and restores on reset', async () => {
    const user = userEvent.setup();
    renderApp();

    const searchInput = screen.getByPlaceholderText('Escribir o hablar');
    await user.type(searchInput, 'astronautas');

    expect(screen.getByText('No encontramos noticias')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /restablecer filtros/i });
    await user.click(resetBtn);

    // Vuelve a mostrar las 4 noticias
    expect(screen.getByText('SMS de tu banco: señales de alerta y cómo protegerte')).toBeInTheDocument();
    expect(screen.getByText('Tu pensión por internet: dónde consultar tus datos')).toBeInTheDocument();
  });

  it('filters news when clicking a topic filter', async () => {
    const user = userEvent.setup();
    renderApp();

    const digitalTopicBtn = screen.getByRole('button', { name: /tema mundo digital/i });
    await user.click(digitalTopicBtn);

    // Debe mostrar la noticia 1 (Mundo Digital)
    expect(screen.getByText('SMS de tu banco: señales de alerta y cómo protegerte')).toBeInTheDocument();

    // No debe mostrar la de cita médica
    expect(screen.queryByText('Tu cita médica: cómo pedirla sin desplazarte')).not.toBeInTheDocument();
  });

  it('navigates to NoticiaPage when clicking "leer +" and back to Inicio on Volver', async () => {
    const user = userEvent.setup();
    renderApp();

    const leerButtons = screen.getAllByRole('button', { name: /leer noticia completa/i });
    await user.click(leerButtons[0]);

    // Vista NoticiaPage con secciones completas
    expect(screen.getByText('Qué está pasando')).toBeInTheDocument();
    expect(screen.getByText('Qué puedes hacer ahora')).toBeInTheDocument();
    expect(screen.getByText('¿Te queda alguna duda?')).toBeInTheDocument();

    // Navegar a RespuestaPage desde dudas
    const dudasBtn = screen.getByRole('button', {
      name: /ir a la pantalla para preguntar sobre esta noticia/i,
    });
    await user.click(dudasBtn);
    expect(screen.getByText('¿Tienes más preguntas sobre esta noticia?')).toBeInTheDocument();

    // Volver a NoticiaPage y luego a Inicio
    const volverBtn = screen.getByRole('button', { name: /volver a la vista anterior o arriba/i });
    await user.click(volverBtn);
    expect(screen.getByText('Qué está pasando')).toBeInTheDocument();

    const volverInicioBtn = screen.getByRole('button', {
      name: /volver a la vista anterior o arriba/i,
    });
    await user.click(volverInicioBtn);
    expect(screen.getByText('¿Qué está pasando?')).toBeInTheDocument();
  });

  it('opens and closes accessibility settings dialog', async () => {
    const user = userEvent.setup();
    renderApp();

    const a11yBtn = screen.getByRole('button', { name: /accesibilidad/i });
    await user.click(a11yBtn);

    const dialog = screen.getByRole('dialog', { name: /accesibilidad · a tu manera/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Tamaño de letra')).toBeInTheDocument();
    expect(within(dialog).getByText('Alto contraste')).toBeInTheDocument();

    // Guardar ajustes
    const saveBtn = within(dialog).getByRole('button', { name: /guardar ajustes/i });
    await user.click(saveBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens and closes account contextual preview dialog', async () => {
    const user = userEvent.setup();
    renderApp();

    const accountBtn = screen.getByRole('button', { name: /cuenta/i });
    await user.click(accountBtn);

    const dialog = screen.getByRole('dialog', { name: /mi cuenta/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Carmen Martínez')).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole('button', { name: /entendido/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
