const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

function copySqlWasm() {
  const src = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const dest = path.join(__dirname, 'dist', 'sql-wasm.wasm');
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  fs.copyFileSync(src, dest);
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode', 'sql.js'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
	});

	const mediaCtx = await esbuild.context({
		entryPoints: ['media/src/dashboard.tsx'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'media/dashboard.js',
		jsx: 'automatic',
		jsxImportSource: 'preact',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	const sidebarCtx = await esbuild.context({
		entryPoints: ['media/src/sidebarWebview.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'media/sidebar.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	const standaloneCtx = await esbuild.context({
		entryPoints: ['standalone/server.ts'],
		bundle: true,
		format: 'cjs',
		minify: false,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'standalone/server.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	const cliCtx = await esbuild.context({
		entryPoints: ['standalone/cli.ts'],
		bundle: true,
		format: 'cjs',
		minify: false,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'standalone/cli.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	copySqlWasm();

	if (watch) {
		await ctx.watch();
		await mediaCtx.watch();
		await sidebarCtx.watch();
		await standaloneCtx.watch();
		await cliCtx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
		await mediaCtx.rebuild();
		await mediaCtx.dispose();
		await sidebarCtx.rebuild();
		await sidebarCtx.dispose();
		await standaloneCtx.rebuild();
		await standaloneCtx.dispose();
		await cliCtx.rebuild();
		await cliCtx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
