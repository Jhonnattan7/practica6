"use client"; 
 
import Link from "next/link"; 
import { usePathname } from "next/navigation"; 
 
const enlaces = [ 
  { href: "/", etiqueta: "Inicio" }, 
  { href: "/servicios", etiqueta: "Servicios" }, 
  { href: "/reservas", etiqueta: "Reservas" }, 
]; 
 
export function Nav() { 
  const pathname = usePathname(); 
 
  return ( 
    <header className="border-b border-gray-200 bg-white"> 
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6"> 
        <span className="font-semibold text-base tracking-tight whitespace-nowrap">Panel de reservas</span> 
        <nav className="flex items-center gap-5 sm:gap-6"> 
          {enlaces.map(({ href, etiqueta }) => ( 
            <Link key={href} href={href} 
              className={pathname === href ? 'text-black font-medium text-base' : 
'text-gray-500 text-base hover:text-black'} 
            > 
              {etiqueta} 
            </Link> 
          ))} 
        </nav> 
      </div> 
    </header> 
  ); 
} 