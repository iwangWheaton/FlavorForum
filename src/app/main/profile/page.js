import Link from "next/link";

export default function Profile() {
  return (
    <div className = "p-6">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link href="/main/profile/boards">
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold">My Recipe Boards</h2>
            <p className="text-gray/70">Organize your saved recipes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}