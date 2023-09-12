/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WC_PROJECT_ID: process.env.WC_PROJECT_ID,
    PEANUT_API_KEY: process.env.PEANUT_API_KEY,
  },
};

module.exports = nextConfig;
