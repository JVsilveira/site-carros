import { listVehicles,getSettings } from '@/lib/store';import Catalog from './catalog';
export const dynamic='force-dynamic';
export default async function Home(){const data=await Promise.all([listVehicles(),getSettings()]).catch(e=>{console.error('Catalog storage error',e);return null;});if(!data)return <main className="unavailable"><h1>Estamos atualizando o estoque.</h1><p>Tente novamente em alguns instantes.</p><a href="/">Recarregar catálogo</a></main>;return <Catalog initialCars={data[0]} settings={data[1]}/>;}
