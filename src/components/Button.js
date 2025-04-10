// src/components/Button.js
"use client";

import React from "react";
import Link from "next/link";

const Button = ({
  children,
  className = "",
  href,
  onClick,
  type = "button",
  joined = false, // New prop to handle joined state
  ...props
}) => {
  const baseStyles = "px-4 py-2 bg-red text-white rounded ";
  const buttonClasses = `${baseStyles} ${className}`;

  if (joined) {
    return (
      <button
        type="button"
        className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
        disabled
      >
        Joined
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href}>
        <a
          className={buttonClasses}
          onClick={onClick} // Ensure onClick works with href
          {...props}
        >
          {children}
        </a>
      </Link>
    );
  }

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