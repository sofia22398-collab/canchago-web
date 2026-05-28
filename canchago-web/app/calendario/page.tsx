"use client";

import { useEffect, useState } from "react";

const HORARIOS = [
    "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00", "21:00",
];

export default function CalendarioPage() {
    const [usuario, setUsuario] = useState<any | null>(null);
    const [canchas, setCanchas] = useState<any[]>([]);
    const [canchaId, setCanchaId] = useState("");
    const [fecha, setFecha] = useState("");
    const [reservas, setReservas] = useState<any[]>([]);
    const [bloqueos, setBloqueos] = useState<any[]>([]);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }

        obtenerCanchas();
    }, []);

    useEffect(() => {
        if (canchaId && fecha) {
            cargarDisponibilidad();
        }
    }, [canchaId, fecha]);

    async function obtenerCanchas() {
        const response = await fetch("https://localhost:7174/api/Canchas");
        const data = await response.json();

        setCanchas(data);

        if (data.length > 0) {
            setCanchaId(data[0].id.toString());
        }
    }

    async function cargarDisponibilidad() {
        if (!canchaId || !fecha) return;

        const resReservas = await fetch(
            `https://localhost:7174/api/Reservas/disponibilidad?canchaId=${canchaId}&fecha=${fecha}`
        );

        const dataReservas = await resReservas.json();
        setReservas(dataReservas.filter((x: any) => x.tipo === "Reserva"));

        const dataBloqueos = dataReservas.filter((x: any) => x.tipo === "Bloqueo");
        setBloqueos(dataBloqueos);
    }

    function horaASegundos(hora: string) {
        const partes = hora.split(":");
        return Number(partes[0]) * 3600 + Number(partes[1]) * 60;
    }

    function cruzaHorario(hora: string, inicio: string, fin: string) {
        const slotInicio = horaASegundos(hora);
        const slotFin = slotInicio + 3600;
        const inicioSegundos = horaASegundos(inicio.substring(0, 5));
        const finSegundos = horaASegundos(fin.substring(0, 5));

        return slotInicio < finSegundos && slotFin > inicioSegundos;
    }

    function obtenerEstadoHora(hora: string) {
        const reserva = reservas.find((r) =>
            cruzaHorario(hora, r.horaInicio, r.horaFin)
        );

        if (reserva) {
            return {
                estado: "Reservado",
                clase: "bg-red-500/20 border-red-500 text-red-300",
                detalle: "Reserva existente",
                puedeReservar: false,
            };
        }

        const bloqueo = bloqueos.find((b) =>
            cruzaHorario(hora, b.horaInicio, b.horaFin)
        );

        if (bloqueo) {
            return {
                estado: "Bloqueado",
                clase: "bg-yellow-500/20 border-yellow-500 text-yellow-300",
                detalle: bloqueo.motivo || "Bloqueado por administración",
                puedeReservar: false,
            };
        }

        return {
            estado: "Disponible",
            clase: "bg-green-500/20 border-green-500 text-green-300 cursor-pointer hover:bg-green-500/30",
            detalle: "Click para reservar",
            puedeReservar: true,
        };
    }

    async function reservarDesdeCalendario(hora: string) {
        if (!usuario) {
            alert("Debes iniciar sesión para reservar.");
            window.location.href = "/login";
            return;
        }

        if (!fecha || !canchaId) {
            alert("Debes seleccionar cancha y fecha.");
            return;
        }

        const horaFin =
            String(Number(hora.substring(0, 2)) + 1).padStart(2, "0") + ":00";

        const canchaSeleccionada = canchas.find(
            (c) => c.id === Number(canchaId)
        );

        const confirmar = confirm(
            `¿Deseas reservar ${canchaSeleccionada?.nombre} el ${fecha} de ${hora} a ${horaFin}?`
        );

        if (!confirmar) return;

        const reserva = {
            usuarioId: usuario.id,
            canchaId: Number(canchaId),
            fecha: `${fecha}T00:00:00`,
            horaInicio: `${hora}:00`,
            horaFin: `${horaFin}:00`,
            cantidadJugadores:
                canchaSeleccionada?.tipoDeporte === "Pickleball" ? 4 : 2,
            tipoPartido:
                canchaSeleccionada?.tipoDeporte === "Pickleball"
                    ? "Dobles"
                    : "Singles",
            estado: "Reservada",
            observaciones: "Reserva desde calendario",
        };

        const response = await fetch("https://localhost:7174/api/Reservas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reserva),
        });

        if (response.ok) {
            alert("Reserva creada correctamente ✅");
            cargarDisponibilidad();
        } else {
            const error = await response.text();
            alert(error || "No se pudo crear la reserva.");
        }
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-6 md:p-10">
            <div className="max-w-5xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2">
                            Calendario
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg">
                            Consultá disponibilidad y reservá directo.
                        </p>
                    </div>

                    <a
                        href="/"
                        className="w-full sm:w-auto text-center bg-green-500 text-black px-5 py-3 rounded-xl font-bold"
                    >
                        Volver
                    </a>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        value={canchaId}
                        onChange={(e) => setCanchaId(e.target.value)}
                        className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                    >
                        <option value="">Seleccione cancha</option>

                        {canchas.map((cancha) => (
                            <option key={cancha.id} value={cancha.id}>
                                {cancha.nombre}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={fecha}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                    />
                </div>

                <div className="grid gap-3">
                    {HORARIOS.map((hora) => {
                        const info = obtenerEstadoHora(hora);

                        return (
                            <button
                                key={hora}
                                disabled={!info.puedeReservar}
                                onClick={() => reservarDesdeCalendario(hora)}
                                className={`rounded-2xl p-4 md:p-5 border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-left ${info.clase}`}
                            >
                                <div>
                                    <span className="font-bold text-lg md:text-xl">
                                        {hora}
                                    </span>

                                    <p className="text-sm opacity-80">
                                        {info.detalle}
                                    </p>
                                </div>

                                <span className="font-bold text-left sm:text-right">
                                    {info.estado}
                                </span>
                            </button>
                        );
                    })}
                </div>

            </div>
        </main>
    );
}