/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['firebasestorage.googleapis.com', "lh3.googleusercontent.com"], // Add the Firebase domain here
    },
  };
  
  export default nextConfig;