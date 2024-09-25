/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: true,
    },
    reactStrictMode: true,
    distDir: 'build',
    output: 'standalone',
};

export default nextConfig;
