import NextAuth from "next-auth";
import Github from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    Github({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET || "",
    }),
  ],
});

export { handler as GET, handler as POST };
