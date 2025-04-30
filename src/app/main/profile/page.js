"use client";
import Link from "next/link";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import Button from "@/components/Button";

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", session.user.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData({
              ...docSnap.data(),
              profileImage: docSnap.data().profileImage || session.user.image,
            });
          } else {
            // Automatically set the name to the session name if no data exists
            const [firstName, ...lastNameParts] = session.user.name.split(" ");
            setUserData((prev) => ({
              ...prev,
              firstName: firstName || "",
              lastName: lastNameParts.join(" ") || "",
              profileImage: session.user.image || "/images/placeholder.jpg",
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${session.user.email}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);
      setUserData((prev) => ({ ...prev, profileImage: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (session?.user?.email) {
        const docRef = doc(db, "users", session.user.email);
        await setDoc(docRef, userData, { merge: true });
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <div className="bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>

        {/* Profile Image Section */}
        <div className="flex items-center gap-4">
          <Image
            src={userData.profileImage || "/images/placeholder.jpg"}
            alt="Profile Picture"
            width={120}
            height={120}
            className="rounded-full"
          />
          <div>
            <label htmlFor="profileImage" className="block font-semibold text-black">
              Change Profile Image:
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-2"
            />
          </div>
        </div>

        {/* User Info Form */}
        <form className="mt-6 space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block font-semibold text-black">
              First Name:
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className="w-full border text-black border-gray-300 p-2 rounded"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block font-semibold text-black">
              Last Name:
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              className="w-full border text-black border-gray-300 p-2 rounded"
            />
          </div> 

          {/* Birthday */}
          <div>
            <label htmlFor="birthday" className="block font-semibold text-black">
              Birthday:
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={userData.birthday}
              onChange={handleInputChange}
              className="w-full border text-black border-gray-300 p-2 rounded"
            />
          </div>
        </form>

        {/* Save Changes Button */}
        <div className="mt-6">
          <Button
            onClick={handleSaveChanges}
            className={`px-6 py-3 rounded ${
              loading ? "bg-gray-400" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/main/profile/boards">
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              <h2 className="text-xl font-semibold">My Recipe Boards</h2>
              <p className="text-gray/70">Organize your saved recipes</p>
            </div>
          </Link>
          <Link href="/main/profile/recipes">
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
              <h2 className="text-xl font-semibold">My Created Recipes</h2>
              <p className="text-gray/70">See your recipes that you've created</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}