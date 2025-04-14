import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signInWithEmailAndPassword } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { adminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin"; // Needed for serverTimestamp

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user = userCredential.user;
          return { id: user.uid, name: user.displayName, email: user.email };
        } catch (error) {
          console.error("Error during authorization:", error.message);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.uid = user.id || user.uid;
        }
        return token;
      } catch (error) {
        console.error("Error in JWT callback:", error.message);
        throw new Error("Failed to process JWT token");
      }
    },
    async session({ session, token }) {
      try {
        session.user.uid = token.uid;

        const userRef = adminDb.collection("users").doc(token.uid);
        const docSnap = await userRef.get();

        if (!docSnap.exists) {
          await userRef.set({
            userID: token.uid,
            email: session.user.email,
            profilePic: session.user.image || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error.message);
        throw new Error("Failed to process session");
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
