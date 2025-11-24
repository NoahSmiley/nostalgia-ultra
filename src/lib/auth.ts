import NextAuth from "next-auth";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";
import { prisma } from "./db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    MicrosoftEntraId({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
      authorization: {
        params: {
          scope: "openid email profile offline_access",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Handle Microsoft sign in
      if (account?.provider === "microsoft-entra-id") {
        const microsoftId = account.providerAccountId;
        const email = user.email;

        if (!email) return false;

        try {
          // Check if user exists with this Microsoft ID or email
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { microsoftId },
                { email },
              ],
            },
          });

          if (!dbUser) {
            // Create new user from Microsoft account
            dbUser = await prisma.user.create({
              data: {
                email,
                username: email.split("@")[0], // Use email prefix as default username
                microsoftId,
                displayName: user.name || undefined,
              },
            });
          } else if (!dbUser.microsoftId) {
            // Link existing user to Microsoft account
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                microsoftId,
                displayName: user.name || undefined,
              },
            });
          }

          // Store the database user ID for session
          user.id = dbUser.id;
        } catch (error) {
          console.error("Microsoft sign-in error:", error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;

        // Fetch additional user data
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: {
              minecraftLink: true,
              subscriptions: true,
            },
          });

          if (dbUser) {
            session.user.username = dbUser.username;
            session.user.minecraftLinked = !!dbUser.minecraftLink;
            session.user.hasActiveSubscription = dbUser.subscriptions.some(
              sub => sub.status === "active"
            );
          }
        } catch (error) {
          console.error("Session fetch error:", error);
        }
      }
      return session;
    },
  },
});
