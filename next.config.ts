import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Reactor SDK auto-connects on mount and tears down the coordinator
  // client on unmount. React StrictMode's dev-only mount→unmount→remount
  // double invoke races that teardown against the in-flight connect, throwing
  // "Cannot read properties of undefined (reading 'pollSessionReady')".
  // Disable the double-mount so the single real connect runs cleanly.
  reactStrictMode: false,
};

export default nextConfig;
