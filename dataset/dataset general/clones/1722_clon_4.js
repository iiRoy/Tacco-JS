const fileSystem = require('fs');
const pathModule = require('path');
const { promisify } = require('util');
const changeObserver = require('chokidar');
const styleCompressor = require('clean-css');
const scssProcessor = require('node-sass');
const postProcessor = require('postcss');
const vendorPrefixer = require('autoprefixer');
const imageOptimizer = require('imagemin');
const imagePngQuantizer = require('imagemin-pngquant');
const scriptValidator = require('jshint');
const styleChecker = require('csslint').CSSLint;
const webPageSynchronizer = require('browser-sync').create();
const compressionUtility = require('zlib');
const consoleStyling = require('chalk');

// Promisify file system functions for asynchronous operations
const readDataFromFile = promisify(fileSystem.readFile);
const writeDataToFile = promisify(fileSystem.writeFile);
const listDirectoryContents = promisify(fileSystem.readdir);
const retrieveFileStatistics = promisify(fileSystem.stat);

// Emulate project package information
const projectMetadata = {
    releaseVersion: '1.0.0',
    licensingInfo: 'MIT'
};

// --- Helper Functions for Asset Management ---

async function evaluateAssetSize(assetLocation, contentBuffer, descriptionLabel) {
    const rawByteCount = Buffer.byteLength(contentBuffer, 'utf8');
    const compressedContent = compressionUtility.gzipSync(contentBuffer);
    const compressedByteCount = Buffer.byteLength(compressedContent);

    console.log(consoleStyling.cyan(`[${descriptionLabel}]`) + ` ${pathModule.basename(assetLocation)}`);
    console.log(`  ${consoleStyling.green('Uncompressed size:')} ${consoleStyling.yellow((rawByteCount / 1024).toFixed(2))} KB`);
    console.log(`  ${consoleStyling.green('Gzipped size:')} ${consoleStyling.yellow((compressedByteCount / 1024).toFixed(2))} KB`);
    return { uncompressed: rawByteCount, gzipped: compressedByteCount };
}

async function obtainFileContent(sourceLocation) {
    return readDataFromFile(sourceLocation, 'utf8');
}

async function saveFileContent(destinationLocation, contentPayload) {
    await writeDataToFile(destinationLocation, contentPayload);
}

// --- Core Build Operations ---

async function performStylesheetMinification() {
    const sourceStylesheetPath = './css/fluidity.css';
    const finalStylesheetPath = './css/fluidity.min.css';
    const preambleText = `/*!mrmrs/fluidity v${projectMetadata.releaseVersion} (c)2014 @license ${projectMetadata.licensingInfo}*/\n`;

    try {
        let currentStylesheetContent = await obtainFileContent(sourceStylesheetPath);

        await evaluateAssetSize(sourceStylesheetPath, currentStylesheetContent, 'original stylesheet');

        const minimizedResult = new styleCompressor().minify(currentStylesheetContent);
        if (minimizedResult.errors && minimizedResult.errors.length > 0) {
            console.error(consoleStyling.red('Stylesheet Minification Errors:'), minimizedResult.errors);
        }
        if (minimizedResult.warnings && minimizedResult.warnings.length > 0) {
            console.warn(consoleStyling.yellow('Stylesheet Minification Warnings:'), minimizedResult.warnings);
        }
        let processedStylesheetContent = minimizedResult.styles;

        processedStylesheetContent = preambleText + processedStylesheetContent;

        await evaluateAssetSize(finalStylesheetPath, processedStylesheetContent, 'minimized stylesheet');

        await saveFileContent(finalStylesheetPath, processedStylesheetContent);
        console.log(consoleStyling.green(`Successfully compressed stylesheet to ${finalStylesheetPath}`));
    } catch (error) {
        console.error(consoleStyling.red(`Failure during stylesheet minimization: ${error.message}`));
    }
}

async function executeVisualAssetOptimization() {
    const visualAssetDirectory = './img/';
    try {
        const visualAssetFiles = await listDirectoryContents(visualAssetDirectory);
        for (const assetFileName of visualAssetFiles) {
            const absoluteAssetPath = pathModule.join(visualAssetDirectory, assetFileName);
            const assetFileStats = await retrieveFileStatistics(absoluteAssetPath);

            if (assetFileStats.isFile()) {
                console.log(consoleStyling.blue(`Processing visual asset: ${assetFileName}`));
                const originalAssetBuffer = await readDataFromFile(absoluteAssetPath);

                await evaluateAssetSize(absoluteAssetPath, originalAssetBuffer, 'initial image dimensions');

                const optimizedAssetBuffer = await imageOptimizer.buffer(originalAssetBuffer, {
                    plugins: [
                        imagePngQuantizer({ quality: [0.6, 0.8] })
                    ]
                });

                await evaluateAssetSize(absoluteAssetPath, optimizedAssetBuffer, 'optimized image dimensions');

                await writeDataToFile(absoluteAssetPath, optimizedAssetBuffer);
                console.log(consoleStyling.green(`Optimized visual asset: ${assetFileName}`));
            }
        }
        console.log(consoleStyling.green('All visual assets optimized.'));
    } catch (error) {
        console.error(consoleStyling.red(`Failure during visual asset optimization: ${error.message}`));
    }
}

async function performScriptValidation() {
    const scriptFilePaths = (await listDirectoryContents('./js')).map(f => pathModule.join('./js', f));

    let validationErrorsPresent = false;
    for (const scriptFilePath of scriptFilePaths) {
        try {
            const scriptCodeContent = await obtainFileContent(scriptFilePath);
            const validationResult = scriptValidator.JSHINT(scriptCodeContent, {}, {});

            if (!validationResult) {
                validationErrorsPresent = true;
                console.error(consoleStyling.red(`\nJSHint Validation Errors in ${scriptFilePath}:`));
                scriptValidator.JSHINT.errors.forEach(err => {
                    if (err) {
                        console.error(`  ${consoleStyling.gray(`Line ${err.line}, Col ${err.character}:`)} ${err.reason} ${consoleStyling.magenta(`(${err.code})`)}`);
                    }
                });
            } else {
                console.log(consoleStyling.green(`\nJSHint passed for ${scriptFilePath}`));
            }
        } catch (error) {
            console.error(consoleStyling.red(`Failure reading or validating ${scriptFilePath}: ${error.message}`));
            validationErrorsPresent = true;
        }
    }
    if (validationErrorsPresent) {
        console.log(consoleStyling.yellow('\nScript validation finished with issues.'));
    } else {
        console.log(consoleStyling.green('\nAll script files passed validation.'));
    }
}

async function validateStylesheetSyntax() {
    const targetStylesheetFile = './css/fluidity.css';
    try {
        const stylesheetContent = await obtainFileContent(targetStylesheetFile);

        const validationConfiguration = {
            'compatible-vendor-prefixes': false,
            'box-sizing': false,
            'important': false,
            'known-properties': false
        };

        const validationOutcome = styleChecker.verify(stylesheetContent, validationConfiguration);

        if (validationOutcome.messages && validationOutcome.messages.length > 0) {
            console.error(consoleStyling.red(`\nCSSLint Issues in ${targetStylesheetFile}:`));
            validationOutcome.messages.forEach(msg => {
                const messageTypeColor = msg.type === 'error' ? consoleStyling.red : consoleStyling.yellow;
                console.error(`  ${messageTypeColor(msg.type.toUpperCase())} ${consoleStyling.gray(`Line ${msg.line}, Col ${msg.col}:`)} ${msg.message} ${consoleStyling.magenta(`(${msg.rule.id})`)}`);
            });
        } else {
            console.log(consoleStyling.green(`\nCSSLint passed for ${targetStylesheetFile}`));
        }
    } catch (error) {
        console.error(consoleStyling.red(`Failure during stylesheet linting: ${error.message}`));
    }
}

async function convertScssToCss() {
    const scssInputPath = './sass/fluidity.scss';
    const cssOutputPath = './css/fluidity.css';

    try {
        const scssCompilationResult = await promisify(scssProcessor.render)({
            file: scssInputPath,
            outputStyle: 'expanded'
        });
        let compiledCssOutput = scssCompilationResult.css.toString();

        await evaluateAssetSize(scssInputPath, compiledCssOutput, 'pre-prefixing stylesheet');

        const prefixedCssResult = await postProcessor([vendorPrefixer()]).process(compiledCssOutput, { from: scssInputPath, to: cssOutputPath });
        prefixedCssResult.warnings().forEach(warn => console.warn(consoleStyling.yellow(`PostCSS Warning: ${warn.toString()}`)));

        let finalCssOutput = prefixedCssResult.css;
        await evaluateAssetSize(cssOutputPath, finalCssOutput, 'post-prefixing stylesheet');

        await saveFileContent(cssOutputPath, finalCssOutput);
        console.log(consoleStyling.green(`Successfully transformed SCSS and added prefixes to ${cssOutputPath}`));

        webPageSynchronizer.reload();
    } catch (error) {
        console.error(consoleStyling.red(`Failure during SCSS compilation or prefixing: ${error.message}`));
    }
}

// --- Live Development Environment Functions ---

function initializeDevelopmentServer() {
    webPageSynchronizer.init({
        server: {
            baseDir: "./"
        }
    });
    console.log(consoleStyling.magenta('Live development server started.'));
}

function triggerBrowserPageRefresh() {
    webPageSynchronizer.reload();
    console.log(consoleStyling.magenta('Browser content reloaded.'));
}

function establishFileChangeMonitoring() {
    changeObserver.watch('sass/*.scss', { ignored: /(^|[\/\\])\../, persistent: true })
        .on('change', async (modifiedPath) => {
            console.log(consoleStyling.cyan(`File modified: ${modifiedPath}`));
            await convertScssToCss();
            await performStylesheetMinification();
        })
        .on('add', async (addedPath) => {
            console.log(consoleStyling.cyan(`New SASS file detected: ${addedPath}`));
            await convertScssToCss();
            await performStylesheetMinification();
        });

    changeObserver.watch('css/fluidity.css', { ignored: /(^|[\/\\])\../, persistent: true })
        .on('change', async (modifiedPath) => {
            console.log(consoleStyling.cyan(`File modified: ${modifiedPath}`));
            triggerBrowserPageRefresh();
            await performStylesheetMinification();
        });

    changeObserver.watch('*.html', { ignored: /(^|[\/\\])\../, persistent: true })
        .on('change', (modifiedPath) => {
            console.log(consoleStyling.cyan(`File modified: ${modifiedPath}`));
            triggerBrowserPageRefresh();
        });

    console.log(consoleStyling.magenta('File system change detectors activated.'));
}

// --- Primary Build Workflow Orchestration ---

async function orchestrateBuildWorkflow() {
    console.log(consoleStyling.bold.blue('Initiating the initial build sequence...'));

    await convertScssToCss();
    await performStylesheetMinification();

    initializeDevelopmentServer();
    triggerBrowserPageRefresh();

    await validateStylesheetSyntax();

    establishFileChangeMonitoring();

    console.log(consoleStyling.bold.green('Initial build completed. Monitoring for file changes...'));
}

// Execute the main workflow
orchestrateBuildWorkflow().catch(err => {
    console.error(consoleStyling.red('An unhandled exception occurred during the build workflow:'), err);
    process.exit(1);
});