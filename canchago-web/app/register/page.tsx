"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");

    async function registrar() {
        if (!nombre || !correo || !password) {
            alert("Nombre, correo y contraseña son obligatorios.");
            return;
        }

        const response = await fetch("https://localhost:7174/api/Usuarios/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nombre,
                correo,
                telefono,
                password,
            }),
        });

        if (response.ok) {
            alert("Usuario registrado correctamente ✅");
            router.push("/login");
        } else {
            const error = await response.text();
            alert(error);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-4xl font-bold text-green-500 mb-2">
                    Crear cuenta
                </h1>

                <p className="text-gray-400 mb-6">
                    Regístrate para reservar tus canchas.
                </p>

                <label className="block mb-2 text-sm">Nombre</label>
                <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full mb-4 p-3 rounded-xl bg-black border border-zinc-700"
                    placeholder="Nombre completo"
                />

                <label className="block mb-2 text-sm">Correo</label>
                <input
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full mb-4 p-3 rounded-xl bg-black border border-zinc-700"
                    placeholder="correo@ejemplo.com"
                />

                <label className="block mb-2 text-sm">Teléfono</label>
                <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full mb-4 p-3 rounded-xl bg-black border border-zinc-700"
                    placeholder="8888-8888"
                />

                <label className="block mb-2 text-sm">Contraseña</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-6 p-3 rounded-xl bg-black border border-zinc-700"
                    placeholder="********"
                />

                <button
                    onClick={registrar}
                    className="w-full bg-green-500 text-black font-bold py-3 rounded-xl mb-4"
                >
                    Crear cuenta
                </button>

                <a
                    href="/login"
                    className="block text-center text-green-400 hover:text-green-300"
                >
                    Ya tengo cuenta
                </a>
            </div>
        </main>
    );
}