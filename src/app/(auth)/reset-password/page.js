"use client";

import { useState } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    console.log("Resetting password for", email);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-64" />
      <button onClick={handleResetPassword} className="bg-blue-500 text-white p-2 mt-2 w-64">Reset Password</button>
    </div>
  );
}