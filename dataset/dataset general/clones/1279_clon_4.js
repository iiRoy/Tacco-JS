const { promises: { readFile, writeFile, mkdir, rm }, createWriteStream } = require('fs');
const { resolve: resolvePath, join: joinPath, dirname } = require('path');
const { exec } = require('child_process');
const { watch } = require('chokidar');
const { build } = require('esbuild');
const { ESLint } = require('eslint');
const sass = require('sass');

const produceManifestHeader = (manifestObject) => {
    return `/*!\n * ${manifestObject.name}\n * Version: ${manifestObject.version}\n * ${manifestObject.description}\n * Author: ${manifestObject.author}\n * Site: http://${manifestObject.homepage}/\n * Licensed under the MIT license\n */\n`;
};

async function checkScriptQuality(sourceGlobPattern) {
    const linterInstance = new ESLint({
        fix: false,
        overrideConfig: {
            parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
            env: { browser: true, node: true, es6: true },
            rules: {
                'no-unused-vars': ['warn', { args: 'none' }],
                'no-undef': 'warn',
                'no-console': 'off',
                'no-extra-semi': 'error',
                'indent': ['error', 4, { "SwitchCase": 1 }],
            }
        },
        useEslintrc: false,
    });
    const inspectionResults = await linterInstance.lintFiles(sourceGlobPattern);
    const resultFormatter = await linterInstance.loadFormatter('stylish');
    const formattedReport = resultFormatter.format(inspectionResults);
    if (formattedReport) {
        console.log('JavaScript Code Analysis:\n', formattedReport);
    }
    const hasIssues = inspectionResults.some(r => r.errorCount > 0);
    if (hasIssues) {
        console.error('Code quality issues detected.');
        return false;
    }
    return true;
}

async function bundleAndShrinkScripts(metaHeaderContent, primaryScriptPath, outputDirectory, baseFileName) {
    const fullInputPath = resolvePath(primaryScriptPath);
    const unminifiedOutputPath = joinPath(outputDirectory, `${baseFileName}.js`);
    const minifiedOutputPath = joinPath(outputDirectory, `${baseFileName}.min.js`);

    await mkdir(outputDirectory, { recursive: true });

    await build({
        entryPoints: [fullInputPath],
        bundle: true,
        outfile: unminifiedOutputPath,
        format: 'iife',
        banner: { js: metaHeaderContent },
        logLevel: 'silent'
    });
    console.log(`Script asset generated: ${unminifiedOutputPath}`);

    await build({
        entryPoints: [fullInputPath],
        bundle: true,
        outfile: minifiedOutputPath,
        minify: true,
        format: 'iife',
        banner: { js: metaHeaderContent },
        logLevel: 'silent'
    });
    console.log(`Minified script asset generated: ${minifiedOutputPath}`);
}

async function processStyleAssets(sourceStyleDirectory, targetStyleDirectory) {
    const entryStylePath = resolvePath(sourceStyleDirectory, 'main.scss');
    const finalCssDirectory = resolvePath(targetStyleDirectory);
    await mkdir(finalCssDirectory, { recursive: true });
    const finalCssPath = joinPath(finalCssDirectory, 'styles.css');

    try {
        const compilationResult = await sass.compileAsync(entryStylePath, {
            style: 'expanded',
            sourceMap: false,
        });
        await writeFile(finalCssPath, compilationResult.css);
        console.log(`Stylesheet processed: ${finalCssPath}`);
    } catch (error) {
        console.error('Stylesheet compilation failed:', error.message);
    }
}

async function initiateAssetPipeline() {
    const currentProjectData = require('./package.json');
    const generatedHeader = produceManifestHeader(currentProjectData);

    const jsSourceGlobs = ['src/**/*.js'];
    const sassSourceGlobs = ['src/**/*.scss'];

    const performJsOperations = async () => {
        const lintSuccess = await checkScriptQuality(jsSourceGlobs);
        if (lintSuccess) {
            await bundleAndShrinkScripts(generatedHeader, 'src/jquery.glide.js', 'dist', 'jquery.glide');
        } else {
            console.warn('Skipping JS bundling due to linting errors.');
        }
    };

    const performSassOperations = async () => {
        await processStyleAssets('src/sass', 'dist/css');
    };

    console.log('Starting initial asset processing...');
    await performJsOperations();
    await performSassOperations();
    console.log('Initial asset processing finished.');

    console.log('Establishing continuous monitoring for source changes...');
    const scriptFileMonitor = watch(jsSourceGlobs, { ignored: /(^|[\/\\])\../, persistent: true });
    scriptFileMonitor.on('change', async (path) => {
        console.log(`Detected script change: ${path}. Re-processing JavaScript assets...`);
        await performJsOperations();
    });
    scriptFileMonitor.on('add', async (path) => {
        console.log(`New script file: ${path}. Re-processing JavaScript assets...`);
        await performJsOperations();
    });

    const styleFileMonitor = watch(sassSourceGlobs, { ignored: /(^|[\/\\])\../, persistent: true });
    styleFileMonitor.on('change', async (path) => {
        console.log(`Detected style change: ${path}. Re-processing style assets...`);
        await performSassOperations();
    });
    styleFileMonitor.on('add', async (path) => {
        console.log(`New style file: ${path}. Re-processing style assets...`);
        await performSassOperations();
    });

    console.log('Monitoring active.');
}

initiateAssetPipeline().catch(error => {
    console.error('Asset pipeline execution failed:', error);
    process.exit(1);
});