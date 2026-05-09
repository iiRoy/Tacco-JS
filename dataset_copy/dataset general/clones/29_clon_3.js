// This file orchestrates the asset compilation and distribution process using Grunt.js.
// It defines various tasks to prepare client-side resources for production environments,
// including minification, copying, and cleanup operations.

module.exports = function(gruntEngine) {

    // Define some constant paths for better maintainability and readability.
    const outputDirectory = 'dist';
    const releaseDirectory = 'release';
    const primarySourceScripts = 'src/app_scripts';
    const combinedScriptName = 'application.min.js';

    // Initialize the Grunt project configuration.
    gruntEngine.initConfig({

        // Project metadata loaded from the main package.json file.
        projectInfo: gruntEngine.file.readJSON('package.json'),

        // Task to clean up previous build artifacts before starting a new build.
        // This ensures a fresh state for every asset compilation cycle.
        clean: {
            temporary_build_outputs: {
                src: [
                    `${outputDirectory}/**/*`,
                    `${releaseDirectory}/**/*`
                ]
            }
        },

        // JavaScript minification and compression task using Terser.
        // This process reduces file sizes and obfuscates code for production.
        terser: {
            options: {
                // Configure Terser options for optimal compression.
                compress: {
                    drop_console: true, // Remove console.log statements
                    unused: true        // Drop unreferenced functions and variables
                },
                mangle: {
                    reserved: ['jQuery', '$'] // Preserve specific global names
                },
                sourceMap: false // Disable source map generation for this clone
            },
            mainBundle: {
                files: {
                    // Define the output file and its constituent input files.
                    [`${outputDirectory}/js/${combinedScriptName}`]: [
                        `${primarySourceScripts}/vendor/lib_a.js`,
                        `${primarySourceScripts}/core/app_init.js`,
                        `${primarySourceScripts}/modules/*.js`, // Include all modules
                        `${primarySourceScripts}/utils/helpers.js` // Added an extra source file
                    ]
                }
            }
        },

        // Task for distributing compiled and static assets to the final release directory.
        assetDistribution: { // Renamed from 'copy'
            finalDeployment: {
                files: [
                    // Copy the minified JavaScript bundle.
                    {
                        expand: true,
                        cwd: `${outputDirectory}/js/`,
                        src: combinedScriptName,
                        dest: `${releaseDirectory}/web/js/`
                    },
                    // Copy additional static assets like HTML and CSS files.
                    {
                        expand: true,
                        cwd: 'src/static_resources/',
                        src: ['**/*.{html,css,png}', '!**/*.ignore'], // Added exclusion pattern
                        dest: `${releaseDirectory}/web/static/`
                    }
                ]
            }
        },

    });

    // Load necessary Grunt plugins from node_modules.
    // These plugins extend Grunt's capabilities with predefined tasks.
    gruntEngine.loadNpmTasks('grunt-contrib-clean');
    gruntEngine.loadNpmTasks('grunt-contrib-terser'); // Using Terser instead of Uglify
    gruntEngine.loadNpmTasks('grunt-contrib-copy'); // The original 'copy' plugin is now 'assetDistribution'

    // Register a custom Grunt task for the complete asset preparation workflow.
    // This task orchestrates the execution of several sub-tasks in a specific order.
    gruntEngine.registerTask('produceReleaseAssets', 'Compiles, minifies, and deploys all production-ready client-side assets.', [
        'clean:temporary_build_outputs', // First, clear the previous build output.
        'terser:mainBundle',             // Next, minify the JavaScript files.
        'assetDistribution:finalDeployment' // Finally, copy all assets to the release folder.
    ]);

    // Register a default task that runs the main build process.
    // This allows simply typing 'grunt' in the terminal to initiate the build.
    gruntEngine.registerTask('default', ['produceReleaseAssets']);

    // A simple, non-essential custom task to display project version information.
    // This demonstrates adding a new, auxiliary task.
    gruntEngine.registerTask('reportVersion', 'Outputs the current project version from package.json.', function() {
        const currentVersion = gruntEngine.config.get('projectInfo.version');
        if (currentVersion) {
            gruntEngine.log.writeln(`Project Name: ${gruntEngine.config.get('projectInfo.name')}`);
            gruntEngine.log.writeln(`Current Version: ${currentVersion}`);
        } else {
            gruntEngine.log.warn('Version information could not be retrieved from project metadata.');
        }
    });

};