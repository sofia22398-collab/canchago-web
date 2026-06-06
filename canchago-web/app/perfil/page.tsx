"use client";

import { useEffect, useState } from "react";

export default function PerfilPage() {
    const [usuario, setUsuario] = useState<any | null>(null);

    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [genero, setGenero] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            window.location.href = "/login";
            return;
        }

        const user = JSON.parse(usuarioGuardado);

        setUsuario(user);
        setNombre(user.nombre || "");
        setCorreo(user.correo || "");
        setTelefono(user.telefono || "");
        setGenero(user.genero || "");
        setFechaNacimiento(user.fechaNacimiento?.substring(0, 10) || "");
    }, []);

    function guardarCambios() {
        if (!usuario) return;

        const usuarioActualizado = {
            ...usuario,
            nombre,
            correo,
            telefono,
            genero,
            fechaNacimiento,
        };

        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);

        alert("Perfil actualizado correctamente ✅");
    }

    if (!usuario) {
        return null;
    }

    return (
        <main className="min-h-screen bg-black text-white px-4 py-6 pb-28">
            <div className="max-w-xl mx-auto">
                <a href="/" className="text-green-400 font-bold">
                    ← Volver
                </a>

                <h1 className="text-3xl font-bold text-green-500 mt-6 mb-2">
                    Mi perfil
                </h1>

                <p className="text-gray-400 mb-6">
                    Editá tu información personal.
                </p>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Nombre
                        </label>
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white"
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Número de teléfono
                        </label>
                        <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white"
                            placeholder="8888-8888"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Género
                        </label>
                        <select
                            value={genero}
                            onChange={(e) => setGenero(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white"
                        >
                            <option value="">Seleccionar</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Otro">Otro</option>
                            <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Fecha de cumpleaños
                        </label>
                        <input
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white"
                        />
                    </div>

                    <button
                        onClick={guardarCambios}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl mt-4"
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </main>
    );
}