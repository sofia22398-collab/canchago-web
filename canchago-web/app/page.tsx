"use client";

import { useEffect, useState } from "react";

const API_URL = "https://canchago-api.onrender.com";

const HORARIOS = [
    "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00", "21:00",
];

export default function Home() {
    const [canchas, setCanchas] = useState<any[]>([]);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState<any | null>(null);
    const [fecha, setFecha] = useState("");
    const [horaInicio, setHoraInicio] = useState("19:00");
    const [horaFin, setHoraFin] = useState("20:00");
    const [usuario, setUsuario] = useState<any | null>(null);
    const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
            obtenerCanchas();
        }

        setFecha(new Date().toISOString().split("T")[0]);
    }, []);

    async function obtenerCanchas() {
        const response = await fetch(`${API_URL}/api/Canchas`);
        const data = await response.json();
        setCanchas(data);
    }

    async function obtenerDisponibilidad(canchaId: number, fechaSeleccionada: string) {
        const response = await fetch(
            `${API_URL}/api/Reservas/disponibilidad?canchaId=${canchaId}&fecha=${fechaSeleccionada}`
        );

        const data = await response.json();

        const horas = data.map((r: any) => r.horaInicio.substring(0, 5));
        setHorariosOcupados(horas);
    }

    async function guardarReserva() {
        if (!usuario) {
            alert("Debes iniciar sesión para reservar.");
            return;
        }

        if (!canchaSeleccionada) {
            alert("Debes seleccionar una cancha.");
            return;
        }

        if (!fecha) {
            alert("Debes seleccionar una fecha.");
            return;
        }

        if (horaInicio >= horaFin) {
            alert("La hora de inicio debe ser menor que la hora fin.");
            return;
        }

        const reserva = {
            usuarioId: usuario.id,
            canchaId: canchaSeleccionada.id,
            fecha: `${fecha}T00:00:00Z`,
            horaInicio: `${horaInicio}:00`,
            horaFin: `${horaFin}:00`,
            cantidadJugadores: canchaSeleccionada.tipoDeporte === "Pickleball" ? 4 : 2,
            tipoPartido: canchaSeleccionada.tipoDeporte === "Pickleball" ? "Dobles" : "Singles",
        };

        const response = await fetch(`${API_URL}/api/Reservas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reserva),
        });

        const texto = await response.text();

        if (response.ok) {
            await obtenerDisponibilidad(canchaSeleccionada.id, fecha);
            alert("Reserva creada correctamente ✅");
            setCanchaSeleccionada(null);
        } else {
            alert("Error real del backend: " + texto);
        }
    }

    function seleccionarHora(hora: string) {
        setHoraInicio(hora);

        const siguienteHora =
            String(Number(hora.substring(0, 2)) + 1).padStart(2, "0") + ":00";

        setHoraFin(siguienteHora);
    }

    function abrirModal(cancha: any) {
        setCanchaSeleccionada(cancha);

        const hoy = new Date().toISOString().split("T")[0];

        setFecha(hoy);
        setHoraInicio("19:00");
        setHoraFin("20:00");

        obtenerDisponibilidad(cancha.id, hoy);
    }

    function cerrarSesion() {
        localStorage.removeItem("usuario");
        window.location.href = "/login";
    }

    if (!usuario) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-5xl sm:text-6xl font-bold text-green-500 mb-4">
                        CanchaGo
                    </h1>

                    <p className="text-gray-300 text-lg mb-2">
                        Reserva tus canchas de tenis y pickleball.
                    </p>

                    <p className="text-gray-500 text-sm mb-8">
                        Inicia sesión para ver disponibilidad y realizar reservas.
                    </p>

                    <a
                        href="/login"
                        className="block w-full bg-green-500 hover:bg-green-400 transition-all duration-200 text-black font-bold py-4 rounded-2xl"
                    >
                        Iniciar sesión
                    </a>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-5 md:p-10">
            <div className="max-w-7xl mx-auto pb-28 md:pb-10">

                <header className="mb-7">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-green-500">
                                CanchaGo
                            </h1>

                            <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                                Reserva tus canchas de tenis y pickleball fácilmente.
                            </p>
                        </div>

                        <div className="relative w-full md:w-auto md:min-w-[260px]">
                            <button
                                onClick={() => setMenuPerfilAbierto(!menuPerfilAbierto)}
                                className="flex items-center justify-between gap-3 w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-green-400 leading-tight">
                                        Hola, {usuario.nombre}
                                    </p>

                                    <p className="text-xs text-gray-400 break-all">
                                        {usuario.correo}
                                    </p>
                                </div>

                                <span className="text-gray-300 text-sm">
                                    {menuPerfilAbierto ? "▲" : "▼"}
                                </span>
                            </button>

                            {menuPerfilAbierto && (
                                <div className="absolute right-0 mt-3 w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-50">
                                    {usuario?.rol === "Admin" && (
                                        <a
                                            href="/admin"
                                            className="block px-4 py-3 hover:bg-zinc-800 text-green-400 font-bold"
                                        >
                                            ⚙️ Admin
                                        </a>
                                    )}

                                    <a
                                        href="/perfil"
                                        className="block px-4 py-3 hover:bg-zinc-800"
                                    >
                                        👤 Editar perfil
                                    </a>

                                    <a
                                        href="/mi-actividad"
                                        className="block px-4 py-3 hover:bg-zinc-800"
                                    >
                                        📊 Mi actividad
                                    </a>

                                    <a
                                        href="/mis-pagos"
                                        className="block px-4 py-3 hover:bg-zinc-800"
                                    >
                                        💳 Mis pagos
                                    </a>

                                    <button
                                        onClick={cerrarSesion}
                                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-zinc-800 font-bold"
                                    >
                                        🚪 Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <section className="mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold mb-1">
                        Canchas disponibles
                    </h2>

                    <p className="text-sm text-gray-500">
                        Elegí una cancha para revisar horarios y reservar.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                    {canchas.map((cancha) => (
                        <div
                            key={cancha.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-lg hover:border-green-500 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between mb-4 gap-3">
                                <span className="bg-green-500 text-black px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                                    {cancha.tipoDeporte}
                                </span>

                                <span className="text-green-400 font-bold text-sm sm:text-base">
                                    ₡{cancha.precioHora}
                                </span>
                            </div>

                            <h2 className="text-lg md:text-2xl font-bold mb-4">
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

            <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 grid grid-cols-4 md:hidden z-40">
                <a href="/" className="py-3 text-center text-xs text-green-400 font-bold">
                    🏠
                    <span className="block mt-1">Inicio</span>
                </a>

                <a href="/calendario" className="py-3 text-center text-xs text-gray-300 font-bold">
                    📅
                    <span className="block mt-1">Calendario</span>
                </a>

                <a href="/mis-reservas" className="py-3 text-center text-xs text-gray-300 font-bold">
                    🎾
                    <span className="block mt-1">Reservas</span>
                </a>

                <a href="/partidos" className="py-3 text-center text-xs text-gray-300 font-bold">
                    👥
                    <span className="block mt-1">Partidos</span>
                </a>
            </nav>

            {canchaSeleccionada && (
                <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-t-3xl md:rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-green-500 mb-2">
                            Reservar {canchaSeleccionada.nombre}
                        </h2>

                        <p className="text-gray-400 mb-5">
                            Selecciona fecha y horario.
                        </p>

                        <label className="block mb-2 text-sm">Fecha</label>

                        <input
                            type="date"
                            value={fecha}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                                setFecha(e.target.value);
                                obtenerDisponibilidad(canchaSeleccionada.id, e.target.value);
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