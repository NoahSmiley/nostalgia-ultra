import NextAuth from "next-auth";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";
import { prisma } from "./db";
import { authConfig } from "./auth.config";
import { cookies } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    MicrosoftEntraId({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}/v2.0`,
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
    async signIn({ user, account }) {
      // Handle Microsoft sign in
      if (account?.provider === "microsoft-entra-id") {
        const microsoftId = account.providerAccountId;
        const email = user.email;

        if (!email) return false;

        try {
          // Check if user already exists with this Microsoft ID or email
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { microsoftId },
                { email },
              ],
            },
          });

          // If user exists, allow them to sign in
          if (dbUser) {
            // Update Microsoft ID if not set
            if (!dbUser.microsoftId) {
              try {
                dbUser = await prisma.user.update({
                  where: { id: dbUser.id },
                  data: {
                    microsoftId,
                    displayName: user.name || dbUser.displayName,
                  },
                });
              } catch (updateError) {
                console.error("Failed to link Microsoft ID:", updateError);
                // Continue anyway - user exists and can sign in
              }
            }
            // Store the database user ID for session
            user.id = dbUser.id;
            return true;
          }

          // New user - they need an invite code
          const cookieStore = await cookies();
          const inviteCodeValue = cookieStore.get("invite_code")?.value;

          if (!inviteCodeValue) {
            // No invite code - redirect to invite page
            return "/invite?error=invite_required";
          }

          // Validate invite code
          const inviteCode = await prisma.inviteCode.findUnique({
            where: { code: inviteCodeValue.toUpperCase().trim() },
          });

          if (!inviteCode || !inviteCode.active || inviteCode.uses >= inviteCode.maxUses) {
            return "/invite?error=invalid_invite";
          }

          // Create new user with invite code
          dbUser = await prisma.user.create({
            data: {
              email,
              username: email.split("@")[0],
              microsoftId,
              displayName: user.name || undefined,
              inviteCodeId: inviteCode.id,
              // Make the first admin user
              isAdmin: email === "noahsmiley123@outlook.com",
            },
          });

          // Increment invite code usage
          await prisma.inviteCode.update({
            where: { id: inviteCode.id },
            data: { uses: { increment: 1 } },
          });

          // Clear the invite code cookie
          cookieStore.delete("invite_code");

          // Store the database user ID for session
          user.id = dbUser.id;
        } catch (error) {
          console.error("Microsoft sign-in error:", error);
          return "/invite?error=signin_error";
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
            session.user.isAdmin = dbUser.isAdmin || dbUser.email === "noahsmiley123@outlook.com";
          }
        } catch (error) {
          console.error("Session fetch error:", error);
        }
      }
      return session;
    },
  },
});
