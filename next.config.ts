import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/consty',
  trailingSlash: true,
  assetPrefix: '/consty',
};

module.exports = nextConfig;
