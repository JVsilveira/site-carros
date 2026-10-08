import { getAdminUser, googleConfigured } from '@/lib/google-auth';
import { listVehicles, getSettings } from '@/lib/store';
import { Brand } from '@/app/catalog';
import Admin from './panel';
import GoogleLogin from './google-login';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) return <main className="login wrap">
    <Brand name="Linha Motors" />
    <div>
      <h1>Seu estoque,<br />sob seu controle.</h1>
      <p>Entre com sua conta Google autorizada para gerenciar os veículos.</p>
      <GoogleLogin configured={googleConfigured()} />
      <a className="back-link" href="/">Voltar ao catálogo</a>
    </div>
  </main>;
  const data = await Promise.all([listVehicles(), getSettings()]).catch(e => {
    console.error('Admin storage error', e);
    return null;
  });
  if (!data) return <main className="unavailable"><h1>Estoque indisponível</h1><p>Recarregue a página em alguns instantes.</p></main>;
  return <Admin initialCars={data[0]} initialSettings={data[1]} />;
}
