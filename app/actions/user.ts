"use server";

import { prisma } from "../lib/prisma";
import { auth } from "@/app/auth";
import { revalidatePath } from "next/cache";

export async function getUserInfo() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userData = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      organization: true,
    },
  });

  if (!userData) return null;

  const organization = await prisma.organization.findUnique({
    where: {
      id: session.user.organizationId || "",
    },
  });

  return {
    ...userData,
    membership: userData.organization,
    organizationDetails: organization,
  };
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  if (!name || name.length < 2) {
    throw new Error("Invalid name");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/account");
}

export async function updateOrganization(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId)
    throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  if (!name || name.length < 2) {
    throw new Error("Invalid organization name");
  }

  // Verify ownership
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
      },
    },
  });

  if (membership?.role !== "OWNER") {
    throw new Error("Only owners can update organization details");
  }

  await prisma.organization.update({
    where: { id: session.user.organizationId },
    data: { name },
  });

  revalidatePath("/account");
}
