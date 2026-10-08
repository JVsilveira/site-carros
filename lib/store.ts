import { workerEnv as env } from './worker-env';
import type { Vehicle, StoreSettings } from './models';
import usedVehicles from './demo-used-vehicles.json';
export function db() { if(!env.DB) throw new Error('Estoque indisponível'); return env.DB as D1Database; }
export async function listVehicles():Promise<Vehicle[]> { await seedExamples(); await seedUsedVehicles(); const r=await db().prepare('SELECT id, data FROM vehicles ORDER BY created_at DESC').all<{id:string;data:string}>();return r.results.map(r=>({...JSON.parse(r.data),id:r.id})); }
export async function getSettings():Promise<StoreSettings> {const r=await db().prepare('SELECT data FROM settings WHERE id = ?').bind('store').first<{data:string}>();return r?JSON.parse(r.data):{name:'Linha Motors',whatsapp:'',email:'',address:''};}
export function adminEmail(){return ((env as unknown as Record<string,string>).ADMIN_EMAIL||'').toLowerCase().trim();}

async function seedExamples(){
 const ready=await db().prepare('SELECT id FROM settings WHERE id = ?').bind('initialized').first();if(ready)return;
 const examples=[{id:'demo-bmw',brand:'BMW',model:'Série 3',version:'320i Sport · 2.0 turbo',year:2022,price:219900,km:32500,category:'Sedã',transmission:'Automático',fuel:'Gasolina',color:'Branco',photos:['/bmw.jpg']},{id:'demo-audi',brand:'Audi',model:'A6',version:'Performance · 2.0 turbo',year:2021,price:249900,km:41800,category:'Sedã',transmission:'Automático',fuel:'Gasolina',color:'Preto',photos:['/audi.jpg']},{id:'demo-r8',brand:'Audi',model:'R8',version:'V10 · Coupé',year:2020,price:899900,km:15200,category:'Esportivo',transmission:'Automático',fuel:'Gasolina',color:'Preto',photos:['/sport.jpg']}].map(c=>({...c,demo:true,description:'Veículo demonstrativo para explorar o catálogo da Linha Motors. Preço, ano, quilometragem e equipamentos são exemplos. As fotografias são ilustrativas e não representam uma oferta real.',features:'Ar-condicionado, Bancos em couro, Central multimídia, Rodas de liga leve'}));
 await db().batch([...examples.map((c,i)=>db().prepare("INSERT OR IGNORE INTO vehicles (id,data,created_at) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 'initialized')").bind(c.id,JSON.stringify(c),Date.now()-i)),db().prepare('INSERT OR IGNORE INTO settings (id,data) VALUES (?,?)').bind('initialized','true')]);
}

// Each demo batch is installed once. Removed ads never reappear on later reads.
async function seedUsedVehicles() {
 const marker = 'demo-used-vehicles-20261007';
 const ready = await db().prepare('SELECT id FROM settings WHERE id = ?').bind(marker).first();
 if (ready) return;
 const addedAt = Date.now();
 await db().batch([
  ...usedVehicles.map((car, index) => db().prepare(
   'INSERT OR IGNORE INTO vehicles (id, data, created_at) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = ?)'
  ).bind(car.id, JSON.stringify(car), addedAt + usedVehicles.length - index, marker)),
  db().prepare('INSERT OR IGNORE INTO settings (id, data) VALUES (?, ?)').bind(marker, 'true'),
 ]);
}
