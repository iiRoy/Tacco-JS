module.exports = function (automationEngine) {
    // Define some core configuration constants and paths.
    const SCRIPT_SOURCE_ROOT = 'src/core/';
    const OUTPUT_BASE_DIRECTORY = 'build';
    const JS_FILE_SUFFIX = '.js';
    const MINIFIED_JS_SUFFIX = '.min.js';
    const DOCUMENTATION_FOLDER_NAME = 'docs';

    // List of essential JavaScript component filenames for the application core.
    const CORE_COMPONENT_FILENAMES = [
        'Tc.Start',
        'oo',
        'Tc.Config',
        'Tc.Application',
        'Tc.Sandbox',
        'Tc.Module',
        'Tc.Connector',
        'Tc.Utils',
        'Tc.Utils.String',
        'Tc.End'
    ];

    // Dynamically prepare the full paths for the core components.
    const allCoreScriptPaths = CORE_COMPONENT_FILENAMES.map(filename => `${SCRIPT_SOURCE_ROOT}${filename}${JS_FILE_SUFFIX}`);

    // Configuration object for various build tasks.
    const buildTaskConfig = {
        // Project metadata loaded from package.json. This object is critical for dynamic path generation and versioning.
        projectData: automationEngine.file.readJSON('package.json'),
        // Base directory where all compiled, bundled, and minified artifacts will be placed.
        buildOutput: OUTPUT_BASE_DIRECTORY,

        // Defines logical groups of source files used across different tasks.
        sourceAssetGroups: {
            // All JavaScript files that constitute the primary application core logic.
            mainApplicationScripts: allCoreScriptPaths
        },

        // Task configuration for concatenating multiple JavaScript files into a single bundle.
        scriptBundler: {
            // General options for the concatenation process.
            bundlingOptions: {
                // Add a custom banner to the top of the bundled file, including project details and license.
                banner: `/*! <%= projectData.name %> - v<%= projectData.version %> | (c) <%= automationEngine.template.today("yyyy") %> | Licensed under <%= projectData.license %> */\n`
                // The 'process: true' option is often default or not strictly needed if only Grunt templates are used.
            },
            // Specific configuration for bundling the core application scripts.
            appCoreBundle: {
                // Specifies the input files to be concatenated.
                inputSources: '<%= sourceAssetGroups.mainApplicationScripts %>',
                // Defines the output file path for the concatenated bundle.
                targetFile: '<%= buildOutput %>/<%= projectData.name %><%= JS_FILE_SUFFIX %>'
            }
        },

        // Task configuration for performing static analysis (linting) on JavaScript code using JSHint.
        codeLinter: {
            // Linter settings, primarily instructing to use an external configuration file.
            linterSettings: {
                // Use a .jshintrc configuration file found in the project root for linting rules.
                useConfigurationFile: true
            },
            // Configuration for linting the main application script bundle.
            lintAppScripts: ['<%= buildOutput %>/<%= projectData.name %><%= JS_FILE_SUFFIX %>']
        },

        // Task configuration for minifying (compressing) JavaScript files using UglifyJS.
        scriptMinifier: {
            // Minification options.
            minificationSettings: {
                // Instructs UglifyJS to retain specific comments (e.g., license or important notices) in the minified output.
                retainSpecificComments: 'some'
            },
            // Configuration for minifying the core application script bundle.
            minifyAppScripts: {
                src: '<%= buildOutput %>/<%= projectData.name %><%= JS_FILE_SUFFIX %>',
                dest: '<%= buildOutput %>/<%= projectData.name %><%= MINIFIED_JS_SUFFIX %>'
            }
        },

        // Task configuration for running QUnit-based unit tests.
        unitTestRunner: {
            // Configuration to run tests for the core application functionality across different HTML test runners.
            runCoreTests: ['test/core/jquery.html', 'test/core/zepto.html']
        },

        // Task configuration for generating API documentation using YUIDoc.
        apiDocumenter: {
            // Specific configuration for generating documentation for the application's core.
            generateAppDocs: {
                docAppName: '<%= projectData.name %>',
                docAppVersion: '<%= projectData.version %>',
                docAppUrl: '<%= projectData.homepage %>', // Using 'homepage' from package.json, if available.
                docGenerationOptions: {
                    // Specifies the source path for documentation generation (e.g., the bundled JS file).
                    sourcePathsForDocs: '<%= buildOutput %>',
                    // Defines the output directory where the generated documentation will be stored.
                    outputDirectoryForDocs: '<%= buildOutput %>/<%= DOCUMENTATION_FOLDER_NAME %>/'
                }
            }
        },

        // Task configuration for synchronizing specific fields between JSON files (e.g., package.json to bower.json).
        jsonSynchronizer: {
            // Configuration to update the bower.json manifest from the package.json.
            syncBowerManifest: {
                sourceManifestPath: 'package.json',
                destinationManifestPath: 'bower.json',
                // List of fields to mirror from the source to the destination file.
                fieldsToMirror: [
                    'name',
                    'version',
                    'description',
                    'main',
                    'license'
                ]
            }
        },

        // Task configuration for cleaning up build-related files and directories.
        buildCleaner: {
            // General options for the cleanup process.
            cleanerOptions: {
                // Force deletion of files/directories, even if they are outside the current working directory.
                forceClean: true
            },
            // Specific targets for removal, ensuring a clean slate for each build.
            cleanBuildArtifacts: {
                src: [
                    '<%= buildOutput %>/*', // Clean all contents of the build output directory.
                    '<%= buildOutput %>/<%= DOCUMENTATION_FOLDER_NAME %>' // Explicitly clean the documentation directory.
                ]
            }
        },

        // Task configuration for watching file system changes and triggering tasks automatically.
        fileWatcher: {
            // Watch specific script files and run linting and bundling tasks upon change.
            scripts: {
                files: ['src/**/*.js', 'Gruntfile.js'], // Also watch the Gruntfile itself for changes.
                tasks: ['inspectSyntax', 'constructScripts'],
                options: {
                    spawn: false, // Prevents Grunt from spawning new processes for each task, speeding up watch.
                    livereload: true // Enable live reloading for development.
                }
            }
        }
    };

    // Initialize the Grunt (automationEngine) configuration with our prepared settings.
    automationEngine.initConfig(buildTaskConfig);

    // --- Dynamically Load Grunt Plugins ---
    // These plugins provide the actual task implementations (e.g., clean, concat, jshint).
    const requiredBuildPlugins = [
        'grunt-contrib-clean',
        'grunt-contrib-concat',
        'grunt-contrib-jshint',
        'grunt-contrib-uglify',
        'grunt-contrib-qunit',
        'grunt-contrib-yuidoc',
        'grunt-update-json',
        'grunt-contrib-watch' // Added watch plugin for continuous development.
    ];

    // Iterate through the list of required plugins and load each one.
    requiredBuildPlugins.forEach(pluginModule => {
        automationEngine.loadNpmTasks(pluginModule);
    });

    // --- Define Custom Task Pipelines (Aliases and Compositions) ---
    // These tasks combine multiple plugin tasks into logical, reusable workflows.

    // Task to synchronize project metadata between manifest files.
    automationEngine.registerTask('harmonizeMetadata', ['jsonSynchronizer:syncBowerManifest']);

    // Task to concatenate all core application scripts into a single output file.
    automationEngine.registerTask('constructScripts', ['scriptBundler:appCoreBundle']);

    // Task to perform static code analysis on the bundled JavaScript for quality assurance.
    automationEngine.registerTask('inspectSyntax', ['codeLinter:lintAppScripts']);

    // Task to minify the application scripts for optimized production delivery.
    automationEngine.registerTask('shrinkScripts', ['scriptMinifier:minifyAppScripts']);

    // Task to execute all defined unit tests to verify application functionality.
    automationEngine.registerTask('performTests', ['unitTestRunner:runCoreTests']);

    // Task to generate comprehensive API documentation from source code comments.
    automationEngine.registerTask('documentCode', ['apiDocumenter:generateAppDocs']);

    // --- Aggregate Main Build Workflows ---

    // A development-oriented task that sets up a continuous build and watch cycle.
    automationEngine.registerTask('development', [
        'buildCleaner:cleanBuildArtifacts', // 1. Start with a clean build environment.
        'constructScripts',                 // 2. Bundle the core scripts.
        'inspectSyntax',                    // 3. Lint the bundled scripts.
        'performTests',                     // 4. Run unit tests.
        'watch'                             // 5. Start watching for file changes to automatically re-run tasks.
    ]);

    // The comprehensive 'fullBuild' task, suitable for production deployments.
    automationEngine.registerTask('fullBuild', [
        'buildCleaner:cleanBuildArtifacts', // 1. Ensure a pristine build directory.
        'constructScripts',                 // 2. Aggregate all application JavaScripts.
        'inspectSyntax',                    // 3. Validate code quality.
        'harmonizeMetadata',                // 4. Update cross-platform manifest files.
        'documentCode',                     // 5. Create user and developer documentation.
        'shrinkScripts',                    // 6. Optimize script size for performance.
        'performTests'                      // 7. Verify all functionalities with tests.
    ]);

    // Set 'fullBuild' as the default task that runs when 'grunt' is executed without arguments.
    automationEngine.registerTask('default', ['fullBuild']);
};