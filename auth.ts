import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session }) {
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log("signIn", { user, account, profile, email, credentials });
      const existingUser = await prisma.user.findFirst({
        where: {
          email: profile?.email ?? "",
        },
      });

      console.log("Existing user", existingUser);
      if (!profile?.email || !profile?.name || !profile?.picture) {
        return false;
      }

      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            email: profile?.email,
            name: profile?.name,
            image: profile?.picture,
          },
        });
        console.log("New user", newUser);
      }
      return true;
    },
  },
  ...authConfig,
});
