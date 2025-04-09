"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEnvelope, FaGoogle } from "react-icons/fa"; // Import icons

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (session) {
      router.push(redirectTo); // Redirect after login
    }
  }, [session, router, redirectTo]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // console.log("Logging in with", email, password);
    const res = await signIn("credentials", {
      username: email,
      password: password,
      redirect: false,
    });
    if (res.error) {
      setError('Invalid email or password');
    }
    else if (res.ok) router.push(redirectTo);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 mt-0" 
    style={{ backgroundColor: "#FDF6EE" }}>
      <h1 className="font-bold text-5xl">Welcome back to Flavor Forum.</h1>
      <h2 className="text-gray-600 text-center">
        Login to join communities, organize recipes, and more.
      </h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-64 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-64 rounded"
      />
      <button
        onClick={handleLogin}
        className="flex items-center justify-center gap-2 border border-black text-black font-bold p-2 mt-2 w-64 bg-white rounded hover:bg-black hover:text-white"
      >
        <FaEnvelope />
        Login
      </button>
      <button
        onClick={() => signIn("google", { callbackUrl: redirectTo })}
        className="flex items-center justify-center gap-2 border border-black text-black font-bold p-2 mt-2 w-64 bg-white rounded hover:bg-black hover:text-white"
      >
        <FaGoogle />
        Sign in with Google
      </button>
      <p className="mt-4 text-gray-600 text-blue">
        Don't have an account?{" "}
        <a
          href="/signup"
          className="underline text-black font-bold hover:text-blue-500"
        >
          Sign up now!
        </a>
      </p>
    </div>
  );
}