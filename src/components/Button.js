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
  const baseStyles = "px-4 py-2 text-white rounded transition-colors";

  const buttonClasses = `${baseStyles} ${className}`;

  return (
    <button className={`${baseStyles} bg-red ${className}` } {...props}>
      {children}
    </button>
  );
};

export default Button;