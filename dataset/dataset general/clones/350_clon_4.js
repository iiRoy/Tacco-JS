const fileSystem = require('fs/promises');
const pathModule = require('path');
const pugProcessor = require('pug');
const styleCompiler = require('stylus');
const nibExtension = require('nib');
const scriptBundler = require('esbuild');
const imageCompressor = require('imagemin');
const imageminGif = require('imagemin-gifsicle');
const imageminJpeg = require('imagemin-jpegtran');
const imageminPng = require('imagemin-optipng');
const imageminSvg = require('imagemin-svgo');
const codeAnalyzer = require('eslint');
const fileWatcher = require('chokidar');
const devWebServer = require('live-server');
const directoryCleaner = require('rimraf');
const directoryUtils = require('fs-extra');

let globalConfiguration = {};
let pageContentData = {};

const reportIssue = (messageHeading, errorObject) => {
    console.error(`ISSUE: ${messageHeading}`, errorObject ? errorObject.message : '');
    if (errorObject && errorObject.stack) {
        console.error(errorObject.stack);
    }
};

const establishAssetLocations = (modeIsDevelopment) => {
    const baseDirectory = process.cwd();
    const sourceRoot = pathModule.join(baseDirectory, 'src');
    const buildRoot = pathModule.join(baseDirectory, 'build');
    const distributionRoot = pathModule.join(baseDirectory, 'dist');

    const targetRoot = modeIsDevelopment ? buildRoot : distributionRoot;

    globalConfiguration = {
        isDevelopment: modeIsDevelopment,
        sourcePaths: {
            root: sourceRoot,
            javascript: {
                watch: pathModule.join(sourceRoot, 'js', '**', '*.js'),
                entry: pathModule.join(sourceRoot, 'js', 'app.js'),
                lintFiles: pathModule.join(sourceRoot, 'js', '**', '*.js')
            },
            stylesheets: {
                watch: pathModule.join(sourceRoot, 'css', '**', '*.styl'),
                entry: pathModule.join(sourceRoot, 'css', 'style.styl')
            },
            markup: {
                watch: pathModule.join(sourceRoot, 'html', '**', '*.jade'),
                entryDir: pathModule.join(sourceRoot, 'html')
            },
            images: {
                watch: pathModule.join(sourceRoot, 'img', '**', '*'),
                sourceDir: pathModule.join(sourceRoot, 'img')
            },
            miscellaneous: [
                pathModule.join(sourceRoot, 'font'),
                pathModule.join(sourceRoot, 'dependencies')
            ]
        },
        outputPaths: {
            root: targetRoot,
            javascript: pathModule.join(targetRoot, 'js'),
            stylesheets: pathModule.join(targetRoot, 'css'),
            markup: targetRoot,
            images: pathModule.join(targetRoot, 'img')
        },
        serverWatchTargets: [
            pathModule.join(targetRoot, '*.html'),
            pathModule.join(targetRoot, 'css', '*.css'),
            pathModule.join(targetRoot, 'js', '*.js'),
            pathModule.join(targetRoot, 'img', '**', '*')
        ]
    };
};

const acquireContentData = async () => {
    try {
        const dataFilePath = pathModule.join(process.cwd(), 'content.json');
        const fileBytes = await fileSystem.readFile(dataFilePath, 'utf8');
        pageContentData = JSON.parse(fileBytes);
    } catch (err) {
        reportIssue('Failed to acquire content.json', err);
        pageContentData = {};
    }
};

const constructMarkup = async () => {
    try {
        const inputFiles = await fileSystem.readdir(globalConfiguration.sourcePaths.markup.entryDir);
        const jadeFiles = inputFiles.filter(f => f.endsWith('.jade')).map(f => pathModule.join(globalConfiguration.sourcePaths.markup.entryDir, f));

        for (const inputFile of jadeFiles) {
            const outputFileName = pathModule.basename(inputFile, '.jade') + '.html';
            const outputPath = pathModule.join(globalConfiguration.outputPaths.markup, outputFileName);

            const generatedHtml = pugProcessor.renderFile(inputFile, {
                pretty: globalConfiguration.isDevelopment,
                data: pageContentData
            });
            await fileSystem.mkdir(globalConfiguration.outputPaths.markup, { recursive: true });
            await fileSystem.writeFile(outputPath, generatedHtml);
            console.log(`Generated HTML: ${outputFileName}`);
        }
    } catch (err) {
        reportIssue('Issue constructing HTML', err);
    }
};

const processStylesheets = async () => {
    try {
        const inputFilePath = globalConfiguration.sourcePaths.stylesheets.entry;
        const outputFileName = pathModule.basename(inputFilePath, '.styl') + '.css';
        const outputPath = pathModule.join(globalConfiguration.outputPaths.stylesheets, outputFileName);

        const stylusSource = await fileSystem.readFile(inputFilePath, 'utf8');

        const renderingOptions = {
            use: [nibExtension()],
            compress: !globalConfiguration.isDevelopment,
            linenos: globalConfiguration.isDevelopment,
            firewall: false,
            sourcemap: {
                inline: globalConfiguration.isDevelopment,
                sourceRoot: '../',
                basePath: 'css'
            }
        };

        const compiledCss = await new Promise((resolve, reject) => {
            styleCompiler.render(stylusSource, { filename: inputFilePath, ...renderingOptions }, (err, css) => {
                if (err) reject(err);
                resolve(css);
            });
        });

        await fileSystem.mkdir(globalConfiguration.outputPaths.stylesheets, { recursive: true });
        await fileSystem.writeFile(outputPath, compiledCss);
        console.log(`Processed CSS: ${outputFileName}`);
    } catch (err) {
        reportIssue('Issue processing CSS', err);
    }
};

const packageScripts = async () => {
    try {
        const inputFilePath = globalConfiguration.sourcePaths.javascript.entry;
        const outputFileName = pathModule.basename(inputFilePath, '.js') + '.js';
        const outputPath = pathModule.join(globalConfiguration.outputPaths.javascript, outputFileName);

        if (globalConfiguration.isDevelopment) {
            const { ESLint } = codeAnalyzer;
            const linterInstance = new ESLint();
            const evaluationResults = await linterInstance.lintFiles(globalConfiguration.sourcePaths.javascript.lintFiles);
            const reportFormatter = await linterInstance.loadFormatter('stylish');
            const formattedReport = reportFormatter.format(evaluationResults);
            if (formattedReport) {
                console.log('JavaScript Code Analysis Results:\n', formattedReport);
            }
        }

        await fileSystem.mkdir(globalConfiguration.outputPaths.javascript, { recursive: true });

        const bundlingOutcome = await scriptBundler.build({
            entryPoints: [inputFilePath],
            bundle: true,
            outfile: outputPath,
            minify: !globalConfiguration.isDevelopment,
            sourcemap: globalConfiguration.isDevelopment ? 'inline' : false,
            platform: 'browser',
            format: 'iife'
        });
        console.log(`Packaged JS: ${outputFileName}`);
        if (bundlingOutcome.errors.length > 0) {
            reportIssue('esbuild packaging errors:', bundlingOutcome.errors);
        }
        if (bundlingOutcome.warnings.length > 0) {
            console.warn('esbuild packaging warnings:', bundlingOutcome.warnings);
        }
    } catch (err) {
        reportIssue('Issue packaging JavaScript', err);
    }
};

const compressImages = async () => {
    try {
        const imageSourceDir = globalConfiguration.sourcePaths.images.sourceDir;
        const imageDestDir = globalConfiguration.outputPaths.images;

        await fileSystem.mkdir(imageDestDir, { recursive: true });

        const allImageFiles = await directoryUtils.readdirp(imageSourceDir, {
            filter: entry => entry.isFile() && /\.(jpg|jpeg|png|gif|svg)$/i.test(entry.path)
        });

        for (const imageFileEntry of allImageFiles) {
            const relativePath = pathModule.relative(imageSourceDir, imageFileEntry.path);
            const destPath = pathModule.join(imageDestDir, relativePath);
            await fileSystem.mkdir(pathModule.dirname(destPath), { recursive: true });

            const sourceBuffer = await fileSystem.readFile(imageFileEntry.path);
            const compressedBuffer = await imageCompressor(sourceBuffer, {
                plugins: [
                    imageminGif({ interlaced: true }),
                    imageminJpeg({ progressive: true }),
                    imageminPng({ optimizationLevel: 6 }),
                    imageminSvg()
                ]
            });
            await fileSystem.writeFile(destPath, compressedBuffer);
            console.log(`Compressed image: ${relativePath}`);
        }
    } catch (err) {
        reportIssue('Issue compressing images', err);
    }
};

const transferSupplementaryAssets = async () => {
    try {
        const sourceRoot = globalConfiguration.sourcePaths.root;
        const destRoot = globalConfiguration.outputPaths.root;

        const rootLevelItems = await fileSystem.readdir(sourceRoot, { withFileTypes: true });
        for (const item of rootLevelItems) {
            const fullSourcePath = pathModule.join(sourceRoot, item.name);
            const fullDestPath = pathModule.join(destRoot, item.name);

            const excludedDirectories = ['html', 'css', 'js', 'img'];
            if (item.isDirectory() && excludedDirectories.includes(item.name)) {
                continue;
            }

            if (item.isDirectory()) {
                await directoryUtils.copy(fullSourcePath, fullDestPath, { overwrite: true });
                console.log(`Transferred directory: ${item.name}`);
            } else if (item.isFile()) {
                await fileSystem.copyFile(fullSourcePath, fullDestPath);
                console.log(`Transferred file: ${item.name}`);
            }
        }

        for (const targetPath of globalConfiguration.sourcePaths.miscellaneous) {
            const relativePath = pathModule.relative(sourceRoot, targetPath);
            const destPath = pathModule.join(destRoot, relativePath);
            if (await directoryUtils.pathExists(targetPath)) {
                await directoryUtils.copy(targetPath, destPath, { overwrite: true });
                console.log(`Transferred assets from: ${relativePath}`);
            }
        }

    } catch (err) {
        reportIssue('Issue transferring supplementary assets', err);
    }
};

class ProjectWorkflowManager {
    constructor(developmentModeActive) {
        establishAssetLocations(developmentModeActive);
    }

    async prepareData() {
        await acquireContentData();
    }

    async executeAllBuildOperations() {
        console.log(`Initiating build in ${globalConfiguration.isDevelopment ? 'development' : 'production'} context...`);
        await directoryCleaner(globalConfiguration.outputPaths.root);
        await fileSystem.mkdir(globalConfiguration.outputPaths.root, { recursive: true });

        await this.prepareData();
        await Promise.all([
            constructMarkup(),
            processStylesheets(),
            packageScripts(),
            compressImages(),
            transferSupplementaryAssets()
        ]);
        console.log('All build operations finalized.');
    }

    activateLiveDevelopmentServer() {
        console.log('Activating live development server...');
        const serverOptions = {
            port: 8080,
            host: '0.0.0.0',
            root: globalConfiguration.outputPaths.root,
            open: true,
            file: 'index.html',
            wait: 1000,
            logLevel: 2,
        };
        devWebServer.start(serverOptions);
        console.log(`Development server operational at http://localhost:${serverOptions.port}`);
    }

    initiateFileMonitors() {
        console.log('Initiating file change monitors...');

        const monitorAndRebuild = async (taskExecutor, sectionDescription) => {
            try {
                await taskExecutor();
                console.log(`[Monitor] Re-executed ${sectionDescription}`);
            } catch (err) {
                reportIssue(`[Monitor] Issue re-executing ${sectionDescription}`, err);
            }
        };

        fileWatcher.watch(globalConfiguration.sourcePaths.markup.watch, { ignoreInitial: true })
            .on('add', () => monitorAndRebuild(constructMarkup, 'HTML'))
            .on('change', () => monitorAndRebuild(constructMarkup, 'HTML'))
            .on('unlink', () => monitorAndRebuild(constructMarkup, 'HTML'));

        fileWatcher.watch(globalConfiguration.sourcePaths.stylesheets.watch, { ignoreInitial: true })
            .on('add', () => monitorAndRebuild(processStylesheets, 'CSS'))
            .on('change', () => monitorAndRebuild(processStylesheets, 'CSS'))
            .on('unlink', () => monitorAndRebuild(processStylesheets, 'CSS'));

        fileWatcher.watch(globalConfiguration.sourcePaths.javascript.watch, { ignoreInitial: true })
            .on('add', () => monitorAndRebuild(packageScripts, 'JavaScript'))
            .on('change', () => monitorAndRebuild(packageScripts, 'JavaScript'))
            .on('unlink', () => monitorAndRebuild(packageScripts, 'JavaScript'));

        fileWatcher.watch(globalConfiguration.sourcePaths.images.watch, { ignoreInitial: true })
            .on('add', () => monitorAndRebuild(compressImages, 'Images'))
            .on('change', () => monitorAndRebuild(compressImages, 'Images'))
            .on('unlink', () => monitorAndRebuild(compressImages, 'Images'));

        fileWatcher.watch(pathModule.join(process.cwd(), 'content.json'), { ignoreInitial: true })
            .on('add', async () => { await acquireContentData(); await monitorAndRebuild(constructMarkup, 'HTML (content data update)'); })
            .on('change', async () => { await acquireContentData(); await monitorAndRebuild(constructMarkup, 'HTML (content data update)'); })
            .on('unlink', async () => { await acquireContentData(); await monitorAndRebuild(constructMarkup, 'HTML (content data update)'); });

        const supplementaryWatchTargets = globalConfiguration.sourcePaths.miscellaneous;
        fileWatcher.watch(supplementaryWatchTargets, { ignoreInitial: true })
            .on('add', () => monitorAndRebuild(transferSupplementaryAssets, 'Supplementary Assets'))
            .on('change', () => monitorAndRebuild(transferSupplementaryAssets, 'Supplementary Assets'))
            .on('unlink', () => monitorAndRebuild(transferSupplementaryAssets, 'Supplementary Assets'));
    }
}

const entryPoint = async () => {
    const processArguments = process.argv.slice(2);
    const primaryCommand = processArguments[0] || 'default';

    let isDevelopmentModeActive;
    switch (primaryCommand) {
        case 'dist':
            isDevelopmentModeActive = false;
            break;
        case 'build':
        case 'default':
        default:
            isDevelopmentModeActive = true;
            break;
    }

    const workflowManager = new ProjectWorkflowManager(isDevelopmentModeActive);

    if (primaryCommand === 'build' || primaryCommand === 'dist' || primaryCommand === 'run') {
        await workflowManager.executeAllBuildOperations();
    } else if (primaryCommand === 'default') {
        await workflowManager.executeAllBuildOperations();
        workflowManager.activateLiveDevelopmentServer();
        workflowManager.initiateFileMonitors();
    } else {
        console.log(`Unrecognized command: ${primaryCommand}. Accepted commands: [default|build|dist]`);
        process.exit(1);
    }
};

entryPoint().catch(err => {
    reportIssue('Uncaught error in main execution flow', err);
    process.exit(1);
});