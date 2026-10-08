'use client';

import { useEffect, useRef, useState } from 'react';

type GoogleIdentity = {
  initialize: (config: { client_id: string; nonce: string; auto_select: boolean; callback: (response: { credential: string }) => void }) => void;
  renderButton: (element: HTMLElement, config: { theme: string; size: string; text: string; locale: string; width: number }) => void;
  cancel: () => void;
};
type GoogleWindow = Window & { google?: { accounts: { id: GoogleIdentity } } };

function loadGoogle(): Promise<GoogleIdentity> {
  const existing = (window as GoogleWindow).google?.accounts.id;
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      const id = (window as GoogleWindow).google?.accounts.id;
      if (id) resolve(id);
      else reject(new Error('Não foi possível carregar o login Google.'));
    };
    script.onerror = () => { script.remove(); reject(new Error('Não foi possível carregar o Google. Verifique sua conexão e tente novamente.')); };
    document.head.appendChild(script);
  });
}

export default function GoogleLogin({ configured }: { configured: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!configured) return;
    const lifecycle = new AbortController();
    let sdk: GoogleIdentity | undefined;
    async function start() {
      try {
        const [google, response] = await Promise.all([
          loadGoogle(), fetch('/api/auth/google', { signal: lifecycle.signal, cache: 'no-store' }),
        ]);
        const data = await response.json() as { clientId: string; nonce: string; error?: string };
        if (!response.ok) throw new Error(data.error || 'Não foi possível iniciar o login.');
        if (lifecycle.signal.aborted || !container.current) return;
        sdk = google;
        google.initialize({
          client_id: data.clientId, nonce: data.nonce, auto_select: false,
          callback: async ({ credential }) => {
            if (lifecycle.signal.aborted) return;
            setError(''); setStatus('Confirmando sua conta…');
            try {
              const login = await fetch('/api/auth/google', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }), signal: lifecycle.signal,
              });
              const result = await login.json() as { error?: string };
              if (!login.ok) throw new Error(result.error || 'Não foi possível entrar.');
              window.location.assign('/admin');
            } catch (e) {
              if (lifecycle.signal.aborted) return;
              setStatus(''); setError(e instanceof Error ? e.message : 'Não foi possível entrar. Tente novamente.');
            }
          },
        });
        container.current.replaceChildren();
        google.renderButton(container.current, { theme: 'outline', size: 'large', text: 'signin_with', locale: 'pt-BR', width: 280 });
      } catch (e) {
        if (!lifecycle.signal.aborted) setError(e instanceof Error ? e.message : 'Não foi possível iniciar o login.');
      }
    }
    void start();
    return () => { lifecycle.abort(); sdk?.cancel(); };
  }, [configured, attempt]);

  if (!configured) return <p className="notice">O acesso administrativo estará disponível em breve. O catálogo continua aberto para consulta.</p>;
  return <div className="google-login">
    <div ref={container} aria-label="Entrar com Google" />
    {status && <p role="status">{status}</p>}
    {error && <><p className="error" role="alert">{error}</p><button className="button secondary" onClick={() => { setError(''); setStatus(''); setAttempt(a => a + 1); }}>Tentar novamente</button></>}
  </div>;
}
