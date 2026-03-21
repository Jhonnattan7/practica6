"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";

// Esquema de validación para el formulario de reserva.
// servicioId llega como string desde el select y se convierte a número con z.coerce.
const EsquemaReserva = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  correo: z.string().email("El correo no es válido."),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

const EsquemaIdReserva = z.number().int().positive("ID de reserva inválido.");

// Crea una nueva reserva asociada a un servicio existente.
// La fecha se convierte a objeto Date antes de guardarse en la base de datos.
export async function crearReserva(_estadoPrevio: any, formData: FormData) {
  const campos = EsquemaReserva.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    fecha: formData.get("fecha"),
    servicioId: formData.get("servicioId"),
  });

  // Si la validación falla, se retorna el objeto de errores al componente.
  if (!campos.success) {
    return {
      errores: campos.error.flatten().fieldErrors,
      mensaje: "Error de validación.",
    };
  }

  const fechaReserva = new Date(campos.data.fecha);
  if (Number.isNaN(fechaReserva.getTime())) {
    return {
      errores: { fecha: ["La fecha no es válida."] },
      mensaje: "Error de validación.",
    };
  }

  const servicio = await prisma.servicio.findUnique({
    where: { id: campos.data.servicioId },
    select: { duracion: true },
  });

  if (!servicio) {
    return {
      errores: { servicioId: ["El servicio seleccionado no existe."] },
      mensaje: "Error de validación.",
    };
  }

  const inicioNuevo = fechaReserva;
  const finNuevo = new Date(inicioNuevo.getTime() + servicio.duracion * 60000);

  const candidatas = await prisma.reserva.findMany({
    where: {
      servicioId: campos.data.servicioId,
      estado: { not: "cancelada" },
    },
    select: { fecha: true },
  });

  const existeConflicto = candidatas.some((reserva) => {
    const inicioExistente = reserva.fecha;
    const finExistente = new Date(
      inicioExistente.getTime() + servicio.duracion * 60000,
    );

    return inicioExistente < finNuevo && finExistente > inicioNuevo;
  });

  if (existeConflicto) {
    return {
      errores: { fecha: ["Ese horario ya está ocupado para este servicio."] },
      mensaje:
        "Conflicto de horario: existe otra reserva en ese servicio para ese rango de tiempo.",
    };
  }

  await prisma.reserva.create({
    data: {
      nombre: campos.data.nombre,
      correo: campos.data.correo,
      fecha: fechaReserva,
      servicioId: campos.data.servicioId,
    },
  });

  revalidatePath("/reservas");
  redirect("/reservas");
}

// Cancela la reserva por ID cambiando su estado.
export async function cancelarReserva(id: number) {
  const validacionId = EsquemaIdReserva.safeParse(id);
  if (!validacionId.success) {
    return { exito: false, mensaje: "ID de reserva inválido." };
  }

  try {
    await prisma.reserva.update({
      where: { id: validacionId.data },
      data: { estado: "cancelada" },
    });
    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo cancelar la reserva." };
  }
}

// Confirma una reserva pendiente.
export async function confirmarReserva(id: number) {
  const validacionId = EsquemaIdReserva.safeParse(id);
  if (!validacionId.success) {
    return { exito: false, mensaje: "ID de reserva inválido." };
  }

  try {
    const actualizada = await prisma.reserva.updateMany({
      where: { id: validacionId.data, estado: "pendiente" },
      data: { estado: "confirmada" },
    });

    if (actualizada.count === 0) {
      return {
        exito: false,
        mensaje: "Solo se pueden confirmar reservas pendientes.",
      };
    }

    revalidatePath("/reservas");
    return { exito: true };
  } catch {
    return { exito: false, mensaje: "No se pudo confirmar la reserva." };
  }
}
