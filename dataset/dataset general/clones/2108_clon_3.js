module.exports = function (workflowManager) {
    // This script configures the Grunt.js task runner for project build and asset management.
    // It defines various tasks for compilation, cleaning, copying, and watching files.

    // A list of Grunt plugins that are essential for this build process.
    const necessaryBuildPlugins = [
        'grunt-contrib-clean',   // Plugin for removing files and directories.
        'grunt-contrib-copy',    // Plugin for copying files and folders.
        'grunt-contrib-watch',   // Plugin for monitoring file system changes.
        'grunt-contrib-sass',    // Plugin for compiling Sass/SCSS files to CSS.
        'grunt-ts'               // Plugin for compiling TypeScript files.
    ];

    // Dynamically load each required Grunt plugin from the list.
    // This approach allows for easier management of dependencies.
    necessaryBuildPlugins.forEach(function (pluginRef) {
        workflowManager.loadNpmTasks(pluginRef);
    });

    // Define key directory paths and file patterns as constants for better maintainability.
    const sourceRootDirectory = 'source_code';            // The base directory for all raw source files.
    const outputBinaryDirectory = 'compiled_assets';      // The target directory for all compiled output.
    const styleSourceDirectory = 'design/scss';           // Location of the SCSS source files.
    const generatedStyleOutputDirectory = 'web/styles';   // Destination for compiled CSS files.
    const projectManifestFile = 'package.json';           // Path to the project's package.json.

    // Initialize the Grunt configuration object.
    // All task-specific configurations are defined within this object.
    workflowManager.initConfig({
        // Fetch project metadata from package.json for use in tasks (e.g., versioning in banners).
        projectManifest: workflowManager.file.readJSON(projectManifestFile),

        // Configuration for the cleanup task.
        artifactPurifier: {
            // Target for removing previously compiled JavaScript files and related artifacts.
            compiledJavascript: {
                src: [`${outputBinaryDirectory}/**/*.js`, `${outputBinaryDirectory}/**/*.map`, `${outputBinaryDirectory}/**/*.d.ts`]
            },
            // Target for cleaning up any old generated CSS files.
            processedStyles: {
                src: [`${generatedStyleOutputDirectory}/**/*.css`]
            }
        },

        // Configuration for the TypeScript compilation task.
        typeScriptCompiler: {
            // Primary build target for the application's TypeScript codebase.
            mainApplicationModule: {
                src: [`${sourceRootDirectory}/**/*.ts`, `!${sourceRootDirectory}/typings/**/*.d.ts`], // Include all .ts, exclude external typings.
                out: `${outputBinaryDirectory}/app.bundle.js`, // The single output JavaScript file.
                options: {
                    target: 'es2015',           // Compile to ES2015 for modern environments.
                    module: 'es6',              // Use ES6 module syntax for imports/exports.
                    sourceMap: true,            // Generate source maps for debugging.
                    declaration: true,          // Create declaration files (.d.ts) for type definitions.
                    removeComments: true,       // Strip comments from the final JavaScript output.
                    fast: 'never'               // Always perform a full compilation, even in watch mode.
                }
            }
        },

        // Configuration for the file copying task.
        assetDistributor: {
            // Sub-task to copy essential JavaScript libraries or helper files.
            jsLibraries: {
                files: [
                    {
                        expand: true,
                        flatten: true, // Place all files directly in the destination.
                        src: [`${sourceRootDirectory}/vendor/*.js`], // Source path for vendor JS files.
                        dest: '../external/libs/', // Destination outside the immediate project root.
                        filter: (filePath) => workflowManager.file.isFile(filePath) // Custom filter to ensure only files are processed.
                    }
                ]
            },
            // Sub-task to copy compiled CSS files to their final web-accessible location.
            cssResources: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [`${generatedStyleOutputDirectory}/*.css`], // Source path for compiled CSS.
                        dest: '../webroot/css/', // Destination for web-facing CSS.
                        filter: 'isFile' // Grunt's built-in file existence filter.
                    }
                ]
            }
        },

        // Configuration for the SASS/SCSS compilation task.
        sassProcessor: {
            // Main target for compiling the application's stylesheets.
            applicationStyles: {
                options: {
                    outputStyle: 'compressed', // Minify CSS output for production.
                    sourceMap: false,          // Do not generate source maps for production CSS.
                    precision: 6               // Set CSS precision for decimal numbers.
                },
                files: {
                    [`${generatedStyleOutputDirectory}/main.min.css`]: `${styleSourceDirectory}/app.scss` // Input SCSS to minified CSS.
                }
            }
        },

        // Configuration for the file watching task.
        fileChangeMonitor: {
            // Watches TypeScript source files and triggers a specific build sequence.
            typescriptSources: {
                files: [`${sourceRootDirectory}/**/*.ts`, `!${sourceRootDirectory}/typings/**/*.d.ts`],
                tasks: ['buildJsArtifacts'], // Execute this custom task on TS file changes.
                options: {
                    spawn: false // Crucial for performance with long-running tasks like TypeScript compilation.
                }
            },
            // Watches SCSS files and triggers the style processing task.
            scssSources: {
                files: [`${styleSourceDirectory}/**/*.scss`],
                tasks: ['buildCssArtifacts'], // Execute this custom task on SCSS file changes.
                options: {
                    debounceDelay: 500 // Wait 500ms for multiple changes before triggering.
                }
            }
        }
    });

    // --- Custom Task Registrations ---

    // A helper task to log a message at the beginning of the build.
    workflowManager.registerTask('preBuildLog', 'Logs a message before the main build starts.', function() {
        workflowManager.log('Initiating the comprehensive project build process...');
    });

    // A helper task to log a message at the end of the build.
    workflowManager.registerTask('postBuildLog', 'Logs a message after the main build completes.', function() {
        workflowManager.log('Project build process successfully finalized!');
    });

    // Custom task to handle all JavaScript-related compilation and distribution.
    workflowManager.registerTask('buildJsArtifacts', [
        'artifactPurifier:compiledJavascript',     // Clean old JS outputs.
        'typeScriptCompiler:mainApplicationModule',// Compile TypeScript.
        'assetDistributor:jsLibraries'             // Copy any necessary JS libraries.
    ]);

    // Custom task to handle all CSS-related compilation and distribution.
    workflowManager.registerTask('buildCssArtifacts', [
        'artifactPurifier:processedStyles',       // Clean old CSS outputs.
        'sassProcessor:applicationStyles',        // Compile SCSS to CSS.
        'assetDistributor:cssResources'           // Copy compiled CSS to final destination.
    ]);

    // The main build task, encapsulating all necessary steps for a complete project build.
    workflowManager.registerTask('fullProjectBuild', [
        'preBuildLog',          // Log start.
        'buildJsArtifacts',     // Process all JavaScript.
        'buildCssArtifacts',    // Process all CSS.
        'postBuildLog'          // Log end.
    ]);

    // Define the 'default' task to run the 'fullProjectBuild' for convenience.
    workflowManager.registerTask('default', ['fullProjectBuild']);

    // A placeholder task for potential future validation steps, not part of the default build.
    workflowManager.registerTask('performIntegrityChecks', 'Runs a series of integrity checks (currently a dummy task).', function() {
        workflowManager.log('No integrity checks configured yet. This task is a placeholder.');
    });
};