/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WC_PROJECT_ID: process.env.WC_PROJECT_ID,
  },
};

module.exports = nextConfig;
