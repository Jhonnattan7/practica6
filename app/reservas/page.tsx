import { prisma } from "../lib/prisma"; 
import Link from "next/link";
import { BotonEliminarReserva } from "./boton-eliminar";
import { tarjeta } from "@/app/lib/estilos";

const estadosValidos = ["pendiente", "confirmada", "cancelada"] as const;
type EstadoReserva = (typeof estadosValidos)[number];

const etiquetaEstado: Record<string, string> = {
  pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-50 text-green-700 border-green-200",
  cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function PaginaReservas({
    searchParams,
}: {
    searchParams?: Promise<{ estado?: string }>;
}) {
    const params = (await searchParams) ?? {};
    const estadoActual = estadosValidos.includes(params.estado as EstadoReserva)
        ? (params.estado as EstadoReserva)
        : undefined;

    const reservas = await prisma.reserva.findMany({
        where: estadoActual ? { estado: estadoActual } : undefined,
        orderBy: { fecha: "asc" },
        include: { servicio: true },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Reservas</h1>
                <Link
                    href="/reservas/nueva"
                    className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 
transition-colors"
                >
                    Nueva reserva
                </Link>
            </div>

            <div className="flex items-center gap-2 mb-6 text-xs">
                <Link
                    href="/reservas"
                    className={estadoActual === undefined
                        ? "px-2 py-1 rounded border border-black text-black"
                        : "px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-black"}
                >
                    Todas
                </Link>
                <Link
                    href="/reservas?estado=pendiente"
                    className={estadoActual === "pendiente"
                        ? "px-2 py-1 rounded border border-black text-black"
                        : "px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-black"}
                >
                    Pendientes
                </Link>
                <Link
                    href="/reservas?estado=confirmada"
                    className={estadoActual === "confirmada"
                        ? "px-2 py-1 rounded border border-black text-black"
                        : "px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-black"}
                >
                    Confirmadas
                </Link>
                <Link
                    href="/reservas?estado=cancelada"
                    className={estadoActual === "cancelada"
                        ? "px-2 py-1 rounded border border-black text-black"
                        : "px-2 py-1 rounded border border-gray-200 text-gray-500 hover:text-black"}
                >
                    Canceladas
                </Link>
            </div>

            {reservas.length === 0 ? (
                <p className="text-sm text-gray-400">No hay reservas registradas.</p>
            ) : (
                <ul className="space-y-3">
                    {reservas.map((reserva) => (
                        <li
                            key={reserva.id}
                            className={`${tarjeta} flex items-start justify-between`}
                        >
                            <div>
                                <p className="font-medium text-sm">{reserva.nombre}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{reserva.correo}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {reserva.servicio.nombre} —{" "}
                                    {new Date(reserva.fecha).toLocaleString("es-SV")}
                                </p>
                                <span
                                    className={`inline-block mt-2 text-xs px-2 py-0.5 rounded border ${etiquetaEstado[reserva.estado] ?? etiquetaEstado.pendiente}`}
                                >
                                    {reserva.estado}
                                </span>
                            </div>
                            <BotonEliminarReserva id={reserva.id} estado={reserva.estado} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 