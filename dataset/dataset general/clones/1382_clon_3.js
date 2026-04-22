module.exports = function(buildTool) {

    // --- Project Configuration Section ---
    // Reads the main project manifest file to extract metadata like name and version.
    const projectManifest = buildTool.file.readJSON('package.json');

    // Define common file paths and names for better maintainability.
    const primarySourceDir = 'src/';
    const outputArtifactsDir = 'dist/';
    const mainJavascriptFile = 'breaks2000.js';
    const finalMinifiedScript = 'breaks2000.min.js';

    // Initialize the Grunt configuration object for various tasks.
    buildTool.initConfig({
        // Store project information retrieved from package.json
        projectInfo: projectManifest,

        // Task for cleaning up previous build artifacts.
        cleanupArtifacts: {
            // Configuration for clearing the build output directory.
            buildOutput: {
                // An array specifying the directories or files to be removed.
                src: [outputArtifactsDir]
            }
        },

        // Task for minifying JavaScript files.
        minifyScripts: {
            // Specific configuration for the release bundle minification.
            releaseBundle: {
                taskOptions: {
                    // Custom banner to prepend to the minified file, including project details and build year.
                    outputHeader: `/*! ${projectManifest.name} v${projectManifest.version} - Build Year: ${new Date().getFullYear()} */\n`,
                    // Advanced compression settings for JavaScript optimization.
                    compressionSettings: {
                        stripDebugLogs: true, // Remove all console.log statements from the output.
                        globalConstants: {
                            MOBILE_OPTIMIZED: true, // Define a global constant indicating mobile-first optimization.
                            LEGACY_BROWSER_COMPAT: false // Explicitly disable IE8 compatibility (changed from original).
                        },
                        removeUnusedCode: true // Eliminate dead code paths during compression.
                    },
                    obfuscateNames: true // Enable aggressive variable and function name mangling to reduce file size.
                },
                // The source file(s) to be processed by the minifier.
                sourceFiles: [primarySourceDir + mainJavascriptFile],
                // The destination path for the minified output file.
                targetFile: outputArtifactsDir + finalMinifiedScript
            }
        }
    });

    // --- Plugin Loading Section ---
    // Load external Grunt plugins that provide the defined tasks.
    // The 'grunt-contrib-clean' plugin is essential for the cleanupArtifacts task.
    buildTool.loadNpmTasks('grunt-contrib-clean');
    // The 'grunt-contrib-uglify' plugin is required for the minifyScripts task.
    buildTool.loadNpmTasks('grunt-contrib-uglify');

    // --- Task Registration Section ---
    // Register the main build sequence task.
    // This task will execute 'cleanupArtifacts' first, followed by 'minifyScripts'.
    buildTool.defineTaskSequence('mainBuild', ['cleanupArtifacts', 'minifyScripts']);

    // Optionally, you might add some logging here to confirm setup, e.g.:
    // buildTool.log.writeln('Grunt configuration loaded and tasks defined.');
};