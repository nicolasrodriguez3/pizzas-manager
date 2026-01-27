"use client";

import Link from "next/link";
import { useActionState } from "react";

import { authenticate, register, RegisterState } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-orange-500 outline-none"
          id="email"
          type="email"
          name="email"
          placeholder="user@example.com"
          required
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-orange-500 outline-none"
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/register"
            className="font-medium text-orange-400 hover:text-orange-300"
          >
            ¿No tienes una cuenta? Regístrate
          </Link>
        </div>
      </div>
      <div>
        <Button
          variant="default"
          className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white"
          disabled={isPending}
        >
          {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>
      {errorMessage && (
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      )}
    </form>
  );
}

const initialRegisterState: RegisterState = { message: "", errors: {} };

export function RegisterForm() {
  const [state, dispatch, isPending] = useActionState(
    register,
    initialRegisterState,
  );

  return (
    <form action={dispatch} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="name"
        >
          Nombre
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-orange-500 outline-none"
          id="name"
          type="text"
          name="name"
          placeholder="John Doe"
          required
        />
        {state.errors?.name && (
          <p className="text-sm text-red-500 mt-1">{state.errors.name[0]}</p>
        )}
      </div>
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-orange-500 outline-none"
          id="email"
          type="email"
          name="email"
          required
        />
        {state.errors?.email && (
          <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>
        )}
      </div>
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-orange-500 outline-none"
          id="password"
          type="password"
          name="password"
          required
          minLength={6}
        />
        {state.errors?.password && (
          <p className="text-sm text-red-500 mt-1">
            {state.errors.password[0]}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/login"
            className="font-medium text-orange-400 hover:text-orange-300"
          >
            ¿Ya tienes una cuenta? Inicia sesión
          </Link>
        </div>
      </div>
      <div>
        <Button
          variant="default"
          className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white"
          disabled={isPending}
        >
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </div>
      {state.message && (
        <p className="text-sm text-red-500 text-center">{state.message}</p>
      )}
    </form>
  );
}
