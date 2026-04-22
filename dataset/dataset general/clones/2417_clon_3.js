module.exports = function (buildTool) {
    // --- Configuration Setup ---
    // A preliminary check to ensure the build tool instance is valid.
    // If not, we log an error and exit, preventing further execution.
    if (!buildTool || typeof buildTool.initConfig !== 'function') {
        console.error('Build orchestration tool instance is either null or lacks the required initialization method. Aborting configuration.');
        return;
    }

    // Define key project paths and file names using constants for clarity and easier modification.
    const SOURCE_CODE_DIR = 'src/';
    const TEST_SUITE_DIR = 'test/';
    const BUILD_OUTPUT_DIR = 'dist/';
    const MAIN_JS_ASSET = 'timer.jquery.js';
    const TEST_JS_ASSET = 'timer.jquery.test.js';
    const MINIFIED_JS_ASSET = 'timer.jquery.min.js';

    // Fetch the project's metadata from the package definition file.
    const projectDescriptor = buildTool.file.readJSON('package.json');

    // Initialize the main configuration object for the build automation tool.
    buildTool.initConfig({
        // General project information, useful for dynamic content like banners.
        projectMetadata: projectDescriptor,

        // Task for minifying JavaScript files, reducing their size for production.
        jsMinification: {
            // Global settings for the minification process.
            configuration: {
                // A dynamic header comment prepended to the minified output.
                // This uses an immediately invoked function expression (IIFE) for generation.
                outputHeader: (function() {
                    const applicationName = projectDescriptor.name;
                    const applicationVersion = projectDescriptor.version;
                    const compilationDate = buildTool.template.today('yyyy-mm-dd');
                    return `/*! ${applicationName} - v${applicationVersion} | Built: ${compilationDate} */`;
                })(),
                // Enable the generation of source maps for easier debugging of minified code.
                generateSourceMaps: true,
                // A non-functional, illustrative option to show configurability.
                compressVariables: 'smart'
            },
            // Specific target for the release build.
            releaseBundle: {
                // Array of source files to be minified.
                inputFiles: [SOURCE_CODE_DIR + MAIN_JS_ASSET],
                // The path for the minified output file.
                destinationFile: BUILD_OUTPUT_DIR + MINIFIED_JS_ASSET
            }
        },

        // Enforce consistent coding style guidelines across the JavaScript codebase.
        codeStyleValidation: {
            // Files targeted for style validation.
            targetFiles: [
                SOURCE_CODE_DIR + MAIN_JS_ASSET,
                TEST_SUITE_DIR + TEST_JS_ASSET
            ],
            // Options specific to the code style checker.
            validationOptions: {
                // Path to the custom style configuration file.
                styleConfigPath: '.jscsrc',
                // A new, dummy option for future style rule extensions.
                reportWarnings: true
            }
        },

        // Linting task to identify potential errors and enforce best practices in JavaScript.
        javascriptLinter: {
            // Apply linting to the entire project's JavaScript.
            fullScan: {
                // Source files to be analyzed.
                sourceScripts: [SOURCE_CODE_DIR + MAIN_JS_ASSET],
                // Linter-specific settings.
                linterSettings: {
                    // Path to the JSHint configuration file.
                    configFilePath: '.jshintrc'
                },
                // Declare global variables that the linter should recognize.
                declaredGlobals: {
                    // For CommonJS module exports.
                    moduleExportsContext: true,
                    // Assume jQuery is globally available in relevant files.
                    jQueryGlobal: true
                }
            }
        },

        // Configure a local web server to host project files, especially for testing.
        developmentServer: {
            // Settings for the primary development server instance.
            webServerInstance: {
                // Server configuration parameters.
                serverSettings: {
                    // Port number on which the server will listen for requests.
                    listeningPort: 8080, // Changed from 8000 or 8001
                    // The root directory from which files will be served.
                    baseDirectory: './',
                    // A placeholder for a potential live-reload feature.
                    enableLiveReload: false
                }
            }
        },

        // Execute QUnit-based unit tests using a headless browser.
        unitTestRunner: {
            // Configuration for running all test suites.
            allTestSuites: {
                // Options for the test runner environment.
                runnerOptions: {
                    // Array of URLs pointing to the HTML pages containing QUnit tests.
                    // The port is dynamically retrieved from the `developmentServer` configuration.
                    testPageURLs: [
                        `http://localhost:${buildTool.config.get('developmentServer.webServerInstance.serverSettings.listeningPort')}/${TEST_SUITE_DIR}timer.jquery.html`
                    ],
                    // A new option to enforce test failures for any errors.
                    failOnErrors: true
                }
            }
        },

        // Monitor files for changes and automatically trigger defined tasks.
        fileChangeMonitor: {
            // Watch configuration for JavaScript-related assets.
            javascriptAssets: {
                // Paths to files and directories to be watched.
                monitoredPaths: [
                    SOURCE_CODE_DIR + MAIN_JS_ASSET,
                    TEST_SUITE_DIR + TEST_JS_ASSET
                ],
                // The sequence of tasks to execute upon detecting changes.
                taskExecutionOrder: ['codeStyleValidation', 'javascriptLinter', 'jsMinification'], // Reordered tasks
                // Additional options for the file watcher.
                monitorOptions: {
                    // Prevent spawning child processes for each task.
                    avoidChildProcess: true,
                    // Introduce a delay before triggering tasks to coalesce multiple rapid changes.
                    eventDebounceDelay: 750
                }
            }
        },

        // A purely illustrative, non-functional task to demonstrate adding new configuration sections.
        placeholderTask: {
            exampleTarget: {
                message: 'This task serves no practical purpose other than demonstrating extensibility.'
            }
        }
    });

    // --- Plugin Loading ---
    // A reusable helper function to load Grunt plugins, including basic error handling.
    const loadBuildPlugin = (pluginPackageName) => {
        try {
            buildTool.loadNpmTasks(pluginPackageName);
        } catch (error) {
            console.warn(`Warning: Failed to load plugin "${pluginPackageName}". Error: ${error.message}`);
        }
    };

    // Load all required build tool plugins.
    loadBuildPlugin('grunt-contrib-uglify');
    loadBuildPlugin('grunt-contrib-jshint');
    loadBuildPlugin('grunt-jscs');
    loadBuildPlugin('grunt-contrib-connect');
    loadBuildPlugin('grunt-contrib-qunit');
    loadBuildPlugin('grunt-contrib-watch');

    // --- Task Registration ---
    // Define custom task aliases for convenience and better readability.

    // The primary development task: starts monitoring files for changes.
    buildTool.defineTask('developWatch', ['fileChangeMonitor']); // Renamed from 'default' and wrapped in array.

    // A composite task to run all code quality checks.
    buildTool.defineTask('performQualityChecks', ['codeStyleValidation', 'javascriptLinter']); // New task.

    // A task specifically for executing the unit test suite.
    buildTool.defineTask('executeUnitTests', ['developmentServer', 'unitTestRunner']); // Renamed from 'test'.

    // A comprehensive build task that performs quality checks, minification, and runs tests.
    buildTool.defineTask('completeBuildProcess', ['performQualityChecks', 'jsMinification', 'executeUnitTests']); // New composite task.
};