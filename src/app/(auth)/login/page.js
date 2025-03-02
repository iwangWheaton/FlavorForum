"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (session) {
      router.push("/main"); // Redirect after login
    }
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Logging in with", email, password);
    const res = await signIn("credentials", {
      username: e.target.username.value,
      password: e.target.password.value,
      redirect: false,
    });
    if (res.ok) router.push(redirectTo);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="font-bold">Welcome back to Flavor Forum.</h1>
      <h2 className="text-gray">Login to join communities, organize recipes, and more.</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-64"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-64"
      />
      <button onClick={handleLogin} className="bg-blue text-white p-2 mt-2 w-64">
        Login
      </button>
      <button onClick={() => signIn("google")} className="bg-red text-white p-2 mt-2 w-64">
        Sign in with Google
      </button>
    </div>
  );
}