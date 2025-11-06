import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
images: {
// Add domains if you use remote images later
remotePatterns: [
{ protocol: 'https', hostname: 'images.unsplash.com' },
],
},
}
export default nextConfig