const fileSystem = require('fs').promises;
const directory = require('path');
const { ESLint } = require('eslint');
const styleLinter = require('stylelint');
const { minify: performJSMinification } = require('terser');
const cleanCSS = require('clean-css');
const imageOptimizer = require('imagemin');
const jpegCompressor = require('imagemin-jpegtran');
const pngCompressor = require('imagemin-pngquant');
const watchSystem = require('chokidar');
const globPattern = require('glob');

const buildConfiguration = {
    resourcePaths: {
        scriptSources: ['js/custom/*.js'],
        styleSources: ['css/custom/*.css'],
        imageAssets: ['img'],
        utilityScripts: ['gruntfile.js']
    },
    outputTargets: {
        combinedCSS: 'css/libs/z.styles.concat.css',
        combinedJS: 'js/libs/z.scripts.concat.js',
        finalMinifiedCSS: 'css/min/styles.min.css',
        finalMinifiedJS: 'js/min/scripts.min.js'
    },
    lintingRules: {
        js: {
            envs: ['browser'],
            globals: {
                jQuery: true,
                console: true
            },
            rules: {
                'curly': ['error', 'all'],
                'eqeqeq': ['error', 'always'],
                'wrap-iife': ['error', 'any'],
                'no-use-before-define': ['error', { 'functions': false, 'classes': false }],
                'new-cap': ['error', { 'newIsCap': true, 'capIsNew': false }],
                'no-caller': 'error',
                'no-iterator': 'error',
                'dot-notation': 'off',
                'no-undef': 'error',
                'no-cond-assign': ['error', 'except-parens'],
                'no-eq-null': 'off',
                'no-unused-vars': ['warn', { 'args': 'none' }]
            }
        },
        css: {
            rules: {
                'at-rule-no-unknown': [true, { ignoreAtRules: ['import'] }],
                'selector-max-id': 0,
                'declaration-no-important': null,
                'selector-no-qualifying-element': null,
                'declaration-block-no-duplicate-properties': true,
                'property-no-vendor-prefix': null,
                'selector-max-universal': 0
            }
        }
    }
};

async function locateFilesByPattern(patternArray) {
    let allFiles = [];
    for (const pattern of patternArray) {
        const files = await new Promise((resolve, reject) => {
            globPattern(pattern, (err, matches) => {
                if (err) reject(err);
                resolve(matches);
            });
        });
        allFiles = allFiles.concat(files);
    }
    return allFiles;
}

async function conductJSLinting(pathGlobs) {
    const fileList = await locateFilesByPattern(pathGlobs);
    const lintEngine = new ESLint({
        useEslintrc: false,
        overrideConfig: buildConfiguration.lintingRules.js
    });

    console.log('\n--- Evaluating JavaScript Code Quality ---');
    const lintResults = await lintEngine.lintFiles(fileList);
    const formatter = await lintEngine.loadFormatter('stylish');
    const resultText = formatter.format(lintResults);

    if (resultText) {
        console.log(resultText);
    } else {
        console.log('No JavaScript code quality issues detected.');
    }
    const hasErrors = lintResults.some(result => result.errorCount > 0);
    if (hasErrors) {
        console.error('JavaScript code evaluation failed with critical errors.');
    }
}

async function conductCSSLinting(pathGlobs) {
    const fileList = await locateFilesByPattern(pathGlobs);
    console.log('\n--- Evaluating CSS Code Quality ---');
    try {
        const lintResult = await styleLinter.lint({
            files: fileList,
            config: buildConfiguration.lintingRules.css,
            formatter: 'string'
        });

        if (lintResult.errored) {
            console.error(lintResult.output);
            console.error('CSS code evaluation failed with critical errors.');
        } else if (lintResult.output) {
            console.log(lintResult.output);
            console.log('No CSS code quality issues detected.');
        } else {
            console.log('No CSS code quality issues detected.');
        }
    } catch (error) {
        console.error('An error occurred during CSS code evaluation:', error);
    }
}

async function mergeFilesIntoSingleOutput(inputGlobs, outputPath) {
    const fileList = await locateFilesByPattern(inputGlobs);
    console.log(`\n--- Merging content to ${outputPath} ---`);
    let combinedContent = '';
    for (const filePath of fileList) {
        const content = await fileSystem.readFile(filePath, 'utf8');
        combinedContent += content + '\n';
    }
    await fileSystem.mkdir(directory.dirname(outputPath), { recursive: true });
    await fileSystem.writeFile(outputPath, combinedContent, 'utf8');
    console.log(`Merged ${fileList.length} files.`);
}

async function compressJavaScriptSource(inputPath, outputPath) {
    console.log(`\n--- Compressing JavaScript from ${inputPath} to ${outputPath} ---`);
    const inputCode = await fileSystem.readFile(inputPath, 'utf8');
    const compressedResult = await performJSMinification(inputCode);
    await fileSystem.mkdir(directory.dirname(outputPath), { recursive: true });
    await fileSystem.writeFile(outputPath, compressedResult.code, 'utf8');
    console.log('JavaScript compression concluded.');
}

async function compressCascadingStyleSheets(inputPath, outputPath) {
    console.log(`\n--- Compressing CSS from ${inputPath} to ${outputPath} ---`);
    const inputCSS = await fileSystem.readFile(inputPath, 'utf8');
    const compressedResult = new cleanCSS().minify(inputCSS);
    if (compressedResult.errors.length > 0) {
        console.error('CSS Compression Errors:', compressedResult.errors);
    }
    await fileSystem.mkdir(directory.dirname(outputPath), { recursive: true });
    await fileSystem.writeFile(outputPath, compressedResult.styles, 'utf8');
    console.log('CSS compression concluded.');
}

async function enhanceProjectImages(imageGlobs) {
    const fileList = await locateFilesByPattern(imageGlobs);
    console.log('\n--- Enhancing Image Assets ---');
    for (const imagePath of fileList) {
        try {
            const buffer = await fileSystem.readFile(imagePath);
            const enhancedBuffer = await imageOptimizer(buffer, {
                plugins: [
                    jpegCompressor({ progressive: true }),
                    pngCompressor({ quality: [0.6, 0.8] })
                ]
            });
            if (enhancedBuffer.length < buffer.length) {
                await fileSystem.writeFile(imagePath, enhancedBuffer);
                console.log(`Enhanced: ${imagePath}`);
            } else {
                console.log(`Skipped (already optimal or no gain): ${imagePath}`);
            }
        } catch (error) {
            console.error(`Error enhancing image ${imagePath}:`, error);
        }
    }
    console.log('Image enhancement concluded.');
}

async function executeStandardBuild() {
    console.log('\n--- Initiating Standard Build Procedure ---');

    await conductJSLinting(buildConfiguration.resourcePaths.utilityScripts.concat(buildConfiguration.resourcePaths.scriptSources));

    await mergeFilesIntoSingleOutput(buildConfiguration.resourcePaths.scriptSources, buildConfiguration.outputTargets.combinedJS);
    await mergeFilesIntoSingleOutput(['js/libs/*.js'], buildConfiguration.outputTargets.combinedJS);

    await compressJavaScriptSource(buildConfiguration.outputTargets.combinedJS, buildConfiguration.outputTargets.finalMinifiedJS);
    await mergeFilesIntoSingleOutput(['js/min/*.js'], buildConfiguration.outputTargets.finalMinifiedJS);

    await conductCSSLinting(buildConfiguration.resourcePaths.styleSources);

    await mergeFilesIntoSingleOutput(buildConfiguration.resourcePaths.styleSources, buildConfiguration.outputTargets.combinedCSS);
    await mergeFilesIntoSingleOutput(['css/libs/*.css'], buildConfiguration.outputTargets.combinedCSS);

    await compressCascadingStyleSheets(buildConfiguration.outputTargets.combinedCSS, buildConfiguration.outputTargets.finalMinifiedCSS);
    await mergeFilesIntoSingleOutput(['css/min/*.css'], buildConfiguration.outputTargets.finalMinifiedCSS);

    console.log('\n--- Standard Build Procedure Concluded ---');
}

async function executeFullOptimization() {
    console.log('\n--- Initiating Full Optimization Procedure ---');
    await executeStandardBuild();
    await enhanceProjectImages(buildConfiguration.resourcePaths.imageAssets);
    console.log('\n--- Full Optimization Procedure Concluded ---');
}

async function beginMonitoringChanges() {
    const monitoredGlobs = buildConfiguration.resourcePaths.utilityScripts
        .concat(buildConfiguration.resourcePaths.scriptSources)
        .concat(buildConfiguration.resourcePaths.styleSources);
    console.log(`\n--- Observing file system for modifications in: ${monitoredGlobs.join(', ')} ---`);
    watchSystem.watch(monitoredGlobs, { ignoreInitial: true }).on('all', async (event, path) => {
        console.log(`File ${path} ${event}, re-executing standard build...`);
        await executeStandardBuild();
    });
    console.log('To cease observation, press Ctrl+C.');
}

async function primaryExecutionRoutine(operationCommand) {
    switch (operationCommand) {
        case 'standard':
            await executeStandardBuild();
            break;
        case 'optimize':
            await executeFullOptimization();
            break;
        case 'observe':
            await beginMonitoringChanges();
            break;
        case 'help':
        default:
            console.log(`
Usage: node build-utility.js [command]

Commands:
  standard  : Executes code quality checks, file merging, and minification for JS and CSS.
  optimize  : Performs the standard build, then enhances image assets.
  observe   : Continuously monitors source files for changes and re-runs the standard build.
  help      : Displays this usage information.
            `);
            break;
    }
}

const requestedCommand = process.argv[2] || 'help';
primaryExecutionRoutine(requestedCommand).catch(error => {
    console.error('A critical error was encountered:', error);
    process.exit(1);
});