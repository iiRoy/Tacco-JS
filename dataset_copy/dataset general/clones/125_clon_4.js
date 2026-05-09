/*jslint node: true */
/*global */

(function () {
    'use strict';

    // External modules for various operations
    const fileRemover = require('del'); // For deleting files and folders
    const fse = require('fs-extra'); // For file system operations like copy
    const glob = require('glob'); // For matching file patterns
    const webHost = require('connect'); // For creating a static web server
    const serveStatic = require('serve-static'); // Middleware to serve static files
    const connectLivereload = require('connect-livereload'); // Middleware for livereload script injection
    const tinyLr = require('tiny-lr'); // Livereload server
    const browserLauncher = require('open'); // For opening URLs in a browser
    const applicationPackager = require('nw-builder'); // For building NW.js applications
    const webPublisher = require('gh-pages'); // For deploying to GitHub Pages
    const fileObserver = require('chokidar'); // For watching file system changes

    // Centralized configuration for resource locations
    const resourceLocations = {
        externalComponents: {
            codeFiles: [
                'node_modules/framework7/dist/js/framework7.js',
                'node_modules/framework7/dist/js/framework7.js.map',
                'node_modules/moment/moment.js'
            ],
            visualSheets: [
                'node_modules/framework7/dist/css/framework7.css'
            ]
        },
        inputAssets: {
            basePath: 'src',
            markupPages: 'src/**/*.html',
            codeFiles: 'src/**/*.js',
            visualSheets: 'src/**/*.css',
            graphicAssets: 'src/img/**/*' // This glob covers the directory
        },
        outputDir: {
            basePath: 'www',
            externalComponents: 'www/lib',
            graphicAssets: 'www/img'
        }
    };

    // A map to store and manage various project operations, similar to Gulp tasks
    const projectOperations = new Map();

    let lrServerInstance; // Instance of the livereload server
    let httpServerInstance; // Instance of the HTTP server

    // Helper function to notify livereload server of changes
    const notifyChange = (changedPath) => {
        if (lrServerInstance) {
            lrServerInstance.changed({
                body: {
                    files: [changedPath]
                }
            });
        }
    };

    // Helper function to copy files based on a glob pattern, stripping a base path
    const copyMatchingFiles = async (sourceGlobPattern, destinationRoot, stripPrefix = '') => {
        const matchingPaths = await glob.sync(sourceGlobPattern); // e.g., 'src/index.html'
        await Promise.all(matchingPaths.map(async (srcPath) => {
            const relativePath = stripPrefix ? srcPath.replace(new RegExp(`^${stripPrefix}[/\\\\]?`), '') : srcPath;
            const destPath = fse.join(destinationRoot, relativePath);
            await fse.copy(srcPath, destPath, { overwrite: true });
        }));
        notifyChange(destinationRoot); // Notify a change in the destination root
    };

    // --- Define Project Operations ---

    // Operation: Remove build artifacts
    projectOperations.set('purgeOutput', async () => {
        console.log('Clearing old build artifacts...');
        await fileRemover([resourceLocations.outputDir.basePath, 'build', 'cache']);
        console.log('Artifacts cleared.');
    });

    // Operation: Copy external vendor components
    projectOperations.set('transferExternalComponents', async () => {
        console.log('Copying external libraries...');
        const allLibFiles = resourceLocations.externalComponents.codeFiles.concat(resourceLocations.externalComponents.visualSheets);
        await Promise.all(allLibFiles.map(async (filePath) => {
            const fileName = fse.basename(filePath);
            await fse.copy(filePath, fse.join(resourceLocations.outputDir.externalComponents, fileName), { overwrite: true });
        }));
        notifyChange(resourceLocations.outputDir.externalComponents);
        console.log('External libraries copied.');
    });

    // Operation: Process HTML templates and package.json
    projectOperations.set('processMarkupPages', async () => {
        console.log('Copying HTML templates and package.json...');
        await copyMatchingFiles(resourceLocations.inputAssets.markupPages, resourceLocations.outputDir.basePath, resourceLocations.inputAssets.basePath);
        await fse.copy('package.json', fse.join(resourceLocations.outputDir.basePath, 'package.json'), { overwrite: true });
        notifyChange(resourceLocations.outputDir.basePath);
        console.log('HTML templates and package.json copied.');
    });

    // Operation: Process application JavaScript files
    projectOperations.set('processApplicationScripts', async () => {
        console.log('Copying application scripts...');
        await copyMatchingFiles(resourceLocations.inputAssets.codeFiles, resourceLocations.outputDir.basePath, resourceLocations.inputAssets.basePath);
        console.log('Application scripts copied.');
    });

    // Operation: Process application CSS files
    projectOperations.set('processVisualStyles', async () => {
        console.log('Copying CSS styles...');
        await copyMatchingFiles(resourceLocations.inputAssets.visualSheets, resourceLocations.outputDir.basePath, resourceLocations.inputAssets.basePath);
        console.log('CSS styles copied.');
    });

    // Operation: Process image assets
    projectOperations.set('processGraphicAssets', async () => {
        console.log('Copying graphic assets...');
        // Copy specific icon file
        await fse.copy(
            fse.join(resourceLocations.inputAssets.basePath, 'apple-touch-icon.png'),
            fse.join(resourceLocations.outputDir.basePath, 'apple-touch-icon.png'),
            { overwrite: true }
        );
        // Copy entire image directory
        await fse.copy(
            fse.join(resourceLocations.inputAssets.basePath, 'img'),
            resourceLocations.outputDir.graphicAssets,
            { overwrite: true }
        );
        notifyChange(resourceLocations.outputDir.graphicAssets);
        console.log('Graphic assets copied.');
    });

    // Operation: Assemble all distribution files
    projectOperations.set('comprehensiveDistributionBuild', async () => {
        console.log('Starting comprehensive distribution build...');
        await Promise.all([
            projectOperations.get('transferExternalComponents')(),
            projectOperations.get('processMarkupPages')(),
            projectOperations.get('processApplicationScripts')(),
            projectOperations.get('processVisualStyles')(),
            projectOperations.get('processGraphicAssets')()
        ]);
        console.log('Comprehensive distribution build finished.');
    });

    // Operation: Monitor source files for changes and re-run relevant operations
    projectOperations.set('monitorFileChanges', () => {
        console.log('Monitoring file changes...');
        const allWatchPaths = [
            ...resourceLocations.externalComponents.codeFiles,
            ...resourceLocations.externalComponents.visualSheets,
            resourceLocations.inputAssets.markupPages,
            resourceLocations.inputAssets.codeFiles,
            resourceLocations.inputAssets.visualSheets,
            resourceLocations.inputAssets.graphicAssets,
            'package.json' // Specific file
        ];

        const fileSystemWatcher = fileObserver.watch(allWatchPaths, { ignored: /(^|[\/\\])\../, persistent: true });

        fileSystemWatcher.on('change', async (path) => {
            console.log(`File changed: ${path}`);
            // Determine which operation to run based on the changed file's path
            if (resourceLocations.externalComponents.codeFiles.includes(path) || resourceLocations.externalComponents.visualSheets.includes(path)) {
                await projectOperations.get('transferExternalComponents')();
            } else if (path.endsWith('.html') && path.startsWith(resourceLocations.inputAssets.basePath)) {
                await projectOperations.get('processMarkupPages')();
            } else if (path === 'package.json') {
                await projectOperations.get('processMarkupPages')(); // package.json is copied with templates
            } else if (path.endsWith('.js') && path.startsWith(resourceLocations.inputAssets.basePath)) {
                await projectOperations.get('processApplicationScripts')();
            } else if (path.endsWith('.css') && path.startsWith(resourceLocations.inputAssets.basePath)) {
                await projectOperations.get('processVisualStyles')();
            } else if (path.startsWith(fse.join(resourceLocations.inputAssets.basePath, 'img')) || path === fse.join(resourceLocations.inputAssets.basePath, 'apple-touch-icon.png')) {
                await projectOperations.get('processGraphicAssets')();
            }
        });
        // Also handle added/deleted files if needed, but 'change' is primary for Gulp watch
        fileSystemWatcher.on('add', (path) => console.log(`File added: ${path}`));
        fileSystemWatcher.on('unlink', (path) => console.log(`File removed: ${path}`));
    });

    // Operation: Start a local development web server with livereload
    projectOperations.set('launchDevelopmentServer', async () => {
        console.log('Preparing development server...');
        await projectOperations.get('comprehensiveDistributionBuild')(); // Ensure all files are built first

        const webServerPort = 8080;
        const liveReloadPort = 35729;

        // Start Livereload server
        lrServerInstance = tinyLr();
        lrServerInstance.listen(liveReloadPort, () => {
            console.log(`Livereload server started on port ${liveReloadPort}`);
        });

        // Start HTTP server with static file serving and livereload injection
        httpServerInstance = webHost();
        httpServerInstance.use(connectLivereload({ port: liveReloadPort }));
        httpServerInstance.use(serveStatic(resourceLocations.outputDir.basePath));
        httpServerInstance.listen(webServerPort, () => {
            console.log(`Web server started on http://localhost:${webServerPort}`);
        });
    });

    // Operation: Open the default web browser to the development server URL
    projectOperations.set('openBrowser', async () => {
        console.log('Opening browser...');
        await browserLauncher('http://localhost:8080');
        console.log('Browser opened.');
    });

    // Operation: Build a desktop application package (NW.js)
    projectOperations.set('assembleDesktopApplication', async () => {
        console.log('Starting desktop application assembly...');
        await projectOperations.get('comprehensiveDistributionBuild')(); // Ensure dist is built first

        const desktopAppBuilder = new applicationPackager({
            files: fse.join(resourceLocations.outputDir.basePath, '**'), // Source files for NW.js
            macIcns: fse.join(resourceLocations.outputDir.basePath, 'img', 'nw.icns'), // Mac icon
            platforms: ['osx'] // Target platforms
        });

        desktopAppBuilder.on('log', console.log); // Log builder output to console

        await desktopAppBuilder.build();
        console.log('Desktop application assembled.');
    });

    // Operation: Publish the output directory to GitHub Pages
    projectOperations.set('publishToWebPages', async () => {
        console.log('Starting web page publication...');
        await projectOperations.get('comprehensiveDistributionBuild')(); // Ensure dist is built first

        await new Promise((resolve, reject) => {
            webPublisher.publish(resourceLocations.outputDir.basePath, (err) => {
                if (err) {
                    console.error('Web page publication failed:', err);
                    return reject(err);
                }
                console.log('Web page publication complete.');
                resolve();
            });
        });
    });

    // Operation: The default workflow (watch, serve, open)
    projectOperations.set('primaryWorkflow', async () => {
        console.log('Initiating primary development workflow...');
        await projectOperations.get('monitorFileChanges')();
        await projectOperations.get('launchDevelopmentServer')();
        await projectOperations.get('openBrowser')();
        console.log('Primary development workflow initiated.');
    });

    // --- Command Line Argument Handling ---

    // Function to execute a specific operation by its name
    const runOperation = async (operationKey) => {
        const operationFunction = projectOperations.get(operationKey);
        if (operationFunction) {
            try {
                await operationFunction();
            } catch (error) {
                console.error(`Operation "${operationKey}" failed:`, error);
                process.exit(1); // Exit with error code
            }
        } else {
            console.error(`Unknown operation: ${operationKey}`);
            process.exit(1); // Exit with error code
        }
    };

    // Map original Gulp task names to new operation names for CLI compatibility
    const operationNameMap = {
        'clean': 'purgeOutput',
        'libraries': 'transferExternalComponents',
        'templates': 'processMarkupPages',
        'scripts': 'processApplicationScripts',
        'styles': 'processVisualStyles',
        'images': 'processGraphicAssets',
        'dist': 'comprehensiveDistributionBuild',
        'watch': 'monitorFileChanges',
        'server': 'launchDevelopmentServer',
        'open': 'openBrowser',
        'build': 'assembleDesktopApplication',
        'deploy': 'publishToWebPages',
        'default': 'primaryWorkflow'
    };

    // Get command line arguments (excluding 'node' and script path)
    const commandArgs = process.argv.slice(2);

    // Determine which operations to run
    if (commandArgs.length === 0) {
        // If no arguments, run the 'default' operation
        runOperation(operationNameMap['default']);
    } else {
        // Map CLI arguments to internal operation names
        const requestedOperations = commandArgs.map(arg => operationNameMap[arg]).filter(Boolean);

        if (requestedOperations.length === 0) {
            console.error('No valid operations specified. Please choose from: clean, libraries, templates, scripts, styles, images, dist, watch, server, open, build, deploy, default.');
            process.exit(1);
        }

        // Execute operations sequentially, as Gulp CLI typically runs multiple tasks
        const executeAllRequested = async () => {
            for (const op of requestedOperations) {
                await runOperation(op);
            }
        };

        executeAllRequested();
    }

}());