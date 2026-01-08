import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
import type { User } from './types/index'; // We might need to update types to include User

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        // Use type assertion manually if types/index.ts is not updated yet with User, 
        // or rely on Prisma inference. For now, let's treat it as any to avoid immediate type errors 
        // until we update the central types file.
        return user as any;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user || !user.password) return null;

                    // Note: In a real app we would check password here. 
                    // Assuming user.password is the hashed password.
                    const passwordsMatch = await bcrypt.compare(password, user.password); // Using bcryptjs

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
