"use client";

import { useEffect, useState } from "react";

const API_URL = "https://canchago-api.onrender.com";

export default function PartidoDetallePage({ params }: any) {
    const [usuario, setUsuario] = useState<any | null>(null);
    const [partido, setPartido] = useState<any | null>(null);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }

        obtenerPartido();
    }, []);

    async function obtenerPartido() {
        const response = await fetch(`${API_URL}/api/Partidos`);
        const data = await response.json();

        const encontrado = data.find((p: any) => p.id === Number(params.id));

        setPartido(encontrado);
    }

    function getUsuarioId() {
        return usuario?.id ?? usuario?.Id ?? usuario?.usuarioId;
    }

    async function unirse() {
        const usuarioId = getUsuarioId();

        if (!usuarioId) {
            localStorage.setItem("volverA", `/partido/${params.id}`);
            window.location.href = "/login";
            return;
        }

        const response = await fetch(
            `${API_URL}/api/Partidos/${params.id}/unirse/${usuarioId}`,
            { method: "POST" }
        );

        const texto = await response.text();

        if (!response.ok) {
            alert(texto || "No se pudo unir al partido.");
            return;
        }

        alert("Te uniste al partido correctamente.");
        obtenerPartido();
    }

    if (!partido) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>Cargando partido...</p>
            </main>
        );
    }

    const unidos = partido.jugadores?.length ?? 0;

    return (
        <main className="min-h-screen bg-black text-white px-4 py-8">
            <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h1 className="text-3xl font-bold text-green-500 mb-3">
                    {partido.titulo ?? "Partido abierto"}
                </h1>

                <p className="text-gray-300">Cancha: {partido.reserva?.cancha?.nombre}</p>
                <p className="text-gray-300">Fecha: {partido.reserva?.fecha?.substring(0, 10)}</p>
                <p className="text-gray-300">
                    Hora: {partido.reserva?.horaInicio?.substring(0, 5)} -{" "}
                    {partido.reserva?.horaFin?.substring(0, 5)}
                </p>
                <p className="text-gray-300">Nivel: {partido.nivel ?? "Libre"}</p>
                <p className="text-gray-300">Jugadores: {unidos}/{partido.cuposTotales}</p>

                <button
                    onClick={unirse}
                    className="w-full mt-6 bg-green-500 hover:bg-green-400 text-black py-4 rounded-xl font-bold text-lg"
                >
                    Unirme al Partido
                </button>

                <a href="/partidos" className="block text-center mt-4 text-gray-400">
                    Ver todos los partidos
                </a>
            </div>
        </main>
    );
}