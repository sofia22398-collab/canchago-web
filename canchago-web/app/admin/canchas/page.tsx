"use client";

import { useEffect, useState } from "react";

export default function AdminCanchasPage() {
    const [canchas, setCanchas] = useState<any[]>([]);

    const [idEditando, setIdEditando] = useState<number | null>(null);
    const [nombre, setNombre] = useState("");
    const [tipoDeporte, setTipoDeporte] = useState("Tenis");
    const [tipoSuperficie, setTipoSuperficie] = useState("");
    const [interior, setInterior] = useState(false);
    const [iluminacion, setIluminacion] = useState(true);
    const [cantidadJugadores, setCantidadJugadores] = useState(2);
    const [precioHora, setPrecioHora] = useState(0);
    const [descripcion, setDescripcion] = useState("");

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }

        const usuario = JSON.parse(usuarioGuardado);

        if (usuario.rol !== "Admin") {
            alert("No tienes permisos.");
            window.location.href = "/";
            return;
        }

        obtenerCanchas();
    }, []);

    async function obtenerCanchas() {
        const response = await fetch("http://192.168.1.13:7174/api/Canchas/admin");
        const data = await response.json();
        setCanchas(data);
    }

    function limpiarFormulario() {
        setIdEditando(null);
        setNombre("");
        setTipoDeporte("Tenis");
        setTipoSuperficie("");
        setInterior(false);
        setIluminacion(true);
        setCantidadJugadores(2);
        setPrecioHora(0);
        setDescripcion("");
    }

    function editar(cancha: any) {
        setIdEditando(cancha.id);
        setNombre(cancha.nombre);
        setTipoDeporte(cancha.tipoDeporte);
        setTipoSuperficie(cancha.tipoSuperficie ?? "");
        setInterior(cancha.interior);
        setIluminacion(cancha.iluminacion);
        setCantidadJugadores(cancha.cantidadJugadores);
        setPrecioHora(cancha.precioHora);
        setDescripcion(cancha.descripcion ?? "");
    }

    async function guardarCancha() {
        if (!nombre || !tipoDeporte || precioHora <= 0) {
            alert("Debe completar nombre, deporte y precio.");
            return;
        }

        const cancha = {
            nombre,
            tipoDeporte,
            tipoSuperficie,
            interior,
            iluminacion,
            cantidadJugadores,
            precioHora,
            descripcion,
            activa: true,
        };

        const url = idEditando
            ? `http://192.168.1.13:7174/api/Canchas/${idEditando}`
            : "http://192.168.1.13:7174/api/Canchas";

        const method = idEditando ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cancha),
        });

        if (response.ok) {
            alert(idEditando ? "Cancha actualizada." : "Cancha creada.");
            limpiarFormulario();
            obtenerCanchas();
        } else {
            const error = await response.text();
            alert(error);
        }
    }

    async function desactivarCancha(id: number) {
        const confirmar = confirm("¿Deseas desactivar esta cancha?");
        if (!confirmar) return;

        const response = await fetch(`http://192.168.1.13:7174/api/Canchas/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Cancha desactivada.");
            obtenerCanchas();
        } else {
            alert("No se pudo desactivar.");
        }
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-6 md:p-10">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2">
                            Admin de Canchas
                        </h1>
                        <p className="text-gray-400">
                            Crear, editar y desactivar canchas.
                        </p>
                    </div>

                    <a
                        href="/admin"
                        className="w-full md:w-auto text-center bg-green-500 text-black px-5 py-3 rounded-xl font-bold"
                    >
                        Volver
                    </a>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 mb-8">
                    <h2 className="text-2xl font-bold text-green-500 mb-5">
                        {idEditando ? "Editar cancha" : "Nueva cancha"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre"
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <select
                            value={tipoDeporte}
                            onChange={(e) => setTipoDeporte(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        >
                            <option value="Tenis">Tenis</option>
                            <option value="Pickleball">Pickleball</option>
                        </select>

                        <input
                            value={tipoSuperficie}
                            onChange={(e) => setTipoSuperficie(e.target.value)}
                            placeholder="Superficie"
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <input
                            type="number"
                            value={cantidadJugadores}
                            onChange={(e) => setCantidadJugadores(Number(e.target.value))}
                            placeholder="Jugadores"
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <input
                            type="number"
                            value={precioHora}
                            onChange={(e) => setPrecioHora(Number(e.target.value))}
                            placeholder="Precio por hora"
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <input
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción"
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <label className="flex items-center gap-3 bg-black border border-zinc-700 rounded-xl p-3">
                            <input
                                type="checkbox"
                                checked={interior}
                                onChange={(e) => setInterior(e.target.checked)}
                            />
                            Interior
                        </label>

                        <label className="flex items-center gap-3 bg-black border border-zinc-700 rounded-xl p-3">
                            <input
                                type="checkbox"
                                checked={iluminacion}
                                onChange={(e) => setIluminacion(e.target.checked)}
                            />
                            Iluminación
                        </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                        <button
                            onClick={guardarCancha}
                            className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-xl font-bold"
                        >
                            {idEditando ? "Actualizar cancha" : "Crear cancha"}
                        </button>

                        {idEditando && (
                            <button
                                onClick={limpiarFormulario}
                                className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-xl font-bold"
                            >
                                Cancelar edición
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4">
                    {canchas.map((cancha) => (
                        <div
                            key={cancha.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-5"
                        >
                            <div>
                                <p className="text-green-400 font-bold text-xl">
                                    {cancha.nombre}
                                </p>

                                <p className="text-gray-400">
                                    {cancha.tipoDeporte} | {cancha.tipoSuperficie}
                                </p>

                                <p className="text-gray-400">
                                    Jugadores: {cancha.cantidadJugadores}
                                </p>

                                <p className="text-gray-400">
                                    Precio: ₡
                                    {Number(cancha.precioHora ?? 0).toLocaleString("es-CR")}
                                </p>

                                <p
                                    className={
                                        cancha.activa
                                            ? "text-green-400 font-bold"
                                            : "text-red-400 font-bold"
                                    }
                                >
                                    {cancha.activa ? "Activa" : "Inactiva"}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => editar(cancha)}
                                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white px-5 py-3 rounded-xl font-bold"
                                >
                                    Editar
                                </button>

                                {cancha.activa && (
                                    <button
                                        onClick={() => desactivarCancha(cancha.id)}
                                        className="w-full sm:w-auto bg-red-500 hover:bg-red-400 text-white px-5 py-3 rounded-xl font-bold"
                                    >
                                        Desactivar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    );
}