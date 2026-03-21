"use client"; 
 
import { cancelarReserva, confirmarReserva } from "@/app/actions/reservas"; 
import { useState } from "react"; 
import { botonPeligro } from "@/app/lib/estilos"; 
 
export function BotonEliminarReserva({
  id,
  estado,
}: {
  id: number;
  estado: string;
}) {
  const [error, setError] = useState<string | null>(null); 
 
  async function manejarCancelar() {
    setError(null);
    const resultado = await cancelarReserva(id); 
    if (!resultado.exito) { 
      setError(resultado.mensaje ?? "Error desconocido."); 
    } 
  } 

  async function manejarConfirmar() {
    setError(null);
    const resultado = await confirmarReserva(id);
    if (!resultado.exito) {
      setError(resultado.mensaje ?? "Error desconocido.");
    }
  }
 
  return ( 
    <div className="text-right shrink-0 ml-4"> 
      <div className="flex items-center gap-2 justify-end">
        {estado === "pendiente" && (
          <button
            onClick={manejarConfirmar}
            className="bg-black text-white px-3 py-1.5 rounded text-xs hover:bg-gray-800 transition-colors"
          >
            Confirmar
          </button>
        )}

        {estado !== "cancelada" && (
          <button onClick={manejarCancelar} className={botonPeligro}> 
            Cancelar 
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>} 
    </div> 
  ); 
}