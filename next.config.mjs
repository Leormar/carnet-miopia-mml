/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // El documento que acredita al profesional viaja en una accion de
    // servidor. El limite por defecto es 1 MB y el archivo puede pesar 4.
    serverActions: { bodySizeLimit: '5mb' },
  },
}

export default nextConfig
