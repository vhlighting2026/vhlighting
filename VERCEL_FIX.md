# Vercel deployment

1. Upload the CONTENTS of this archive to the repository root.
2. Vercel Settings > Build and Deployment:
   - Root Directory: ./
   - Install Command: corepack enable && pnpm install --no-frozen-lockfile
   - Build Command: pnpm run build
   - Node.js Version: 20.x
3. Save, then Redeploy without build cache.
4. The build log must show pnpm install, not npm install.
