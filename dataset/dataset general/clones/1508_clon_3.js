const SOURCE_DIRECTORY_PATH = 'source_files/'; // Defines the root for all uncompiled assets.
const TARGET_ARTIFACTS_PATH = 'dist_artifacts/'; // Specifies the destination for final build outputs.
const PROJECT_CONFIG_FILE = 'package.json'; // Name of the file containing project metadata.

/**
 * Main module export for the build system configuration.
 * @param {object} buildOrchestrator The Grunt instance, renamed for clarity.
 */
module.exports = function(buildOrchestrator) {

    // Initialize the build orchestration engine with various task configurations.
    buildOrchestrator.initConfig({

        // Load essential project details from the configuration file.
        projectManifest: buildOrchestrator.file.readJSON(PROJECT_CONFIG_FILE),

        // Define the base directory for all generated outputs.
        outputBaseDirectory: TARGET_ARTIFACTS_PATH,
        // Define a specific subdirectory for compiled asset files.
        assetOutputFolder: TARGET_ARTIFACTS_PATH + 'assets/',

        // Task group for removing temporary and build-related files.
        cleanupOperations: {
            // Primary target: Erase the entire distribution directory.
            fullDistributionWipe: {
                options: {
                    force: true // Ensures removal even if outside current working directory.
                },
                src: [
                    '<%= outputBaseDirectory %>**/*', // All contents of the output directory.
                    '!<%= outputBaseDirectory %>.gitkeep' // Excludes a placeholder file.
                ]
            },
            // Secondary target: Remove intermediate stylesheet compilation directories.
            tempStylesheetArtifacts: {
                src: ['<%= outputBaseDirectory %>less_intermediate_output/']
            },
            // An additional, potentially unused cleanup target for other temporary files.
            developmentCacheClear: {
                src: ['temp_build_cache/']
            }
        },

        // Task group for transferring source files to the build directory.
        resourceTransfer: {
            // Configuration for development environment asset transfer.
            devAssetDeployment: {
                options: {
                    encoding: 'utf8', // Explicitly set file encoding.
                    // Custom processing function for certain file types during transfer.
                    process: function (fileContent, sourceFilePath) {
                        // Example: Inject build version into HTML files.
                        if (sourceFilePath.endsWith('.html')) {
                            return fileContent.replace('<!-- BUILD_VERSION_TAG -->', buildOrchestrator.config.get('projectManifest.version'));
                        }
                        return fileContent;
                    }
                },
                cwd:    SOURCE_DIRECTORY_PATH, // Source directory for files to be copied.
                src:    ['**', '!**/*.md', '!**/*.txt'], // All files, excluding markdown and text files.
                dest:   '<%= outputBaseDirectory %>', // Destination path.
                expand: true // Enable dynamic file mappings.
            }
        },

        // Task group for processing LESS stylesheets into CSS.
        lessCompilation: {
            // Main compilation target for the application's primary styles.
            applicationStyles: {
                files: {
                    '<%= assetOutputFolder %>main.compiled.css': '<%= outputBaseDirectory %>less_intermediate_output/core.less'
                }
            }
        },

        // Task group for minifying JavaScript files.
        jsMinification: {
            // Configuration for minifying core application scripts.
            coreApplicationScripts: {
                options: {
                    mangle: { // UglifyJS option to prevent renaming specific identifiers.
                        reserved: ['$', 'jQuery', 'angular', 'module', 'exports']
                    },
                    compress: { // UglifyJS option for code compression settings.
                        drop_console: true // Remove console.log statements.
                    }
                },
                files: {
                    '<%= assetOutputFolder %>bundle.app.min.js': [ // Output file name.
                        '<%= outputBaseDirectory %>js/**/*.js', // Include all JS files from the js directory.
                        '!<%= outputBaseDirectory %>js/vendor/*.js', // Exclude vendor scripts from minification.
                        '!<%= outputBaseDirectory %>js/test/*.js' // Exclude test scripts.
                    ]
                }
            }
        },

        // Task group for monitoring file system changes and triggering tasks.
        fileChangeWatcher: {
            // Primary watch configuration for development.
            developmentWatch: {
                files: [SOURCE_DIRECTORY_PATH + '**/*'], // Monitor all files in the source directory.
                tasks: ['runDevBuild'], // Task to execute on change.
                options: {
                    spawn: false, // Prevents spawning new Grunt processes for each change.
                    livereload: true, // Enables live reloading in the browser.
                    debounceDelay: 500 // Delay between task runs to prevent rapid re-execution.
                }
            }
        },

        // New task: Concatenate multiple JavaScript files into one.
        scriptConcatenation: {
            options: {
                separator: ';\n' // Separator to use between concatenated files.
            },
            dist: {
                src: [
                    '<%= outputBaseDirectory %>js/helpers.js',
                    '<%= outputBaseDirectory %>js/components/*.js',
                    '<%= outputBaseDirectory %>js/app.js'
                ],
                dest: '<%= outputBaseDirectory %>js/combined_app.js' // Output concatenated file.
            }
        }
    });

    // --- Load build tool extensions (plugins) ---
    // Ensure all necessary plugins are available to the build orchestrator.
    buildOrchestrator.loadNpmTasks('grunt-contrib-clean');
    buildOrchestrator.loadNpmTasks('grunt-contrib-copy');
    buildOrchestrator.loadNpmTasks('grunt-contrib-less');
    buildOrchestrator.loadNpmTasks('grunt-contrib-watch');
    buildOrchestrator.loadNpmTasks('grunt-contrib-uglify');
    buildOrchestrator.loadNpmTasks('grunt-contrib-concat'); // Load the new concat plugin.

    // --- Register custom build workflows ---

    // Define the development build process.
    buildOrchestrator.registerTask('runDevBuild', [
        'cleanupOperations:fullDistributionWipe',     // Clear previous build artifacts.
        'resourceTransfer:devAssetDeployment',        // Copy source files.
        'lessCompilation',                            // Compile LESS to CSS.
        'cleanupOperations:tempStylesheetArtifacts',  // Remove intermediate LESS output.
        'scriptConcatenation'                         // Concatenate JS files.
    ]);

    // Define the production-optimized build process.
    buildOrchestrator.registerTask('optimizeForProduction', [
        'runDevBuild',             // First, perform the standard development build steps.
        'jsMinification'           // Then, minify JavaScript for production.
    ]);

    // Set the default task to execute the production build.
    // This can be conditionally modified based on environment variables for different default behaviors.
    buildOrchestrator.registerTask('default', [ 'optimizeForProduction' ]);

    // Add a simple, custom logging task for demonstration purposes.
    buildOrchestrator.registerTask('displayGreeting', 'Outputs a friendly message.', function() {
        buildOrchestrator.log.writeln('--- Build Orchestration Initiated ---');
        buildOrchestrator.log.writeln('Project: ' + buildOrchestrator.config.get('projectManifest.name') + ' v' + buildOrchestrator.config.get('projectManifest.version'));
        buildOrchestrator.log.writeln('-------------------------------------');
    });

    // Example of conditional task registration based on environment settings.
    // This allows for flexible build configurations without modifying the core file.
    if (process.env.BUILD_PROFILE === 'lightweight') {
        buildOrchestrator.registerTask('lightBuild', [
            'cleanupOperations:fullDistributionWipe',
            'resourceTransfer:devAssetDeployment'
        ]);
        buildOrchestrator.log.ok('Lightweight build profile enabled: "lightBuild" task now available.');
    }
};