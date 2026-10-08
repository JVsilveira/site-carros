'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="unavailable"><h1>Não foi possível abrir esta página.</h1><p>Tente novamente em alguns instantes.</p><button onClick={reset} className="button primary">Tentar novamente</button></main>;}
