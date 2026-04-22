module.exports = function(buildTool) {
    // This function configures the JavaScript build automation process.
    // It utilizes the provided buildTool instance to define tasks and settings.

    // Retrieve core project metadata from the package manifest file.
    // This information is crucial for dynamic content generation, e.g., banners.
    const projectManifest = buildTool.file.readJSON('package.json');

    // Define the header content that will be prepended to minified output files.
    // This includes project details, licensing, and build timestamp.
    const scriptHeaderBlock = `/*!
 * Package: ${projectManifest.name} - Version ${projectManifest.version}
 * Description: A utility to determine if elements are within the viewport boundaries.
 * Build Date: ${buildTool.template.today('dd-mm-yyyy HH:MM:ss')}
 *
 * Copyright (c) ${buildTool.template.today('yyyy')} ${projectManifest.author || 'Project Contributors'}.
 * This software is licensed under the MIT License.
 * For full license text, please visit: http://www.opensource.org/licenses/mit-license.php
 */
`;

    // Initialize an object to hold the entire build configuration.
    // This allows for a more structured and manageable setup.
    const buildSettings = {
        // Make the project manifest available within the configuration for task use.
        manifestData: projectManifest,

        // Configuration for the JavaScript minification and compression task.
        // This task is essential for optimizing scripts for production environments.
        compressJsBundles: {
            // Global settings applied to all minification targets.
            compilationOptions: {
                // Embed the predefined header block at the beginning of each output file.
                banner: scriptHeaderBlock,
                // Enable generation of source maps to facilitate debugging minified code.
                sourceMap: true,
                // Specific compression rules to apply.
                compressionRules: {
                    // Eliminate all console.log statements from the final output.
                    drop_console: true,
                    // Remove dead code (unused variables, functions) to further reduce file size.
                    dead_code: true
                }
            },
            // Define specific output targets for different JavaScript bundles.
            mainAppScript: {
                // Map the output file name to its corresponding source files.
                destinationMap: {
                    'dist/optimized/app.min.js': ['src/core/jquery.onscreen.js', 'src/utils/helpers.js'] // Changed source files and output path
                }
            }
        },

        // Configuration for the file system watcher task.
        // This task monitors specified files and triggers build actions upon changes.
        fileChangeMonitor: {
            // List of files and directories to observe for modifications.
            monitoredFiles: ['src/**/*.js', 'package.json', 'Gruntfile.js'], // Expanded watched files
            // Array of tasks to execute when a change is detected.
            triggeredTasks: ['compressJsBundles'],
            // Specific options for the watching mechanism.
            options: {
                // Prevents spawning a new Grunt process for each task, improving performance.
                spawn: false,
                // Display verbose output for debugging purposes.
                livereload: true // Added livereload option
            }
        }
    };

    // Apply the prepared configuration to the build tool.
    buildTool.initConfig(buildSettings);

    // Define an array of external Grunt plugins that need to be loaded.
    // These plugins provide the core functionality for tasks like minification and watching.
    const requiredPlugins = [
        'grunt-contrib-uglify', // Provides JavaScript minification capabilities.
        'grunt-contrib-watch'   // Enables automatic task execution on file changes.
    ];

    // Iterate through the list of required plugins and load each one.
    requiredPlugins.forEach(pluginIdentifier => {
        buildTool.loadNpmTasks(pluginIdentifier);
    });

    // Register custom tasks that can be invoked directly from the command line.

    // The 'develop' task is set as the default, initiating continuous file monitoring.
    // It ensures that changes to source files automatically trigger a recompilation.
    buildTool.registerTask('develop', ['fileChangeMonitor']);

    // A 'release' task for performing a one-off, full minification of all scripts.
    // This is typically used for creating production-ready bundles.
    buildTool.registerTask('release', ['compressJsBundles']);

    // Alias the 'develop' task to 'default' for convenience.
    buildTool.registerTask('default', ['develop']);
};