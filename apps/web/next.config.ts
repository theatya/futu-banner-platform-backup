import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  outputFileTracingIncludes: {
    "/api/fonts/[id]": ["./assets/fonts/**/*"],
  },
  // workspace 包是 TypeScript 源码，必须让 Next 自己转译
  transpilePackages: [
    "@futu/domain",
    "@futu/solver",
    "@futu/specs",
    "@futu/ports",
    "@futu/adapters-web",
    "@futu/orchestrator",
  ],
};

export default nextConfig;
