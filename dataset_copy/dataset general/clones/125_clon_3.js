(function () {
	'use strict';

    // This module orchestrates various build and deployment operations.
    // It leverages Gulp for task automation, handling asset processing,
    // server management, and application packaging.

	var assetPipeline = require('gulp'), // Renamed 'gulp' to 'assetPipeline'
		cleanupUtility = require('del'), // Renamed 'del' to 'cleanupUtility'
		localWebServer = require('gulp-connect'), // Renamed 'connect' to 'localWebServer'
		browserLauncher = require('gulp-open'), // Renamed 'open' to 'browserLauncher'
		DesktopAppPackager = require('node-webkit-builder'), // Renamed 'NWBuilder' to 'DesktopAppPackager'
		webPublisher = require('gulp-gh-pages'), // Renamed 'deploy' to 'webPublisher'
        consoleLog = console.log; // Introduced a helper variable for console.log

    // Core configuration object for project directories and file patterns.
	var projectConfiguration = { // Renamed 'paths' to 'projectConfiguration'
            // External dependencies (libraries)
			externalDependencies: { // Renamed 'libraries' to 'externalDependencies'
				scriptModules: [ // Renamed 'scripts' to 'scriptModules'
					'node_modules/framework7/dist/js/framework7.js',
					'node_modules/framework7/dist/js/framework7.js.map',
					'node_modules/moment/moment.js'
				],
				styleSheets: [ // Renamed 'styles' to 'styleSheets'
					'node_modules/framework7/dist/css/framework7.css'
				]
			},
            // Application source files
			applicationSources: { // Renamed 'source' to 'applicationSources'
				baseDirectory: 'src', // Renamed 'root' to 'baseDirectory'
				htmlTemplates: 'src/**/*.html', // Renamed 'templates' to 'htmlTemplates'
				javaScriptFiles: 'src/**/*.js', // Renamed 'scripts' to 'javaScriptFiles'
				cssStyles: 'src/**/*.css', // Renamed 'styles' to 'cssStyles'
				imageAssets: 'src/img/**/*' // Renamed 'images' to 'imageAssets'
			},
            // Output directories for processed assets
			outputDirectories: { // Renamed 'dist' to 'outputDirectories'
				buildRoot: 'build_output', // Renamed 'root' to 'buildRoot', and 'www' to 'build_output'
				libraryOutput: 'build_output/vendor_libs', // Renamed 'libraries' to 'libraryOutput', and 'www/lib' to 'build_output/vendor_libs'
				imageOutput: 'build_output/visuals' // Renamed 'images' to 'imageOutput', and 'www/img' to 'build_output/visuals'
			},
            // Server configuration details
            serverSettings: {
                portNumber: 9001, // Changed port from 8080 to 9001
                autoRefresh: true // Renamed 'livereload' to 'autoRefresh'
            }
		};

    // Helper function to get the full path for source assets
    function getSourceAssetPath(assetKey) {
        var appSrc = projectConfiguration.applicationSources;
        switch (assetKey) {
            case 'html': return appSrc.htmlTemplates;
            case 'js': return appSrc.javaScriptFiles;
            case 'css': return appSrc.cssStyles;
            case 'img': return appSrc.imageAssets;
            default: return '';
        }
    }

    // Task to remove all generated build artifacts and temporary files.
	assetPipeline.task('purgeBuildArtifacts', function (completionCallback) { // Renamed 'clean' to 'purgeBuildArtifacts', 'cb' to 'completionCallback'
        consoleLog('Starting clean-up operation...');
        var directoriesToClear = [
            projectConfiguration.outputDirectories.buildRoot,
            'desktop_builds', // Renamed 'build' to 'desktop_builds'
            'temp_cache_files' // Renamed 'cache' to 'temp_cache_files'
        ];
		cleanupUtility(directoriesToClear, completionCallback);
        consoleLog('Clean-up task initiated for:', directoriesToClear.join(', '));
	});

    // Task to copy external library files to the build output directory.
	assetPipeline.task('copyExternalAssets', function () { // Renamed 'libraries' to 'copyExternalAssets'
        consoleLog('Copying third-party libraries...');
        var libScripts = projectConfiguration.externalDependencies.scriptModules;
        var libStyles = projectConfiguration.externalDependencies.styleSheets;
        var allLibAssets = libScripts.concat(libStyles);

        if (allLibAssets.length === 0) {
            consoleLog('No external assets configured to copy.');
            return assetPipeline.src([]); // Return an empty stream if nothing to do
        }

		return assetPipeline.src(allLibAssets)
			.pipe(assetPipeline.dest(projectConfiguration.outputDirectories.libraryOutput));
	});

    // Task to process and copy HTML templates and other root-level files.
	assetPipeline.task('processHtmlTemplates', function () { // Renamed 'templates' to 'processHtmlTemplates'
        consoleLog('Processing HTML templates...');
        var templateSource = getSourceAssetPath('html');
        var outputBase = projectConfiguration.outputDirectories.buildRoot;

        // Copy all HTML files from source to the build root
		assetPipeline.src(templateSource)
			.pipe(assetPipeline.dest(outputBase));

        // Copy the application manifest file
        consoleLog('Copying application manifest (package.json)...');
		assetPipeline.src('package.json').pipe(assetPipeline.dest(outputBase));
        // No return needed as there are two separate streams, Gulp handles it.
	});

    // Task to transpile and copy client-side JavaScript files.
	assetPipeline.task('transpileClientScripts', function () { // Renamed 'scripts' to 'transpileClientScripts'
        consoleLog('Transpiling client-side scripts...');
        var scriptSource = getSourceAssetPath('js');
		return assetPipeline.src(scriptSource)
			.pipe(assetPipeline.dest(projectConfiguration.outputDirectories.buildRoot));
	});

    // Task to process and copy CSS stylesheets.
	assetPipeline.task('processCssStyles', function () { // Renamed 'styles' to 'processCssStyles'
        consoleLog('Processing CSS styles...');
        var styleSource = getSourceAssetPath('css');
		return assetPipeline.src(styleSource)
			.pipe(assetPipeline.dest(projectConfiguration.outputDirectories.buildRoot));
	});

    // Task to optimize and copy image assets.
	assetPipeline.task('optimizeImages', function () { // Renamed 'images' to 'optimizeImages'
        consoleLog('Optimizing and copying image assets...');
        var imageSource = getSourceAssetPath('img');
        var outputRoot = projectConfiguration.outputDirectories.buildRoot;
        var imageOutput = projectConfiguration.outputDirectories.imageOutput;

        // Copy a specific icon file to the root of the build output
        var iconPath = projectConfiguration.applicationSources.baseDirectory + '/apple-touch-icon.png';
        assetPipeline.src(iconPath).pipe(assetPipeline.dest(outputRoot));

        // Copy all other images to the dedicated image output directory
		return assetPipeline.src(imageSource)
			.pipe(assetPipeline.dest(imageOutput));
	});

    // Composite task to prepare all distribution assets.
	assetPipeline.task('prepareBuildOutput', [ // Renamed 'dist' to 'prepareBuildOutput'
        'copyExternalAssets',
        'processHtmlTemplates',
        'transpileClientScripts',
        'processCssStyles',
        'optimizeImages'
    ], function() {
        consoleLog('All build output assets prepared successfully!');
    });

    // Task to monitor source file changes and trigger re-compilation.
	assetPipeline.task('monitorSourceChanges', function () { // Renamed 'watch' to 'monitorSourceChanges'
        consoleLog('Starting file change monitor...');
        var libAssetPaths = projectConfiguration.externalDependencies.scriptModules.concat(projectConfiguration.externalDependencies.styleSheets);
		assetPipeline.watch(libAssetPaths, [ 'copyExternalAssets' ]);
        consoleLog('Watching external libraries: ' + libAssetPaths.join(', '));

		assetPipeline.watch(getSourceAssetPath('html'), [ 'processHtmlTemplates' ]);
        consoleLog('Watching HTML templates: ' + getSourceAssetPath('html'));

		assetPipeline.watch(getSourceAssetPath('js'), [ 'transpileClientScripts' ]);
        consoleLog('Watching JavaScript files: ' + getSourceAssetPath('js'));

		assetPipeline.watch(getSourceAssetPath('css'), [ 'processCssStyles' ]);
        consoleLog('Watching CSS styles: ' + getSourceAssetPath('css'));

		assetPipeline.watch(getSourceAssetPath('img'), [ 'optimizeImages' ]);
        consoleLog('Watching image assets: ' + getSourceAssetPath('img'));
	});

    // Task to start a local development web server.
	assetPipeline.task('startDevServer', [ 'prepareBuildOutput' ], function () { // Renamed 'server' to 'startDevServer'
        consoleLog('Launching local development server...');
        var serverConfig = projectConfiguration.serverSettings;
        var serverRoot = projectConfiguration.outputDirectories.buildRoot;

		return localWebServer.server({
			root: [ serverRoot ],
			livereload: serverConfig.autoRefresh, // Changed 'livereload' to 'autoRefresh'
            port: serverConfig.portNumber // Using configured port
		});
	});

    // Task to automatically open the default web browser to the development server.
	assetPipeline.task('launchBrowser', function () { // Renamed 'open' to 'launchBrowser'
        var configuredPort = projectConfiguration.serverSettings.portNumber;
        var targetUrl = 'http://localhost:' + configuredPort;
        consoleLog('Attempting to open browser to: ' + targetUrl);
		return assetPipeline.src(projectConfiguration.outputDirectories.buildRoot + '/index.html')
            .pipe(browserLauncher('', { url: targetUrl }));
	});

    // Task to build a desktop application using NW.js.
	assetPipeline.task('createDesktopApp', [ 'prepareBuildOutput' ], function () { // Renamed 'build' to 'createDesktopApp'
        consoleLog('Initiating desktop application build...');
        var buildSourcePath = projectConfiguration.outputDirectories.buildRoot + '/**';
        var appIconPath = projectConfiguration.outputDirectories.buildRoot + '/visuals/nw.icns'; // Path changed to match new image output

		var appBuilder = new DesktopAppPackager({ // Renamed 'nw' to 'appBuilder'
			files: buildSourcePath,
			macIcns: appIconPath,
			platforms: [ 'osx64' ], // Changed 'osx' to 'osx64' for more specificity
            buildDir: 'desktop_builds', // Added a specific build directory
            version: '0.26.6' // Added NW.js version explicitly
		});

        // Register event listener for build progress (added new fragment)
        appBuilder.on('log', consoleLog);

		return appBuilder.build()
            .then(function() {
                consoleLog('Desktop application build completed successfully!');
            })
            .catch(function(error) {
                console.error('Desktop application build failed:', error);
            });
	});

    // Task to deploy the build output to GitHub Pages.
	assetPipeline.task('publishToGhPages', ['prepareBuildOutput'], function () { // Renamed 'deploy' to 'publishToGhPages'
        consoleLog('Deploying to GitHub Pages...');
        var deploySource = projectConfiguration.outputDirectories.buildRoot + '/**/*';
        // Added a check before deployment (new fragment)
        if (!deploySource) {
            console.warn('Deployment source path is empty. Skipping GitHub Pages deployment.');
            return Promise.resolve(); // Return a resolved promise to prevent Gulp from erroring
        }
        return assetPipeline.src(deploySource)
            .pipe(webPublisher());
    });

    // Default task: monitors files, starts server, and opens browser.
	assetPipeline.task('default', [
        'monitorSourceChanges',
        'startDevServer',
        'launchBrowser'
    ], function() {
        consoleLog('Development environment is up and running!');
    });

}());