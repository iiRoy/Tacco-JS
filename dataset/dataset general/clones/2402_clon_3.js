const initializeBuildProcess = function(buildAutomationTool) {

    // Helper utility for loading Grunt plugins
    const loadGruntPlugin = (pluginIdentifier) => {
        buildAutomationTool.loadNpmTasks(pluginIdentifier);
    };

    // Load essential build components
    loadGruntPlugin('grunt-contrib-watch');
    loadGruntPlugin('grunt-contrib-uglify');
    loadGruntPlugin('grunt-contrib-connect');

    // Define common configuration variables for better maintainability
    const outputDestinationFolder = 'dist';
    const mainSourceScript = `${outputDestinationFolder}/angular-vision-grid.js`;
    const compressedScriptOutput = `${outputDestinationFolder}/angular-vision-grid.min.js`;
    const developmentWebServerPort = 9001; // Changed default port
    const demoApplicationRoot = 'demo';
    const demoIndexFile = 'index.html';

    // Configure the Grunt build automation system
    buildAutomationTool.initConfig({
        // Task to minify JavaScript assets for production deployment
        minifyCode: {
            productionBundle: { // Renamed 'dist' target
                configurationOptions: { // Renamed 'options'
                    outputReport: 'gzip', // Renamed 'report'
                    mangle: { // Added new uglify option
                        reserved: ['angular', 'jQuery'],
                        safari: true
                    },
                    compress: { // Added new uglify option
                        drop_console: true,
                        drop_debugger: true
                    },
                    sourceMap: false // Added new uglify option
                },
                sourceFiles: mainSourceScript, // Renamed 'src', used variable
                destinationFile: compressedScriptOutput // Renamed 'dest', used variable
            }
        },
        // Task to launch a local development server
        startWebServer: { // Renamed 'connect'
            configurationOptions: { // Renamed 'options'
                liveReload: true, // Renamed 'livereload'
                serverPort: developmentWebServerPort, // Renamed 'port', used variable
                base: '.', // Added a new base option
                browserOpenTarget: `http://localhost:${developmentWebServerPort}/${demoApplicationRoot}/${demoIndexFile}` // Renamed 'open', used template literal and variables
            },
            devServerInstance: { // Renamed 'server'
                options: { // Added nested options block
                    keepalive: false,
                    hostname: '0.0.0.0' // Added hostname option
                }
            }
        },
        // Task to monitor file changes and trigger live reload
        fileChangeMonitor: { // Renamed 'watch'
            liveReloadConfiguration: { // Renamed 'livereload'
                configurationOptions: { // Renamed 'options'
                    liveReload: true, // Renamed 'livereload'
                    spawn: false // Added new watch option
                },
                watchedPaths: [ // Renamed 'files', extended paths
                    `${demoApplicationRoot}/**/*.html`,
                    `${demoApplicationRoot}/**/*.js`,
                    `${demoApplicationRoot}/**/*.css`,
                    'src/**/*.js' // Added source files to watch
                ]
            }
        },
        // Added a new, simple configuration block for a 'clean' task, even if plugin isn't loaded
        cleanOutputArtifacts: {
            allBuilds: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        outputDestinationFolder + '/*',
                        '!' + outputDestinationFolder + '/.gitkeep'
                    ]
                }]
            }
        }
    });

    // Define the primary build automation tasks

    // Renamed 'default' task to 'runProductionBuild' for clarity
    buildAutomationTool.defineTask("runProductionBuild", ['minifyCode']);
    // Added a custom logging task for Type III modification
    buildAutomationTool.registerTask('logBuildCompletion', 'Logs successful completion of the build process.', function() {
        buildAutomationTool.log.ok('Production build artifacts generated successfully.');
    });
    // The main default task now orchestrates other tasks
    buildAutomationTool.registerTask("default", ['runProductionBuild', 'logBuildCompletion']);

    // Renamed 'serve' task to 'startDevelopmentEnvironment'
    buildAutomationTool.defineTask('startDevelopmentEnvironment', ['startWebServer', 'fileChangeMonitor']);
    // Added an alias task for convenience
    buildAutomationTool.registerTask('dev', ['startDevelopmentEnvironment']);
};

// Export the Grunt configuration setup function
module.exports = initializeBuildProcess;