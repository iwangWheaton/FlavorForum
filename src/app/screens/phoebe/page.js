"use client";
import { useState } from 'react';
import styles from './Login.module.css';

export default function PhoebeScreen() {
    const [firstName, setFirstName] = useState('');
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: ''
    });

    const [ isSubmitted, setSubmitted ] = useState(false);

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

    const handleSubmit = (e) => { // when the form is submitted, set the submitted state to true
      e.preventDefault();
      const firstName = formData.fullName.split(' ')[0];
      setSubmitted(true);
    }

    if(isSubmitted) { // if the form has been submitted, show the welcome message
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Welcome, {firstName}!</h1>
        </div>
      )
    }

    return ( // otherwise, show the login form
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>Welcome back to FlavorForum!</h1>
          <p className={styles.subtitle}>
            Sign in with your email address and password to browse recipes and start cooking.
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
        </div>
      </div>
    )
  };
  