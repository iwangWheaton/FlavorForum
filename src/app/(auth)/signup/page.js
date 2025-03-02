"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import styles from './Login.module.css';
import Button from "@/components/Button";

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
    const firstName = formData.fullName.split(' ')[0];
    setSubmitted(true);

    // Simulate signup process
    // Replace this with your actual signup logic
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect to the specified URL after signup
    if (redirect) {
      router.push(redirect);
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
              required
            />
          </div>

          <button type="submit" className={styles.button}>Let&apos;s Get Cooking!</button>
        </form>
        <Button onClick={() => signIn("google", { callbackUrl: redirect })} className="bg-blue-500 text-white p-10 rounded">
          Sign up with Google
        </Button>
      </div>
    </div>
  )
};