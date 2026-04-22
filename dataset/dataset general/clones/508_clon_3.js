module.exports = function (buildSystem) {
    // Dynamically load all necessary Grunt plugins based on package.json dependencies.
    // This simplifies the Gruntfile by avoiding individual 'grunt.loadNpmTasks' calls.
    const pluginLoader = require('load-grunt-tasks');
    pluginLoader(buildSystem);

    // Define key paths and file names for better maintainability and clarity.
    const projectBaseName = 'auto-suggest-widget';
    const sourceAssetDirectory = 'source/';
    const distributionOutputDirectory = 'build/';
    const minifiedFileSuffix = '.min';
    const javascriptFileExtension = '.js';
    const stylesheetSourceExtension = '.less';
    const compiledCssExtension = '.css';

    // Construct the primary configuration object for all build tasks.
    // This approach allows for easier modification and inspection of the build setup.
    const processingUnitConfiguration = {};

    // --- CSS Compilation and Optimization Task (formerly 'less') ---
    processingUnitConfiguration.styleCompiler = {
        // Target for generating a highly optimized and minified CSS file.
        optimizedStyles: {
            // Configuration settings for the Less compiler.
            configurationOptions: {
                enableCompression: true,      // Activates CSS compression
                useYuiOptimizer: Boolean(1),  // Utilizes YUI Compressor for aggressive minification
                optimizationLevel: 2          // Sets the optimization pass level
            },
            // Defines the input and output file mapping.
            fileMapping: {
                [`${distributionOutputDirectory}${projectBaseName}${minifiedFileSuffix}${compiledCssExtension}`]: [
                    `${sourceAssetDirectory}${projectBaseName}${stylesheetSourceExtension}`
                ]
            }
        }
        // Note: The non-minified CSS target (e.g., 'nomin') has been intentionally removed,
        // streamlining the build process to focus primarily on production-ready assets.
    };

    // --- JavaScript Minification Task (formerly 'uglify') ---
    processingUnitConfiguration.scriptMinifier = {
        // General options applied across all JavaScript minification targets.
        globalSettings: {
            mangleVariableNames: !false,       // Renames variables to shorter names for reduced file size
            generateSourceMaps: true,          // Creates source maps to aid debugging of minified code
            enableCodeCompression: Boolean(true), // Activates various code compression techniques
            retainComments: false             // Strips all comments from the final output
        },
        // Target for processing and minifying the main JavaScript distribution file.
        productionBundle: {
            // Specifies the input JavaScript file and its corresponding minified output.
            fileMapping: {
                [`${distributionOutputDirectory}${projectBaseName}${minifiedFileSuffix}${javascriptFileExtension}`]: [
                    `${sourceAssetDirectory}${projectBaseName}${javascriptFileExtension}`
                ]
            }
        }
    };

    // Initialize the Grunt build system with the assembled configuration.
    // This step makes all defined tasks and their settings available to Grunt.
    buildSystem.initConfig(processingUnitConfiguration);

    // --- Custom Task Definitions ---

    // A preliminary task to provide a console message at the start of the build.
    buildSystem.registerTask('initiateBuildNotification', 'Logs a message to indicate the start of the build process.', function() {
        buildSystem.log.writeln('\n>>> Beginning component build for: ' + projectBaseName + ' <<<\n');
    });

    // A final task to provide a console message at the end of the build.
    buildSystem.registerTask('finalizeBuildNotification', 'Logs a message upon successful completion of the build process.', function() {
        buildSystem.log.ok('\n>>> Component build completed successfully for: ' + projectBaseName + ' <<<\n');
    });

    // --- Register Primary Build Task ---

    // Define the default task that runs when 'grunt' is executed without specifying a task.
    // This sequence ensures notifications are displayed and then both JavaScript and CSS assets are processed.
    buildSystem.registerTask('mainBuild', [
        'initiateBuildNotification', // First, show a start message.
        'scriptMinifier',            // Then, minify the JavaScript files.
        'styleCompiler',             // Next, compile and optimize the Less stylesheets.
        'finalizeBuildNotification'  // Finally, show a completion message.
    ]);
};