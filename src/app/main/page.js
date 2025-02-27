import { getSession } from "next-auth/react";

export default async function MainPage() {
  const session = await getSession();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Welcome Back, {session?.user?.name || "Chef"}! 👨‍🍳</h1>
      <p className="text-lg mt-2">Let&apos;s find your next favorite recipe.</p>

      {/* Featured Recipes Section */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Your Saved Recipes</h2>
        {/* Map through user's saved recipes */}
      </section>

      {/* Community Section */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Community Highlights</h2>
        {/* Display latest community posts */}
      </section>
    </main>
  );
}
