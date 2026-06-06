"use client";

import { useEffect, useState } from "react";

const API_URL = "https://canchago-api.onrender.com";

export default function MiActividadPage() {
    const [usuario, setUsuario] = useState<any | null>(null);
    const [reservas, setReservas] = useState<any[]>([]);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }

        const user = JSON.parse(usuarioGuardado);
        setUsuario(user);
        obtenerReservas(user.id);
    }, []);

    async function obtenerReservas(usuarioId: number) {
        const response = await fetch(`${API_URL}/api/Reservas`);
        const data = await response.json();

        const misReservas = data.filter((r: any) => r.usuarioId === usuarioId);
        setReservas(misReservas);
    }

    function formatearFecha(fecha: string) {
        return new Date(fecha).toLocaleDateString("es-CR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    const reservasActivas = reservas.filter(
        (r) => r.estado !== "Cancelada"
    );

    const reservasCanceladas = reservas.filter(
        (r) => r.estado === "Cancelada"
    );

    const totalGastado = reservasActivas.reduce(
        (total, r) => total + (r.montoTotal || 0),
        0
    );

    const proximaReserva = reservasActivas
        .filter((r) => new Date(r.fecha) >= new Date())
        .sort(
            (a, b) =>
                new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        )[0];

    if (!usuario) return null;

    return (
        <main className="min-h-screen bg-black text-white px-4 py-6 pb-28">
            <div className="max-w-5xl mx-auto">
                <a href="/" className="text-green-400 font-bold">
                    ← Volver
                </a>

                <h1 className="text-3xl font-bold text-green-500 mt-6 mb-2">
                    Mi actividad
                </h1>

                <p className="text-gray-400 mb-6">
                    Resumen de tus reservas, pagos y actividad reciente.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                        <p className="text-gray-400 text-sm">Reservas</p>
                        <p className="text-2xl font-bold">{reservas.length}</p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                        <p className="text-gray-400 text-sm">Activas</p>
                        <p className="text-2xl font-bold text-green-400">
                            {reservasActivas.length}
                        </p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                        <p className="text-gray-400 text-sm">Canceladas</p>
                        <p className="text-2xl font-bold text-red-400">
                            {reservasCanceladas.length}
                        </p>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                        <p className="text-gray-400 text-sm">Total gastado</p>
                        <p className="text-2xl font-bold">
                            ₡{totalGastado.toLocaleString("es-CR")}
                        </p>
                    </div>
                </div>

                {proximaReserva && (
                    <section className="bg-green-500 text-black rounded-2xl p-5 mb-6">
                        <p className="font-bold text-sm mb-1">Próxima reserva</p>
                        <h2 className="text-2xl font-bold">
                            {proximaReserva.cancha?.nombre || "Cancha"}
                        </h2>
                        <p className="font-semibold mt-2">
                            {formatearFecha(proximaReserva.fecha)}
                        </p>
                        <p>
                            {proximaReserva.horaInicio?.substring(0, 5)} -{" "}
                            {proximaReserva.horaFin?.substring(0, 5)}
                        </p>
                    </section>
                )}

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        Historial reciente
                    </h2>

                    <div className="space-y-4">
                        {reservas.length === 0 && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-gray-400">
                                Todavía no tenés actividad registrada.
                            </div>
                        )}

                        {reservas.map((reserva) => (
                            <div
                                key={reserva.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                            >
                                <div className="flex justify-between gap-4 mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {reserva.cancha?.nombre || "Cancha"}
                                        </h3>

                                        <p className="text-gray-400 text-sm">
                                            {reserva.cancha?.tipoDeporte || "Deporte"} ·{" "}
                                            {reserva.tipoPartido}
                                        </p>
                                    </div>

                                    <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full h-fit ${reserva.estado === "Cancelada"
                                                ? "bg-red-500 text-white"
                                                : "bg-green-500 text-black"
                                            }`}
                                    >
                                        {reserva.estado}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-300">
                                    📅 {formatearFecha(reserva.fecha)}
                                </p>

                                <p className="text-sm text-gray-300">
                                    ⏰ {reserva.horaInicio?.substring(0, 5)} -{" "}
                                    {reserva.horaFin?.substring(0, 5)}
                                </p>

                                <p className="text-sm text-gray-300">
                                    💳 Pago: {reserva.estadoPago || "Pendiente"}
                                </p>

                                <p className="text-sm text-gray-300">
                                    💰 Monto: ₡{(reserva.montoTotal || 0).toLocaleString("es-CR")}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}