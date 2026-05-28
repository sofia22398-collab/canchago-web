"use client";

import { useEffect, useState } from "react";

const HORARIOS = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
];

export default function Home() {

    const [canchas, setCanchas] = useState<any[]>([]);

    const [canchaSeleccionada, setCanchaSeleccionada] =
        useState<any | null>(null);

    const [fecha, setFecha] = useState("");

    const [horaInicio, setHoraInicio] =
        useState("19:00");

    const [horaFin, setHoraFin] =
        useState("20:00");

    const [usuario, setUsuario] =
        useState<any | null>(null);

    const [horariosOcupados, setHorariosOcupados] =
        useState<string[]>([]);

    useEffect(() => {

        obtenerCanchas();

        const usuarioGuardado =
            localStorage.getItem("usuario");

        if (usuarioGuardado) {

            setUsuario(
                JSON.parse(usuarioGuardado)
            );
        }

        const hoy = new Date()
            .toISOString()
            .split("T")[0];

        setFecha(hoy);

    }, []);

    async function obtenerCanchas() {

        const response = await fetch(
            "https://localhost:7174/api/Canchas"
        );

        const data = await response.json();

        setCanchas(data);
    }

    async function obtenerDisponibilidad(
        canchaId: number,
        fechaSeleccionada: string
    ) {

        const response = await fetch(
            `https://localhost:7174/api/Reservas/disponibilidad?canchaId=${canchaId}&fecha=${fechaSeleccionada}`
        );

        const data = await response.json();

        const horas = data.map((r: any) =>
            r.horaInicio.substring(0, 5)
        );

        setHorariosOcupados(horas);
    }

    async function guardarReserva() {

        if (!usuario) {

            alert(
                "Debes iniciar sesión para reservar."
            );

            return;
        }

        if (!fecha) {

            alert(
                "Debes seleccionar una fecha."
            );

            return;
        }

        if (horaInicio >= horaFin) {

            alert(
                "La hora de inicio debe ser menor que la hora fin."
            );

            return;
        }

        const reserva = {

            usuarioId: usuario.id,

            canchaId: canchaSeleccionada.id,

            fecha: `${fecha}T00:00:00`,

            horaInicio: `${horaInicio}:00`,

            horaFin: `${horaFin}:00`,

            cantidadJugadores:
                canchaSeleccionada.tipoDeporte === "Pickleball"
                    ? 4
                    : 2,

            tipoPartido:
                canchaSeleccionada.tipoDeporte === "Pickleball"
                    ? "Dobles"
                    : "Singles",

            estado: "Reservada",

            observaciones:
                "Reserva desde web",
        };

        const response = await fetch(
            "https://localhost:7174/api/Reservas",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(reserva),
            }
        );

        if (response.ok) {

            await obtenerDisponibilidad(
                canchaSeleccionada.id,
                fecha
            );

            alert(
                "Reserva creada correctamente ✅"
            );

        } else {

            const error =
                await response.text();

            if (
                error.includes(
                    "Ya existe una reserva"
                )
            ) {

                alert(
                    "Ese horario ya está reservado. Por favor selecciona otra hora."
                );

            } else {

                alert(
                    "No se pudo crear la reserva."
                );
            }
        }
    }

    function seleccionarHora(
        hora: string
    ) {

        setHoraInicio(hora);

        const siguienteHora =

            String(
                Number(
                    hora.substring(0, 2)
                ) + 1
            ).padStart(2, "0")

            + ":00";

        setHoraFin(siguienteHora);
    }

    function abrirModal(cancha: any) {

        setCanchaSeleccionada(cancha);

        const hoy = new Date()
            .toISOString()
            .split("T")[0];

        setFecha(hoy);

        setHoraInicio("19:00");

        setHoraFin("20:00");

        obtenerDisponibilidad(cancha.id, hoy);
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-6 md:p-10">
            <div className="max-w-7xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-green-500">
                            CanchaGo
                        </h1>

                        <p className="text-gray-400 text-base md:text-lg">
                            Reserva tus canchas de tenis y pickleball fácilmente.
                        </p>
                    </div>

                    {usuario ? (
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
                            {usuario?.rol === "Admin" && (
                                <a
                                    href="/admin"
                                    className="w-full sm:w-auto text-center bg-green-500 hover:bg-green-400 transition-all duration-200 text-black px-4 py-3 rounded-xl font-bold"
                                >
                                    Admin
                                </a>
                            )}

                            <a
                                href="/calendario"
                                className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 px-4 py-3 rounded-xl font-bold"
                            >
                                Calendario
                            </a>

                            <a
                                href="/mis-reservas"
                                className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 px-4 py-3 rounded-xl font-bold"
                            >
                                Mis Reservas
                            </a>

                            <a
                                href="/partidos"
                                className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 px-4 py-3 rounded-xl font-bold"
                            >
                                Partidos
                            </a>

                            <button
                                onClick={() => {
                                    localStorage.removeItem("usuario");
                                    window.location.href = "/login";
                                }}
                                className="w-full sm:w-auto bg-red-500 hover:bg-red-400 transition-all duration-200 px-4 py-3 rounded-xl font-bold text-white"
                            >
                                Cerrar sesión
                            </button>

                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                                <p className="font-bold text-green-400">
                                    {usuario.nombre}
                                </p>

                                <p className="text-sm text-gray-400 break-all">
                                    {usuario.correo}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <a
                            href="/login"
                            className="w-full sm:w-auto text-center bg-green-500 hover:bg-green-400 transition-all duration-200 text-black px-5 py-3 rounded-xl font-bold"
                        >
                            Iniciar sesión
                        </a>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {canchas.map((cancha) => (
                        <div
                            key={cancha.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-lg hover:border-green-500 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                                    {cancha.tipoDeporte}
                                </span>

                                <span className="text-green-400 font-bold">
                                    ₡{cancha.precioHora}
                                </span>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold mb-4">
                                {cancha.nombre}
                            </h2>

                            <button
                                onClick={() => abrirModal(cancha)}
                                className="w-full bg-green-500 hover:bg-green-400 transition-all duration-200 text-black font-bold py-3 rounded-xl"
                            >
                                Reservar
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {canchaSeleccionada && (
                <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-green-500 mb-2">
                            Reservar {canchaSeleccionada.nombre}
                        </h2>

                        <p className="text-gray-400 mb-5">
                            Selecciona fecha y horario.
                        </p>

                        <label className="block mb-2 text-sm">
                            Fecha
                        </label>

                        <input
                            type="date"
                            value={fecha}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                                setFecha(e.target.value);
                                obtenerDisponibilidad(
                                    canchaSeleccionada.id,
                                    e.target.value
                                );
                            }}
                            className="w-full mb-4 p-3 rounded-xl bg-black border border-zinc-700 text-white"
                        />

                        <label className="block mb-3 text-sm">
                            Selecciona horario
                        </label>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                            {HORARIOS.map((hora) => {
                                const ocupado = horariosOcupados.includes(hora);
                                const seleccionado = horaInicio === hora;

                                return (
                                    <button
                                        key={hora}
                                        disabled={ocupado}
                                        onClick={() => seleccionarHora(hora)}
                                        className={`
                                        p-3 rounded-xl font-bold transition-all duration-200 text-sm md:text-base
                                        ${ocupado
                                                ? "bg-red-500 text-white cursor-not-allowed"
                                                : seleccionado
                                                    ? "bg-green-500 text-black"
                                                    : "bg-zinc-800 hover:bg-zinc-700"
                                            }
                                    `}
                                    >
                                        {hora}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-sm text-gray-400 mb-4">
                            Reserva seleccionada: {horaInicio} - {horaFin}
                        </p>

                        <button
                            onClick={guardarReserva}
                            className="w-full bg-green-500 hover:bg-green-400 transition-all duration-200 text-black font-bold py-3 rounded-xl mb-3"
                        >
                            Confirmar reserva
                        </button>

                        <button
                            onClick={() => setCanchaSeleccionada(null)}
                            className="w-full bg-zinc-700 hover:bg-zinc-600 transition-all duration-200 text-white font-bold py-3 rounded-xl"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}