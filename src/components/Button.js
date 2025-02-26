// src/components/Button.js
"use client";

import React from 'react';
import Link from 'next/link';

const Button = ({
  children,
  className = "",
  href,
  onClick,
  type = "button",
  ...props
}) => {
  // simple base styles
  const baseStyles = "px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors";
  
  const buttonClasses = `${baseStyles} ${className}`;

  // Otherwise, render as button
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;