// src/auth.ts
// Configuração central do NextAuth v5.
// Este arquivo é importado em toda a aplicação para acessar sessão,
// proteger rotas e fazer login/logout.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth", // redireciona para nossa página de login customizada
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },

      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) return null;

        // Busca o usuário no banco
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // Compara a senha com o hash
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    // Controla para onde o usuário vai após login
    async redirect({ url, baseUrl }) {
      // Sempre manda para o dashboard após login
      if (url.startsWith(baseUrl)) return `${baseUrl}/dashboard`;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },

    // Adiciona o id do usuário no token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Adiciona o id do usuário na sessão (acessível via useSession)
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});