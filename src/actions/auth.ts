"use server";

import { APIError } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.email({
    message: "Por favor, ingrese un correo electrónico válido.",
  }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
};

/**
 * Server Action to authenticate a user.
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await authConfig.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return error.message;
    }
    // Next.js redirect throws a specific error that should not be caught
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Authentication error:", error);
    return "Algo salió mal al iniciar sesión.";
  }
  redirect("/");
}

/**
 * Server Action to register a new user and create their organization.
 */
export async function register(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campos faltantes. No se pudo registrar el usuario.",
    };
  }

  const { email, password, name } = validatedFields.data;

  try {
    // 1. Create user with BetterAuth (auto-signs in by default if configured)
    const result = await authConfig.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });
    if (!result || !result.user) {
      return { message: "Error al registrar usuario." };
    }

    const userId = result.user.id;

    // 2. Auto-create organization and membership
    const orgName = name ? `${name}'s Business` : "My Business";

    const organization = await prisma.organization.create({
      data: {
        name: orgName,
      },
    });
    // 3. Update user with mandatory organizationId
    await prisma.user.update({
      where: { id: userId },
      data: { organizationId: organization.id },
    });
    // 4. Create organization membership
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: userId,
        role: "OWNER",
      },
    });

    await authConfig.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { message: error.message };
    }
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Failed to create user/organization:", error);
    return { message: "Error de servidor: No se pudo completar el registro." };
  }

  redirect("/");
}

/**
 * Server Action to sign out the current user.
 */
export async function handleSignOut() {
  try {
    await authConfig.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Sign out error:", error);
  }
  redirect("/login");
}
