"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import styles from './Login.module.css';
import Button from "@/components/Button";
import { FaGoogle } from "react-icons/fa"; // Import icons

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const [isSubmitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (session && redirect) {
      router.push(redirect);
    }
  }, [session, redirect, router]);

  const handleChange = (e) => {
    const { name, value } = e.target; // gets field that was updated
    setFormData(prevState => ({ // updates the state with the new value
      ...prevState,
      [name]: value
    }));

    // If it's the fullName field, update firstName
    if (name === 'fullName') {
      setFirstName(value.split(' ')[0]);
    }
  };

  const handleSubmit = async (e) => { // when the form is submitted, set the submitted state to true
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Create Firestore user doc immediately
      await setDoc(doc(db, 'users', user.uid), {
        userID: user.uid,
        email: user.email,
        profilePic: null,
        createdAt: serverTimestamp(),
      });

      // Then sign in
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: '/',
      });
    } catch (err) {
      console.error(err);
      setError('Failed to sign up. Please try again.');
    }
  };

  if (isSubmitted) { // if the form has been submitted, show the welcome message
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome, {firstName}!</h1>
      </div>
    )
  }

  return ( // otherwise, show the signup form
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Welcome to FlavorForum!</h1>
        <p className={styles.subtitle}>
          Sign up with your email address and password to browse recipes and start cooking.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Chandler the Chef"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="chandler@example.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="super secret password"
              required
            />
            <p className={styles.loginLink}>
              Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in</a>
            </p>
          </div>

          <button type="submit" onChange={handleSubmit} className={styles.button}>Let&apos;s Get Cooking!</button>
        </form>
        <Button 
          onClick={() => signIn("google", { callbackUrl: redirect || '/' })} 
          className="bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 w-full" // Added w-full for full width
        >
          <FaGoogle />
          Sign up with Google
        </Button>
      </div>
    </div>
  )
};