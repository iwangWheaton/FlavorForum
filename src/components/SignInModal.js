"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function SignInModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Handle Email/Password Login
  const handleLogin = async () => {
    setError("");
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      onClose();
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await signIn("google", { redirect: false });
      onClose();
    } catch (error) {
      setError("Google Sign-In failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Log In</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-red-500 text-white p-2 rounded mb-4 hover:bg-red-600 transition"
        >
          <img src="/google-icon.svg" alt="Google" className="h-5 w-5 mr-2" />
          Sign in with Google
        </button>

        <hr className="my-4" />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Sign In
        </button>

        {/* Forgot Password / Sign Up Links */}
        <div className="flex justify-between mt-3 text-sm text-blue-500">
          <button onClick={() => alert("Forgot Password?")} className="hover:underline">
            Forgot Password?
          </button>
          <button onClick={() => alert("Redirect to Sign Up")} className="hover:underline">
            Create New Account
          </button>
        </div>

        {/* Close Button */}
        <button
          className="mt-4 w-full p-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          onClick={onClose}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
