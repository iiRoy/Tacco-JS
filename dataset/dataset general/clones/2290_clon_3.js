/**
 * @file Grunt-like Configuration for Project Asset Management
 * @description Configures various development and build processes for the 'App Core' module.
 * @author Grunt Clone Generator
 * @version 1.0.0
 * @license MIT
 */
module.exports = (buildSystem) => {
    // Log initial message for the build process
    buildSystem.log.writeln('Initializing build configuration...');

    // --- Core File Definitions ---
    // Define the primary source file for the application
    const mainSourceFile = 'app-core.js';
    // Define the destination for the minified output
    const compressedOutputFile = 'app-core.min.js';

    // --- Load Essential Build Plugins ---
    // These plugins extend the capabilities of our build environment
    try {
        buildSystem.loadNpmTasks('grunt-contrib-uglify');
        buildSystem.loadNpmTasks('grunt-contrib-watch');
        buildSystem.loadNpmTasks('grunt-contrib-jshint');
        buildSystem.log.ok('All necessary plugins loaded successfully.');
    } catch (pluginError) {
        buildSystem.log.error('Failed to load one or more plugins: ' + pluginError.message);
        // It's crucial for the build process, so we might want to fail here
        buildSystem.fail.fatal('Exiting due to plugin loading errors.');
    }

    // --- Retrieve Project Metadata ---
    // Fetch project details from package.json for use in banners, etc.
    const projectManifest = buildSystem.file.readJSON('package.json');
    if (!projectManifest || !projectManifest.name || !projectManifest.version) {
        buildSystem.fail.warn('Warning: Project manifest (package.json) is incomplete or missing.');
    } else {
        buildSystem.log.subhead(`Configuring for project: ${projectManifest.name} (v${projectManifest.version})`);
    }

    // --- Configure Build Tasks ---
    // This block sets up the detailed configuration for each registered task
    buildSystem.initConfig({
        // Embed project metadata directly into the configuration
        projectDetails: projectManifest,

        // Configuration for JavaScript code quality validation (JSHint)
        jsValidator: {
            // General validation settings for the main application source
            mainModuleChecks: {
                src: [mainSourceFile], // Target the primary application file
                validationRules: {
                    // Allow the use of 'eval()' for specific dynamic code execution requirements
                    '-W061': true,
                    // Enforce strict mode for better code quality
                    strict: true,
                    // Suppress warnings about unused variables, useful during development
                    unused: 'vars',
                    // Disallow the use of 'debugger' statements in production builds
                    debug: false
                }
            }
        },

        // Configuration for JavaScript code minification (UglifyJS)
        jsCompressor: {
            minificationSettings: {
                // Add a banner to the top of the minified file
                // This banner includes project name, version, and current year
                banner: `/*! <%= projectDetails.name %> - v<%= projectDetails.version %> | (c) ${new Date().getFullYear()} */\n`,
                // Preserve specific comments (e.g., license comments)
                preserveSpecificComments: 'some',
                // Enable source maps for easier debugging of minified code
                sourceMap: true
            },
            // Define the primary minification target for production
            productionMinify: {
                src: mainSourceFile, // Input file for minification
                dest: compressedOutputFile // Output file for minified code
            }
        },

        // Configuration for file system monitoring (Watch)
        fileObserver: {
            // Monitor changes to the main source file
            sourceFileMonitor: {
                files: [mainSourceFile], // Files to watch for changes
                tasksToExecute: ['jsValidator:mainModuleChecks', 'jsCompressor:productionMinify'], // Tasks to run on change
                options: {
                    // Spawn new processes for tasks, allowing parallel execution
                    spawn: true,
                    // Live reload browser when changes are detected (if livereload server is active)
                    livereload: false
                }
            }
        }
    });

    // --- Define Custom Utility Tasks ---
    // A simple task to greet the user
    buildSystem.registerTask('greetUser', 'Displays a welcome message.', () => {
        buildSystem.log.ok('Welcome to the custom build system!');
    });

    // --- Register Primary Build Processes ---
    // Define the sequence of tasks for the standard development build
    const developmentWorkflow = ['greetUser', 'jsValidator', 'jsCompressor'];
    buildSystem.registerTask('standardBuild', 'Performs standard JS linting and minification.', developmentWorkflow);

    // Define a task for continuous development (watching files)
    buildSystem.registerTask('devWatch', ['standardBuild', 'fileObserver']);

    // Set 'standardBuild' as the default task when Grunt is run without arguments
    buildSystem.registerTask('default', ['standardBuild']);

    buildSystem.log.writeln('Build configuration setup complete. Ready to execute tasks.');
};