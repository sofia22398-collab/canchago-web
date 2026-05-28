"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    async function login() {
        const response = await fetch("https://localhost:7174/api/Usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ correo, password }),
        });

        if (response.ok) {
            const usuario = await response.json();

            localStorage.setItem(
                "usuario",
                JSON.stringify(usuario)
            );

            router.push("/");
        } else {
            alert("Correo o contraseña incorrectos.");
        }
    }

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-6">

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl">

                <h1 className="text-4xl md:text-5xl font-bold text-green-500 mb-2 text-center">
                    CanchaGo
                </h1>

                <p className="text-gray-400 mb-6 text-center text-sm md:text-base">
                    Inicia sesión para reservar.
                </p>

                <label className="block mb-2 text-sm">
                    Correo
                </label>

                <input
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full mb-4 p-3 rounded-xl bg-black border border-zinc-700 focus:outline-none focus:border-green-500"
                    placeholder="correo@ejemplo.com"
                />

                <label className="block mb-2 text-sm">
                    Contraseña
                </label>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-6 p-3 rounded-xl bg-black border border-zinc-700 focus:outline-none focus:border-green-500"
                    placeholder="********"
                />

                <button
                    onClick={login}
                    className="w-full bg-green-500 hover:bg-green-400 transition-all text-black font-bold py-3 rounded-xl"
                >
                    Iniciar sesión
                </button>

                <a
                    href="/register"
                    className="block text-center text-green-400 hover:text-green-300 mt-4 text-sm md:text-base"
                >
                    Crear cuenta nueva
                </a>

            </div>

        </main>
    );
}