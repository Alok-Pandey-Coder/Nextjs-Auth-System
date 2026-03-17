"use client";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState("nothing");
  const logout = async () => {
    try {
      await axios.post("/api/users/logout");
      toast.success("Logout successfully");
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const getUserDetails = async () => {
    const res = await axios.get("/api/users/me");
    console.log(res.data);
    setData(res.data.data._id);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md border border-gray-700 p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-semibold text-white mb-2">Profile</h1>

        <p className="text-gray-400 mb-4">Welcome to your profile page</p>

        {/* User ID / Data */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-1">User ID</p>
          <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 text-sm break-all">
            {data === "nothing" ? (
              "Nothing"
            ) : (
              <Link
                href={`/profile/${data}`}
                className="text-indigo-400 hover:underline"
              >
                {data}
              </Link>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={getUserDetails}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Get User Details
          </button>

          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
