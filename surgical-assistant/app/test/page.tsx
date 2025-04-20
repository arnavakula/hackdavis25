"use client";

import { useUser } from "@auth0/nextjs-auth0";

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="p-6">
      {user ? (
        <div>
          <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
          <p>Email: {user.email}</p>
          <a href="auth/logout">
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </a>
        </div>
      ) : (
        <a href="/api/auth/login">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
        </a>
      )}
    </main>
  );
}
