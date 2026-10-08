import { listVehicles, db } from '@/lib/store';
import { guard } from '@/lib/auth';
import { vehicleSchema } from '@/lib/models';
export async function GET(){try{return Response.json(await listVehicles());}catch{return Response.json({error:'Não foi possível carregar o estoque.'},{status:503});}}
export async function POST(request:Request){const denied=await guard(request);if(denied)return denied;try{const input=vehicleSchema.safeParse(await request.json());if(!input.success)return Response.json({error:'Confira os campos e as URLs das fotos.'},{status:400});const id=crypto.randomUUID();const data={...input.data,id,demo:false};await db().prepare('INSERT INTO vehicles (id,data,created_at) VALUES (?,?,?)').bind(id,JSON.stringify(data),Date.now()).run();return Response.json(data,{status:201});}catch{return Response.json({error:'Não foi possível salvar. Tente novamente.'},{status:503});}}
