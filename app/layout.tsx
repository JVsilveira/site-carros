import type { Metadata } from 'next';import './globals.css';
export const metadata:Metadata={title:'Linha Motors | Encontre seu próximo carro',description:'Explore os veículos, confira todos os detalhes e converse com a revenda.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
