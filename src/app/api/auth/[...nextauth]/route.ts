// src/app/api/auth/[...nextauth]/route.ts
// Handler que o NextAuth usa para processar todas as rotas de autenticação:
// /api/auth/signin, /api/auth/signout, /api/auth/session, etc.

import { handlers } from "@/auth";
export const { GET, POST } = handlers;