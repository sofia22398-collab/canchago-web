"use client";

import { useEffect, useState } from "react";


export default function MisReservasPage() {
    const [usuario, setUsuario] = useState<any | null>(null);
    const [reservas, setReservas] = useState<any[]>([]);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }

        const usuarioActual = JSON.parse(usuarioGuardado);
        setUsuario(usuarioActual);
        obtenerReservas(usuarioActual.id);
    }, []);

    async function obtenerReservas(usuarioId: number) {
        const response = await fetch(
            `https://localhost:7174/api/Reservas/usuario/${usuarioId}`
        );

        const data = await response.json();
        setReservas(data);
    }

    async function cancelarReserva(id: number) {
        const confirmar = confirm("¿Desea cancelar esta reserva?");

        if (!confirmar) return;

        const response = await fetch(
            `https://localhost:7174/api/Reservas/${id}`,
            {
                method: "DELETE",
            }
        );

        const texto = await response.text();

        if (response.ok) {
            alert("Reserva cancelada correctamente.");

            if (usuario) {
                obtenerReservas(usuario.id);
            }
        } else {
            alert("Error real del backend: " + texto);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white p-10">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-5xl font-bold text-green-500 mb-2">
                            Mis Reservas
                        </h1>

                        <p className="text-gray-400">
                            {usuario ? usuario.nombre : ""}
                        </p>
                    </div>

                    <a
                        href="/"
                        className="bg-green-500 text-black px-5 py-3 rounded-xl font-bold"
                    >
                        Volver
                    </a>
                </div>

                <div className="grid gap-4">
                    {reservas.length === 0 ? (
                        <p className="text-gray-400">No tienes reservas todavía.</p>
                    ) : (
                        reservas.map((reserva) => (
                            <div
                                key={reserva.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                            >
                                <p className="text-green-400 font-bold mb-2">
                                    Reserva #{reserva.id}
                                </p>

                                <p>Cancha: {reserva.cancha?.nombre ?? "Sin cancha"}</p>
                                <p>Fecha: {reserva.fecha.substring(0, 10)}</p>
                                <p>
                                    Hora: {reserva.horaInicio.substring(0, 5)} -{" "}
                                    {reserva.horaFin.substring(0, 5)}
                                </p>
                                <p>Estado: {reserva.estado}</p>
                                <p>Pago: {reserva.estadoPago ?? "Pendiente"}</p>

                                <p>
                                    Monto: ₡
                                    {Number(reserva.montoTotal ?? 0).toLocaleString("es-CR")}
                                </p>

                                {reserva.estado !== "Cancelada" &&
                                    reserva.estadoPago !== "Pagado" && (
                                        <div className="mt-4 bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                                            <p className="font-bold text-yellow-400 mb-2">
                                                Pago pendiente
                                            </p>

                                            <p className="text-gray-300 text-sm mb-3">
                                                Realizá el pago por SINPE y luego el administrador confirmará tu pago.
                                            </p>

                                            <p className="text-green-400 font-bold">
                                                SINPE: 8888-8888
                                            </p>
                                        </div>
                                    )}

                                {reserva.estado !== "Cancelada" && (
                                    <button
                                        onClick={() => cancelarReserva(reserva.id)}
                                        className="mt-4 w-full bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-bold"
                                    >
                                        Cancelar reserva
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}