"use client";

import Link from "next/link";

export default function RecordingsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
      <div className="max-w-lg text-center px-6">
        <h1 className="text-3xl font-bold mb-4">Recordings feature removed</h1>
        <p className="text-gray-400 mb-6">
          Video interview recordings are no longer stored or accessible in this
          version of Interwise.
        </p>
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
