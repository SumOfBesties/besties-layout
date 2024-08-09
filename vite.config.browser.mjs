import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import NodeCGPlugin from 'vite-plugin-nodecg';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

export default defineConfig({
    plugins: [
        checker({
            vueTsc: {
                tsconfigPath: 'tsconfig.browser.json'
            }
        }),
        tsconfigPaths({ projects: ['tsconfig.browser.json'] }),
        vue(),
        NodeCGPlugin()
    ]
});
