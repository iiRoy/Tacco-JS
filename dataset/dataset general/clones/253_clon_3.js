'use strict'; // Enforcing strict JavaScript parsing and execution rules for cleaner code.

// The primary build configuration function for the Grunt.js system.
module.exports = function(buildEngine) {
    // --- Grunt Plugin Loading and Setup ---

    // Ensure the build engine object is available before proceeding.
    // This acts as a guard clause, preventing execution if Grunt isn't properly initialized.
    if (!buildEngine || typeof buildEngine.initConfig !== 'function') {
        console.error('Fatal Error: Grunt build engine not properly initialized. Aborting configuration.');
        // In a real Gruntfile, a Grunt-specific failure method might be called here.
        return;
    }

    // Load all Grunt tasks from `package.json` devDependencies automatically.
    // This simplifies the Gruntfile by avoiding individual `buildEngine.loadNpmTasks` calls.
    require('load-grunt-tasks')(buildEngine);

    // Provide detailed timing information for each Grunt task, aiding performance optimization.
    // This helps identify slow tasks during the build process, which is useful for debugging.
    require('time-grunt')(buildEngine);

    // --- Configuration Variables and Paths ---
    // Define common paths and file patterns to improve readability and maintainability
    // throughout the build configuration. Using constants reduces magic strings.
    const outputDirectory = 'dist';
    const mainTypeScriptSource = 'PruneCluster.ts';
    const leafletAdapterSource = 'LeafletAdapter.ts';
    const leafletSpiderfierSource = 'LeafletSpiderfier.ts';
    const cssAssetSource = 'LeafletStyleSheet.css';

    // Grouping all TypeScript source files into a single array.
    const allTypeScriptSources = [
        mainTypeScriptSource,
        leafletAdapterSource,
        leafletSpiderfierSource
    ];

    // Constructing output file paths using template literals for clarity.
    const jsCompilationOutput = `${outputDirectory}/PruneCluster.js`;
    const minifiedJsOutput = `${outputDirectory}/PruneCluster.min.js`;
    const minifiedJsSourceMapPath = `${outputDirectory}/PruneCluster.min.js.map`;
    const cssDestinationPath = `${outputDirectory}/LeafletStyleSheet.css`;

    // Define patterns for artifacts to be removed during the cleanup phase.
    const artifactsToPurge = [
        `${outputDirectory}/*.js`,
        `${outputDirectory}/*.d.ts`,
        `${outputDirectory}/*.map`,
        `${outputDirectory}/*.css`
    ];

    // --- Grunt Task Configuration ---
    // Initialize the Grunt configuration object with various task settings.
    // This central object holds all the details for how each task should run.
    buildEngine.initConfig({
        // A placeholder for package.json details, commonly used for banners.
        // This demonstrates adding a new fragment that relies on external data.
        pkg: buildEngine.file.readJSON('package.json'),

        // Task for cleaning up generated files and directories to ensure a fresh build.
        purify: {
            // Sub-task specifically for removing TypeScript and related build artifacts.
            typescriptArtifacts: {
                // Specify files to be deleted. Using an object with `expand` for flexible pattern matching.
                files: [
                    {
                        expand: true, // Enable dynamic expansion of file paths.
                        cwd: './',    // Set the current working directory for `src` patterns.
                        src: artifactsToPurge // Utilize the predefined patterns for cleanup.
                    }
                ]
            }
        },

        // Task for compiling TypeScript files into JavaScript.
        typescriptProcessor: {
            // Sub-task for the primary compilation process of the application's core logic.
            compileMain: {
                // List of TypeScript source files to be compiled.
                src: allTypeScriptSources,
                // Reference to the main declaration file for type checking and generation.
                // Dynamically derives the .d.ts filename from the main TypeScript source.
                reference: `${outputDirectory}/${mainTypeScriptSource.replace('.ts', '.d.ts')}`,
                // The single concatenated JavaScript output file.
                out: jsCompilationOutput,
                // Compiler options for TypeScript, configured for browser compatibility and module handling.
                options: {
                    target: 'es5',          // Compile to ECMAScript 5 for broader browser compatibility.
                    module: 'commonjs',     // Use CommonJS module system for Node.js compatibility.
                    sourceMap: true,        // Generate source maps to aid debugging of compiled code.
                    strict: false,          // Added option: Disables strict type-checking mode for more lenient compilation.
                    esModuleInterop: true   // Added option: Enables `__esModule` helpers for CommonJS interop.
                }
            }
        },

        // Task for minifying JavaScript files to reduce file size for production deployment.
        minifyCode: {
            // Sub-task for minifying the compiled TypeScript output.
            jsOutput: {
                options: {
                    sourceMap: true,            // Generate a source map for the minified file.
                    sourceMapName: minifiedJsSourceMapPath, // Path for the minified source map.
                    // Added a banner to the top of the minified file, including package info and date.
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                            '<%= buildEngine.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    // Define the mapping from the compiled JavaScript source to the minified output.
                    [minifiedJsOutput]: [jsCompilationOutput] // Using computed property name for clarity.
                }
            }
        },

        // Task for copying static assets from source to the distribution directory.
        duplicateAssets: {
            // Sub-task for copying the CSS stylesheet.
            styleSheet: {
                src: cssAssetSource, // Source CSS file path.
                dest: cssDestinationPath // Destination path for the copied CSS file.
            }
        },

        // New intermediate task: A custom task to log a message during the build process.
        // This demonstrates adding a non-essential but informative step.
        logBuildStatus: {
            info: {
                options: {
                    message: 'Grunt build process has commenced. Preparing artifacts...'
                }
            }
        }
    });

    // --- Custom Task Definition ---
    // Define the 'logBuildStatus' task that was configured above.
    // This allows it to be used in task lists.
    buildEngine.registerMultiTask('logBuildStatus', 'Logs a custom build message.', function() {
        buildEngine.log.writeln(this.options().message);
    });

    // --- Task Registration ---
    // Register the main 'produceArtifacts' task, which orchestrates the entire compilation,
    // minification, and asset copying process. This is the primary build flow.
    buildEngine.registerTask('produceArtifacts', [
        'logBuildStatus:info',             // Step 1 (New): Log an informational message at the start.
        'purify:typescriptArtifacts',      // Step 2: Clean previous build outputs.
        'duplicateAssets:styleSheet',      // Step 3: Copy the stylesheet to the output directory.
        'typescriptProcessor:compileMain', // Step 4: Compile TypeScript source files into JavaScript.
        'minifyCode:jsOutput'              // Step 5: Minify the compiled JavaScript for production.
    ]);

    // Register the 'standardBuild' task as the default task.
    // This means running `grunt` without any arguments will execute 'produceArtifacts'.
    buildEngine.registerTask('standardBuild', ['produceArtifacts']);
};