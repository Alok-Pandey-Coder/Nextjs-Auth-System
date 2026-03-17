"use client";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function verifyEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  const verifyUserEmail = async () => {
    try {
      await axios.post("/api/users/verifyemail", { token });
      setVerified(true);
    } catch (error: any) {
      setError(true);
      console.log(error.response.data);
    }
  };

  useEffect(() => {
    const urlToken = window.location.search.split("=")[1];
    setToken(urlToken || "");
  }, []);

  useEffect(() => {
    if (token.length > 0) {
      verifyUserEmail();
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-semibold text-white mb-4">Verify Email</h1>

        {/* Token */}
        <p className="text-sm text-gray-400 mb-4">Verification Token</p>
        <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 text-xs break-all">
          {token ? token : "No token found"}
        </div>

        {/* Success */}
        {verified && (
          <div className="mt-6">
            <h2 className="text-xl text-green-400 font-medium mb-2">
              ✅ Email Verified Successfully
            </h2>
            <Link
              href="/login"
              className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6">
            <h2 className="text-xl text-red-400 font-medium">
              ❌ Verification Failed
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
