"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
    const [reservas, setReservas] = useState<any[]>([]);
    const [canchas, setCanchas] = useState<any[]>([]);
    const [bloqueos, setBloqueos] = useState<any[]>([]);

    const [canchaId, setCanchaId] = useState("");
    const [fechaBloqueo, setFechaBloqueo] = useState("");
    const [horaInicio, setHoraInicio] = useState("08:00");
    const [horaFin, setHoraFin] = useState("09:00");
    const [motivo, setMotivo] = useState("");

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }

        const usuarioActual = JSON.parse(usuarioGuardado);

        if (usuarioActual.rol !== "Admin") {
            alert("No tienes permisos para entrar al panel administrador.");
            window.location.href = "/";
            return;
        }

        obtenerReservas();
        obtenerCanchas();
        obtenerBloqueos();
    }, []);

    async function obtenerReservas() {
        const response = await fetch("https://localhost:7174/api/Reservas");
        const data = await response.json();
        setReservas(data);
    }

    async function obtenerCanchas() {
        const response = await fetch("https://localhost:7174/api/Canchas");
        const data = await response.json();

        setCanchas(data);

        if (data.length > 0) {
            setCanchaId(data[0].id.toString());
        }
    }

    async function obtenerBloqueos() {
        const response = await fetch("https://localhost:7174/api/HorariosBloqueados");
        const data = await response.json();
        setBloqueos(data);
    }

    async function bloquearHorario() {
        if (!fechaBloqueo) {
            alert("Debe seleccionar una fecha.");
            return;
        }

        if (horaInicio >= horaFin) {
            alert("La hora inicio debe ser menor que la hora fin.");
            return;
        }

        const bloqueo = {
            canchaId: Number(canchaId),
            fecha: `${fechaBloqueo}T00:00:00`,
            horaInicio: `${horaInicio}:00`,
            horaFin: `${horaFin}:00`,
            motivo: motivo || "Bloqueado por administración",
        };

        const response = await fetch("https://localhost:7174/api/HorariosBloqueados", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bloqueo),
        });

        if (response.ok) {
            alert("Horario bloqueado correctamente.");
            setFechaBloqueo("");
            setHoraInicio("08:00");
            setHoraFin("09:00");
            setMotivo("");
            obtenerBloqueos();
        } else {
            const error = await response.text();
            alert(error);
        }
    }

    async function eliminarBloqueo(id: number) {
        const confirmar = confirm("¿Desea eliminar este bloqueo?");
        if (!confirmar) return;

        const response = await fetch(
            `https://localhost:7174/api/HorariosBloqueados/${id}`,
            {
                method: "DELETE",
            }
        );

        if (response.ok) {
            alert("Bloqueo eliminado correctamente.");
            obtenerBloqueos();
        } else {
            alert("No se pudo eliminar el bloqueo.");
        }
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

        if (response.ok) {
            alert("Reserva cancelada correctamente.");
            obtenerReservas();
        } else {
            alert("No se pudo cancelar la reserva.");
        }
    }

    async function marcarComoPagado(id: number) {
        const confirmar = confirm("¿Desea marcar esta reserva como pagada?");
        if (!confirmar) return;

        const response = await fetch(
            `https://localhost:7174/api/Reservas/${id}/pago`,
            {
                method: "PUT",
            }
        );

        if (response.ok) {
            alert("Reserva marcada como pagada.");
            obtenerReservas();
        } else {
            const error = await response.text();
            alert(error);
        }
    }

    const reservasActivas = reservas.filter((r) => r.estado !== "Cancelada");
    const reservasCanceladas = reservas.filter((r) => r.estado === "Cancelada");
    const reservasPagadas = reservas.filter((r) => r.estadoPago === "Pagado");

    return (
        <main className="min-h-screen bg-black text-white px-4 py-6 md:p-10">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2">
                            Dashboard Admin
                        </h1>
                        <p className="text-gray-400">
                            Control general de reservas, pagos y bloqueos.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <a
                            href="/admin/canchas"
                            className="w-full sm:w-auto text-center bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-xl font-bold"
                        >
                            Administrar canchas
                        </a>

                        <a
                            href="/"
                            className="w-full sm:w-auto text-center bg-green-500 text-black px-5 py-3 rounded-xl font-bold"
                        >
                            Volver
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6">
                        <p className="text-gray-400">Total reservas</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-green-500">
                            {reservas.length}
                        </h2>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6">
                        <p className="text-gray-400">Activas</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-green-500">
                            {reservasActivas.length}
                        </h2>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6">
                        <p className="text-gray-400">Pagadas</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-blue-400">
                            {reservasPagadas.length}
                        </h2>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6">
                        <p className="text-gray-400">Canceladas</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-red-400">
                            {reservasCanceladas.length}
                        </h2>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 sm:col-span-2 lg:col-span-1">
                        <p className="text-gray-400">Bloqueos</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400">
                            {bloqueos.length}
                        </h2>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-5 text-green-500">
                        Bloquear horario
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                        <select
                            value={canchaId}
                            onChange={(e) => setCanchaId(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        >
                            {canchas.map((cancha) => (
                                <option key={cancha.id} value={cancha.id}>
                                    {cancha.nombre}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={fechaBloqueo}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setFechaBloqueo(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <input
                            type="time"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <input
                            type="time"
                            value={horaFin}
                            onChange={(e) => setHoraFin(e.target.value)}
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700"
                        />

                        <input
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Motivo"
                            className="w-full p-3 rounded-xl bg-black border border-zinc-700 md:col-span-2 xl:col-span-1"
                        />
                    </div>

                    <button
                        onClick={bloquearHorario}
                        className="mt-4 w-full sm:w-auto bg-red-500 hover:bg-red-400 text-white px-5 py-3 rounded-xl font-bold"
                    >
                        Bloquear horario
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6">
                        <h2 className="text-2xl font-bold mb-5 text-green-500">
                            Reservas recientes
                        </h2>

                        <div className="grid gap-4">
                            {reservas.length === 0 ? (
                                <p className="text-gray-400">
                                    No hay reservas registradas.
                                </p>
                            ) : (
                                reservas.map((reserva) => (
                                    <div
                                        key={reserva.id}
                                        className="bg-black border border-zinc-800 rounded-xl p-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                            <div>
                                                <p className="font-bold">
                                                    Reserva #{reserva.id}
                                                </p>

                                                <p className="text-gray-400 break-words">
                                                    Usuario:{" "}
                                                    {reserva.usuario?.nombre ??
                                                        reserva.usuarioId}
                                                </p>

                                                <p className="text-gray-400">
                                                    Cancha:{" "}
                                                    {reserva.cancha?.nombre ??
                                                        reserva.canchaId}
                                                </p>

                                                <p className="text-gray-400">
                                                    Fecha:{" "}
                                                    {reserva.fecha?.substring(0, 10)}
                                                </p>

                                                <p className="text-gray-400">
                                                    Hora:{" "}
                                                    {reserva.horaInicio?.substring(0, 5)} -{" "}
                                                    {reserva.horaFin?.substring(0, 5)}
                                                </p>

                                                <p className="text-gray-400">
                                                    Pago:{" "}
                                                    {reserva.estadoPago ?? "Pendiente"}
                                                </p>

                                                <p className="text-gray-400">
                                                    Monto: ₡
                                                    {Number(
                                                        reserva.montoTotal ?? 0
                                                    ).toLocaleString("es-CR")}
                                                </p>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <p
                                                    className={
                                                        reserva.estado === "Cancelada"
                                                            ? "text-red-400 font-bold"
                                                            : "text-green-400 font-bold"
                                                    }
                                                >
                                                    {reserva.estado}
                                                </p>

                                                <p
                                                    className={
                                                        reserva.estadoPago === "Pagado"
                                                            ? "text-blue-400 font-bold"
                                                            : "text-yellow-400 font-bold"
                                                    }
                                                >
                                                    {reserva.estadoPago ?? "Pendiente"}
                                                </p>
                                            </div>
                                        </div>

                                        {reserva.estado !== "Cancelada" && (
                                            <button
                                                onClick={() =>
                                                    cancelarReserva(reserva.id)
                                                }
                                                className="mt-4 w-full bg-red-500 hover:bg-red-400 text-white py-2 rounded-xl font-bold"
                                            >
                                                Cancelar reserva
                                            </button>
                                        )}

                                        {reserva.estado !== "Cancelada" &&
                                            reserva.estadoPago !== "Pagado" && (
                                                <button
                                                    onClick={() =>
                                                        marcarComoPagado(reserva.id)
                                                    }
                                                    className="mt-3 w-full bg-green-500 hover:bg-green-400 text-black py-2 rounded-xl font-bold"
                                                >
                                                    Marcar como pagado
                                                </button>
                                            )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6">
                        <h2 className="text-2xl font-bold mb-5 text-yellow-400">
                            Horarios bloqueados
                        </h2>

                        <div className="grid gap-4">
                            {bloqueos.length === 0 ? (
                                <p className="text-gray-400">
                                    No hay horarios bloqueados.
                                </p>
                            ) : (
                                bloqueos.map((bloqueo) => (
                                    <div
                                        key={bloqueo.id}
                                        className="bg-black border border-zinc-800 rounded-xl p-4"
                                    >
                                        <p className="font-bold text-yellow-400">
                                            Bloqueo #{bloqueo.id}
                                        </p>

                                        <p className="text-gray-400">
                                            Cancha:{" "}
                                            {bloqueo.cancha?.nombre ??
                                                bloqueo.canchaId}
                                        </p>

                                        <p className="text-gray-400">
                                            Fecha:{" "}
                                            {bloqueo.fecha?.substring(0, 10)}
                                        </p>

                                        <p className="text-gray-400">
                                            Hora:{" "}
                                            {bloqueo.horaInicio?.substring(0, 5)} -{" "}
                                            {bloqueo.horaFin?.substring(0, 5)}
                                        </p>

                                        <p className="text-gray-400 break-words">
                                            Motivo:{" "}
                                            {bloqueo.motivo ||
                                                "Sin motivo indicado"}
                                        </p>

                                        <button
                                            onClick={() =>
                                                eliminarBloqueo(bloqueo.id)
                                            }
                                            className="mt-4 w-full bg-red-500 hover:bg-red-400 text-white py-2 rounded-xl font-bold"
                                        >
                                            Eliminar bloqueo
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}