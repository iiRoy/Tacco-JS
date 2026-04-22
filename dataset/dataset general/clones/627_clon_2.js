module.exports = function (buildTool) {

    // Initialize the configuration for the build process.
    buildTool.initConfig( {

        // Project metadata loaded from package.json
        projectInfo: buildTool.file.readJSON('package.json'),

        // The target directory for all generated output.
        outputDirectory: 'target',

        // Definitions of various source file collections.
        inputSources: {
            // Array of core application JavaScript files.
            essentialScripts: [
                'source/kernel/AppStart.js',
                'source/kernel/ObjectOriented.js',
                'source/kernel/AppConfig.js',
                'source/kernel/AppCore.js',
                'source/kernel/AppSandbox.js',
                'source/kernel/AppModule.js',
                'source/kernel/AppConnector.js',
                'source/kernel/AppUtilities.js',
                'source/kernel/AppStringUtils.js',
                'source/kernel/AppEnd.js'
            ]
        },

        // Task to concatenate multiple files into one.
        bundleFiles: {
            // General options for the concatenation process.
            bundleOptions: {
                process: true // Enable template processing in concatenated files.
            },
            // Specific target for bundling essential JavaScript files.
            essentialScriptsBundle: {
                sourceFiles: '<%= inputSources.essentialScripts %>',
                destinationFile: '<%= outputDirectory %>/<%= projectInfo.name %>.js'
            }
        },

        // Task for linting JavaScript code.
        codeQualityCheck: {
            // Configuration options for the linter.
            linterSettings: {
                jshintrc: true // Use a .jshintrc file for settings.
            },
            // Linter target for the bundled essential JavaScript.
            essentialScriptsCheck: ['<%= outputDirectory %>/<%= projectInfo.name %>.js']
        },

        // Task to minify JavaScript files.
        compressCode: {
            // Minification specific options.
            minifySettings: {
                preserveComments: 'some' // Keep some comments (e.g., license comments).
            },
            // Target for minifying the essential JavaScript bundle.
            essentialScriptsMinify: {
                sourceFiles: '<%= outputDirectory %>/<%= projectInfo.name %>.js',
                destinationFile: '<%= outputDirectory %>/<%= projectInfo.name %>.min.js'
            }
        },

        // Task for running unit tests.
        runUnitTests: {
            // Target for testing the essential JavaScript components.
            essentialScriptTests: ['tests/core/jquery-spec.html', 'tests/core/zepto-spec.html']
        },

        // Task for generating API documentation.
        generateApiDocs: {
            // Specific configuration for essential JavaScript documentation.
            essentialScriptDocs: {
                projectTitle: '<%= projectInfo.name %>',
                projectVersion: '<%= projectInfo.version %>',
                projectUrl: '<%= projectInfo.url %>',
                docGenOptions: {
                    sourcePaths: '<%= outputDirectory %>',
                    outputDirectory: '<%= outputDirectory %>/api-docs/'
                }
            }
        },

        // Task to synchronize package metadata between files.
        synchronizePackageMetadata: {
            // Target for updating bower.json from package.json.
            bowerFileUpdate: {
                sourcePath: 'package.json',
                destinationPath: 'bower.json',
                fieldsToCopy: [
                    'name',
                    'version',
                    'description',
                    'main',
                    'license'
                ]
            }
        },

        // Task to clean up build artifacts.
        cleanupBuild: {
            // Options for the cleaning operation.
            cleanupSettings: {
                force: true // Allow removal of files outside the current directory (if configured).
            },
            // Target for cleaning the output directory.
            outputFolderCleanup: {
                sourceFiles: [
                    '<%= outputDirectory %>'
                ]
            }
        }
    } );

    // Dynamically load all necessary Grunt plugins.
    buildTool.loadNpmTasks('grunt-contrib-concat');
    buildTool.loadNpmTasks('grunt-contrib-uglify');
    buildTool.loadNpmTasks('grunt-contrib-yuidoc');
    buildTool.loadNpmTasks('grunt-contrib-clean');
    buildTool.loadNpmTasks('grunt-contrib-qunit');
    buildTool.loadNpmTasks('grunt-contrib-jshint');
    buildTool.loadNpmTasks('grunt-update-json');

    // Define custom task sequences for specific workflows.
    buildTool.registerTask('sync-meta', ['synchronizePackageMetadata:bowerFileUpdate']);
    buildTool.registerTask('bundle-scripts', ['bundleFiles:essentialScriptsBundle']);
    buildTool.registerTask('check-scripts', ['codeQualityCheck:essentialScriptsCheck']);
    buildTool.registerTask('minify-scripts', ['compressCode:essentialScriptsMinify']);
    buildTool.registerTask('run-tests', ['runUnitTests:essentialScriptTests']);
    buildTool.registerTask('generate-docs', ['generateApiDocs:essentialScriptDocs']);

    // Define the default task, which runs a comprehensive build process.
    buildTool.registerTask('standard-workflow', [ // Full distribution build sequence.
        'cleanupBuild',
        'bundle-scripts',
        'check-scripts',
        'sync-meta',
        'generate-docs',
        'minify-scripts',
        'run-tests'
    ]);
};