"use client";

import { useEffect, useState } from "react";

export default function PartidosPage() {
    const [usuario, setUsuario] = useState<any | null>(null);
    const [partidos, setPartidos] = useState<any[]>([]);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }

        const usuarioActual = JSON.parse(usuarioGuardado);
        setUsuario(usuarioActual);

        obtenerPartidos();
    }, []);

    async function obtenerPartidos() {
        const response = await fetch("https://localhost:7174/api/Partidos");
        const data = await response.json();
        setPartidos(data);
    }

    async function unirse(partidoId: number) {
        if (!usuario) return;

        const response = await fetch(
            `https://localhost:7174/api/Partidos/${partidoId}/unirse/${usuario.id}`,
            {
                method: "POST",
            }
        );

        if (response.ok) {
            alert("Te uniste al partido correctamente.");
            obtenerPartidos();
        } else {
            const error = await response.text();
            alert(error);
        }
    }

    async function salir(partidoId: number) {
        if (!usuario) return;

        const response = await fetch(
            `https://localhost:7174/api/Partidos/${partidoId}/salir/${usuario.id}`,
            {
                method: "DELETE",
            }
        );

        if (response.ok) {
            alert("Saliste del partido correctamente.");
            obtenerPartidos();
        } else {
            const error = await response.text();
            alert(error);
        }
    }

    function usuarioEstaUnido(partido: any) {
        return partido.jugadores?.some(
            (j: any) => j.usuarioId === usuario?.id
        );
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-6 md:p-10">
            <div className="max-w-6xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2">
                            Partidos Abiertos
                        </h1>

                        <p className="text-gray-400 text-base md:text-lg">
                            Unite a partidos disponibles.
                        </p>
                    </div>

                    <a
                        href="/"
                        className="w-full sm:w-auto text-center bg-green-500 text-black px-5 py-3 rounded-xl font-bold"
                    >
                        Volver
                    </a>
                </div>

                <div className="grid gap-5">
                    {partidos.length === 0 ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
                            <p className="text-gray-400">
                                No hay partidos abiertos todavía.
                            </p>
                        </div>
                    ) : (
                        partidos.map((partido) => {
                            const unidos = partido.jugadores?.length ?? 0;
                            const estaUnido = usuarioEstaUnido(partido);

                            return (
                                <div
                                    key={partido.id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5">
                                        <div>
                                            <p className="text-green-400 font-bold text-xl mb-2 break-words">
                                                {partido.titulo}
                                            </p>

                                            <p className="text-gray-300">
                                                Cancha:{" "}
                                                {partido.reserva?.cancha?.nombre ??
                                                    "Sin cancha"}
                                            </p>

                                            <p className="text-gray-300">
                                                Fecha:{" "}
                                                {partido.reserva?.fecha?.substring(0, 10)}
                                            </p>

                                            <p className="text-gray-300">
                                                Hora:{" "}
                                                {partido.reserva?.horaInicio?.substring(0, 5)} -{" "}
                                                {partido.reserva?.horaFin?.substring(0, 5)}
                                            </p>

                                            <p className="text-gray-300">
                                                Nivel: {partido.nivel ?? "Libre"}
                                            </p>

                                            <p className="text-gray-300">
                                                Jugadores: {unidos}/{partido.cuposTotales}
                                            </p>

                                            <p
                                                className={
                                                    partido.estado === "Abierto"
                                                        ? "text-green-400 font-bold mt-2"
                                                        : partido.estado === "Completo"
                                                            ? "text-yellow-400 font-bold mt-2"
                                                            : "text-red-400 font-bold mt-2"
                                                }
                                            >
                                                Estado: {partido.estado}
                                            </p>
                                        </div>

                                        <div className="w-full sm:w-40">
                                            {partido.estado === "Abierto" && !estaUnido && (
                                                <button
                                                    onClick={() => unirse(partido.id)}
                                                    className="w-full bg-green-500 hover:bg-green-400 text-black py-3 rounded-xl font-bold"
                                                >
                                                    Unirme
                                                </button>
                                            )}

                                            {estaUnido && (
                                                <button
                                                    onClick={() => salir(partido.id)}
                                                    className="w-full bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-bold"
                                                >
                                                    Salir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </main>
    );
}