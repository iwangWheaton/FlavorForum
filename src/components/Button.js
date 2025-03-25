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
  const baseStyles = "px-4 py-2 bg-red text-white rounded ";

  const buttonClasses = `${baseStyles} ${className}`;

  if (href) {
    return (
      <Link href={href}>
        <a className={buttonClasses} {...props}>
          {children}
        </a>
      </Link>
    );
  }

  return (
    <button type={type} className={buttonClasses} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;