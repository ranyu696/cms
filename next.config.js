/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'qpic.ocdn.stream',
          port: '',
          pathname: '/**',
        },
      ],
    },
    experimental: {
        serverComponentsExternalPackages: ['sharp'],
      },
};

export default config;
