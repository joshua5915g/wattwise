/** @type {import('next').NextConfig} */
const nextConfig = {
    // Transpile plotly.js so it bundles correctly on Vercel serverless
    transpilePackages: ['react-plotly.js', 'plotly.js'],

    webpack: (config, { isServer }) => {
        // Prevent plotly from being bundled server-side (it uses browser globals)
        if (isServer) {
            config.externals = [...(Array.isArray(config.externals) ? config.externals : []), 'plotly.js'];
        }
        // Keep existing aliases
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        return config;
    },
};

module.exports = nextConfig;
