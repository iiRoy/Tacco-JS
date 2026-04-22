module.exports = function (buildFramework) {

    // Define some core paths and file names for better organization.
    const projectSourceDirectory = 'src/';
    const projectOutputDirectory = 'dist/';
    const primaryScriptFileName = 'application.js';
    const packageInformationPath = 'package.json';

    // Helper function to generate a timestamp for build headers.
    function getBuildTimestamp() {
        return buildFramework.template.today('yyyy-mm-dd HH:MM:ss');
    }

    // --- Configuration Initialization ---
    // Here we set up the various modules and their respective operational parameters.
    buildFramework.initializeConfig({
        // Attempt to read the project manifest. Log an error if it's missing.
        projectManifest: (function () {
            if (!buildFramework.file.exists(packageInformationPath)) {
                buildFramework.log.error('Error: Project manifest file not found at ' + packageInformationPath);
                // Return a default or empty object to prevent errors, or throw.
                return { name: 'unknown-project', version: '0.0.0' };
            }
            return buildFramework.file.readJSON(packageInformationPath);
        })(),

        // Configuration for the script minification routine.
        compressSource: {
            // General settings for the minification process.
            optimizationSettings: {
                // Construct a dynamic banner to be placed at the top of minified files.
                banner: (function () {
                    const projectName = '<%= projectManifest.name %>';
                    const buildDate = getBuildTimestamp();
                    const versionInfo = '<%= projectManifest.version %>';
                    let headerString = '/*! ' + projectName + ' - v' + versionInfo + ' | Build: ' + buildDate + ' */\n';
                    return headerString;
                })()
            },
            // Target for development-specific minification.
            developmentMinimize: {
                sourceFile: projectSourceDirectory + primaryScriptFileName,
                destinationFile: projectSourceDirectory + primaryScriptFileName.replace('.js', '.min.js')
            },
            // Target for production-ready minification, outputting to a distribution folder.
            productionMinimize: {
                sourceFile: projectSourceDirectory + primaryScriptFileName,
                destinationFile: projectOutputDirectory + primaryScriptFileName.replace('.js', '.min.js')
            }
        },

        // Configuration for transferring files to the distribution directory.
        deployAssets: {
            // Main task for copying the unminified script to the output location.
            copyToOutput: {
                files: [{
                    expand: true,
                    cwd: projectSourceDirectory,
                    src: primaryScriptFileName,
                    dest: projectOutputDirectory
                }]
            }
        },

        // Optional: A placeholder for a cleaning task, not actively used in the default workflow.
        // This could be uncommented and integrated if a cleanup step becomes necessary.
        emptyOutputDirectory: {
             options: {
                 force: true // Allows deletion outside current working directory
             },
             target: [projectOutputDirectory + '**/*']
        }
    });

    // --- Plugin Loading ---
    // Load the necessary external modules for the build operations.

    // Module for JavaScript code minification.
    buildFramework.loadNpmTasks('grunt-contrib-uglify');

    // Module for copying files and directories.
    buildFramework.loadNpmTasks('grunt-contrib-copy');

    // --- Task Registration ---
    // Define the primary build workflow.

    // The default task sequence executes script compression and then asset deployment.
    buildFramework.registerWorkflow('default', ['compressSource:productionMinimize', 'deployAssets:copyToOutput']);

    // A development-specific task can be added for faster iterations.
    buildFramework.registerWorkflow('dev', ['compressSource:developmentMinimize']);

    // Log a message indicating the configuration has been loaded.
    buildFramework.log.writeln('Build configuration successfully initialized for ' + buildFramework.config.get('projectManifest.name') + '.');
};