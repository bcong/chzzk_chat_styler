import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import monkey from 'vite-plugin-monkey';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    console.log("Building in", mode);

    const now = new Date();
    const version = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    return {
        plugins: [
            {
                name: 'set-headers',
                apply: 'serve',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        res.setHeader(
                            'Access-Control-Allow-Private-Network',
                            'true'
                        );
                        next();
                    });
                },
            },
            react({
                tsDecorators: true,
            }),
            monkey({
                entry: 'src/index.tsx',
                userscript: {
                    name: 'CHZZK (치지직) - 채팅 스타일러',
                    namespace: 'https://github.com/bcong',
                    version: version,
                    description: '새로운 채팅 환경',
                    author: '비콩',
                    match: [
                        'https://chzzk.naver.com/*',
                    ],
                    exclude: [
                        'https://chzzk.naver.com/video/*'
                    ],
                    icon: 'https://ssl.pstatic.net/static/nng/glive/icon/favicon.png',
                    connect: ['chzzk.naver.com'],
                    grant: ['GM_setValue', 'GM_getValue', 'GM_listValues'],
                    license: 'MIT',
                    downloadURL: 'https://github.com/bcong/chzzk_chat_styler/blob/master/dist/userscripts.user.js',
                    updateURL: 'https://github.com/bcong/chzzk_chat_styler/blob/master/dist/userscripts.user.js'
                },
                server: {
                    mountGmApi: true,
                    open: false
                },
                build: {
                    fileName: 'userscripts.user.js'
                }
            }),
            svgr(),
            splitVendorChunkPlugin(),
        ],
        base: "./",
        root: "./",
        build: {
            cssCodeSplit: false,
            cssMinify: false,
            emptyOutDir: false,
            outDir: "dist",
            minify: false,
            sourcemap: false,
            chunkSizeWarningLimit: 1500,
            lib: {
                entry: "src/index.tsx",
                name: "userscript",
                fileName: () => `userscripts.user.js`,
                formats: ["iife"],
            },
            rollupOptions: {
                output: {
                    banner: `// ==UserScript==`,
                    inlineDynamicImports: true,
                },
            },
        },
        define: {
            "process.env.NODE_ENV": JSON.stringify(mode),
        },
        resolve: {
            alias: {
                "@Assets": path.resolve(__dirname, "src/Assets"),
                "@Types": path.resolve(__dirname, "src/@types"),
                "@Views": path.resolve(__dirname, "src/Views"),
                "@Pages": path.resolve(__dirname, "src/Pages"),
                "@Templates": path.resolve(__dirname, "src/Templates"),
                "@Models": path.resolve(__dirname, "src/Models"),
                "@Utils": path.resolve(__dirname, "src/Utils"),
                "@Components": path.resolve(__dirname, "src/Components"),
                "@Stores": path.resolve(__dirname, "src/Stores"),
                "@Styles": path.resolve(__dirname, "src/Styles"),
                "@Widgets": path.resolve(__dirname, "src/Widgets"),
                "@Module": path.resolve(__dirname, "src/Module"),
            },
        },
    };
});