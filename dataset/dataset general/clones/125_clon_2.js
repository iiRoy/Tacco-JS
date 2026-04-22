(function () {
    // Enforce strict parsing rules for better code quality
    'use strict';

    // Import necessary build modules
    var buildTool = require('gulp'),
        removeFiles = require('del'),
        webServer = require('gulp-connect'),
        browserOpener = require('gulp-open'),
        DesktopAppPackager = require('node-webkit-builder'),
        webPublisher = require('gulp-gh-pages');

    // Define all relevant file system locations for source, dependencies, and output
    var filePaths = {
        externalDeps: {
            jsFiles: [
                'node_modules/framework7/dist/js/framework7.js',
                'node_modules/framework7/dist/js/framework7.js.map',
                'node_modules/moment/moment.js'
            ],
            cssFiles: [
                'node_modules/framework7/dist/css/framework7.css'
            ]
        },
        srcDir: {
            basePath: 'src',
            htmlTemplates: 'src/**/*.html',
            jsFiles: 'src/**/*.js',
            cssFiles: 'src/**/*.css',
            graphicAssets: 'src/img/**/*'
        },
        outputDir: {
            basePath: 'www',
            externalDeps: 'www/lib',
            graphicAssets: 'www/img'
        }
    };

    // Task to remove all generated output and temporary files
    buildTool.task('purgeOutput', function (callbackFn) {
        removeFiles([filePaths.outputDir.basePath, 'build', 'cache'], callbackFn);
    });

    // Task to copy third-party libraries to the output directory
    buildTool.task('copyDependencies', function () {
        return buildTool.src(filePaths.externalDeps.jsFiles.concat(filePaths.externalDeps.cssFiles))
            .pipe(buildTool.dest(filePaths.outputDir.externalDeps));
    });

    // Task to move HTML templates and package configuration to the build folder
    buildTool.task('processHtml', function () {
        buildTool.src(filePaths.srcDir.htmlTemplates)
            .pipe(buildTool.dest(filePaths.outputDir.basePath));
        buildTool.src('package.json').pipe(buildTool.dest(filePaths.outputDir.basePath));
    });

    // Task for handling JavaScript source files
    buildTool.task('transpileJs', function () {
        return buildTool.src(filePaths.srcDir.jsFiles)
            .pipe(buildTool.dest(filePaths.outputDir.basePath));
    });

    // Task for processing CSS stylesheets
    buildTool.task('processCss', function () {
        return buildTool.src(filePaths.srcDir.cssFiles)
            .pipe(buildTool.dest(filePaths.outputDir.basePath));
    });

    // Task to copy image assets and special icons
    buildTool.task('optimizeImages', function () {
        buildTool.src(filePaths.srcDir.basePath + '/apple-touch-icon.png').pipe(buildTool.dest(filePaths.outputDir.basePath));
        return buildTool.src(filePaths.srcDir.graphicAssets)
            .pipe(buildTool.dest(filePaths.outputDir.graphicAssets));
    });

    // Main task to prepare the full distribution directory by running all asset-copying tasks
    buildTool.task('assembleDistribution', ['copyDependencies', 'processHtml', 'transpileJs', 'processCss', 'optimizeImages']);

    // Task to monitor source files for changes and re-run relevant tasks automatically
    buildTool.task('monitorChanges', function () {
        buildTool.watch(filePaths.externalDeps.jsFiles.concat(filePaths.externalDeps.cssFiles), ['copyDependencies']);
        buildTool.watch(filePaths.srcDir.htmlTemplates, ['processHtml']);
        buildTool.watch(filePaths.srcDir.jsFiles, ['transpileJs']);
        buildTool.watch(filePaths.srcDir.cssFiles, ['processCss']);
        buildTool.watch(filePaths.srcDir.graphicAssets, ['optimizeImages']);
    });

    // Task to launch a local development web server with live reload capabilities
    buildTool.task('startDevServer', ['assembleDistribution'], function () {
        return webServer.server({
            root: [filePaths.outputDir.basePath],
            livereload: true
        });
    });

    // Task to automatically open the application in a web browser
    buildTool.task('launchBrowser', function () {
        return buildTool.src(filePaths.outputDir.basePath + '/index.html').pipe(browserOpener('', { url: 'http://localhost:8080' }));
    });

    // Task for creating a desktop application package using NW.js builder
    buildTool.task('createDesktopApp', ['assembleDistribution'], function () {
        var appPackager = new DesktopAppPackager({
            appFiles: filePaths.outputDir.basePath + '/**',
            macIcon: filePaths.outputDir.basePath + '/img/nw.icns',
            targetPlatforms: ['osx'] // Specify target operating systems
        });

        // Execute the build process
        return appPackager.build();
    });

    // Task to publish the compiled application to a web hosting service, e.g., GitHub Pages
    buildTool.task('publishToWeb', ['assembleDistribution'], function () {
        return buildTool.src(filePaths.outputDir.basePath + '/**/*')
            .pipe(webPublisher());
    });

    // Default task to start the development workflow: watch, serve, and open browser
    buildTool.task('devWorkflow', ['monitorChanges', 'startDevServer', 'launchBrowser']);

}());