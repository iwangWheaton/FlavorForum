import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between p-4 bg-gray-800 text-white">
      <Link href="/">Home</Link>
      <Link href="/recipes">Recipes</Link>
      <Link href="/community">Community</Link>
      <Link href="/profile">Profile</Link>
      {session ? (
        <>
          <Link href="/profile">{session.user.name}</Link>
          <button onClick={() => signOut()}>Logout</button>
        </>
      ) : (
        <button onClick={() => signIn()}>Login</button>
      )}
    </nav>
  );
}
