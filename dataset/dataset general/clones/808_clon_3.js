'use strict';

// Internal utility for live reload injection, sourced from grunt-contrib-livereload.
// This snippet is crucial for enabling automatic browser refreshes during development.
const liveReloadInjector = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

// Node.js path utility for resolving absolute paths, ensuring cross-platform compatibility.
const _pathUtility = require('path');

/**
 * A factory function to generate Connect static file serving middleware.
 * It resolves directory paths to ensure correct serving from the file system.
 *
 * @param {object} connectServer The Connect server instance (e.g., from `grunt-contrib-connect`).
 * @param {string} directoryPath The path to the directory to be served statically.
 * @returns {Function} A Connect middleware function for serving static files.
 */
const serveStaticAssets = function (connectServer, directoryPath) {
    return connectServer.static(_pathUtility.resolve(directoryPath));
};

// Main Gruntfile export function. This is where the build system is configured.
// The 'builderEngine' parameter is the Grunt API object.
module.exports = function (builderEngine) {
    // Dynamically load all Grunt tasks from devDependencies that start with 'grunt-'.
    // This streamlines the Gruntfile by eliminating individual `builderEngine.loadNpmTasks` calls.
    require('matchdep').filterDev('grunt-*').forEach(builderEngine.loadNpmTasks);

    // --- Core Project Path Configuration ---
    // These paths define the fundamental structure of the application source and build output.
    let projectStructure = {
        sourceApp: 'app',  // Default source directory for application files.
        outputTarget: 'dist' // Default output directory for production builds.
    };

    // Attempt to override the application source path from a project-specific configuration file.
    // This allows for flexible project setups where the 'app' directory might be named differently.
    try {
        const projectConfig = require('./component.json');
        // If 'appPath' is defined in 'component.json', use it to customize the source directory.
        if (projectConfig && projectConfig.appPath) {
            projectStructure.sourceApp = projectConfig.appPath;
        }
    } catch (configError) {
        // If 'component.json' is not found or malformed, the default 'app' path will be used.
        // No specific error handling is required here as it's an optional override,
        // and the application can proceed with its default configuration.
        // For detailed debugging: builderEngine.log.debug('Failed to load/parse component.json, using default app path: ' + configError.message);
    }

    // Define common constants for file patterns and directories to improve readability and maintainability.
    const SCRIPT_PATTERN = '{,*/}*.js';
    const STYLE_PATTERN = '{,*/}*.css';
    const TEMPLATE_PATTERN = '{,*/}*.html';
    const IMAGE_PATTERN = '{,*/}*.{png,jpg,jpeg,gif,webp,svg}';
    const SASS_PATTERN = '{,*/}*.{scss,sass}';
    const COFFEE_PATTERN = '{,*/}*.coffee';
    const TEST_SPEC_DIR = 'test/spec';

    // --- Grunt Build System Configuration ---
    // The primary configuration object for all Grunt tasks, structured by responsibility.
    builderEngine.initConfig({
        // Expose project structure paths to Grunt tasks for easy referencing and templating.
        project: projectStructure,

        // Task for monitoring file changes and triggering automated actions like compilation or live reload.
        fileMonitor: {
            // Watch for changes in CoffeeScript files within the application and trigger compilation.
            scriptCoffee: {
                files: [`<%= project.sourceApp %>/scripts/${COFFEE_PATTERN}`],
                tasks: ['coffeeCompiler:compileApp']
            },
            // Watch for changes in CoffeeScript files dedicated to testing and compile them.
            testCoffee: {
                files: [`${TEST_SPEC_DIR}/${COFFEE_PATTERN}`],
                tasks: ['coffeeCompiler:compileTests']
            },
            // Monitor Sass/SCSS files for changes and recompile them into CSS.
            styleSass: {
                files: [`<%= project.sourceApp %>/styles/${SASS_PATTERN}`],
                tasks: ['sassCompiler']
            },
            // Trigger a live browser reload when relevant development files are modified.
            liveSync: {
                options: {
                    livereload: true // Activate the live reload server component.
                },
                files: [
                    `<%= project.sourceApp %>/${TEMPLATE_PATTERN}`,
                    `{.tmp,<%= project.sourceApp %>}/styles/${STYLE_PATTERN}`,
                    `{.tmp,<%= project.sourceApp %>}/scripts/${SCRIPT_PATTERN}`,
                    `<%= project.sourceApp %>/images/${IMAGE_PATTERN}`
                ]
            }
        },

        // Task for setting up a local web server for development and testing environments.
        httpService: {
            // General settings for the HTTP server.
            config: {
                servicePort: 9000,
                // Set 'hostAddress' to '0.0.0.0' to enable access from external devices on the network.
                hostAddress: 'localhost'
            },
            // Development server tailored with live reload capabilities.
            devServer: {
                options: {
                    // Custom middleware to serve livereload snippet and project files.
                    requestHandlers: function (connect) {
                        return [
                            liveReloadInjector, // Injects the live reload script into served HTML.
                            serveStaticAssets(connect, '.tmp'), // Serves temporary build assets (e.g., compiled scripts/styles).
                            serveStaticAssets(connect, projectStructure.sourceApp) // Serves application source files directly.
                        ];
                    }
                }
            },
            // Dedicated server for running unit tests, serving test-specific assets.
            testServer: {
                options: {
                    requestHandlers: function (connect) {
                        return [
                            serveStaticAssets(connect, '.tmp'), // Serves compiled test assets.
                            serveStaticAssets(connect, 'test') // Serves the actual test files.
                        ];
                    }
                }
            }
        },

        // Task to automatically launch the development server in the default web browser.
        browserLauncher: {
            defaultBrowser: {
                url: `http://localhost:<%= httpService.config.servicePort %>`
            }
        },

        // Task for cleaning temporary build artifacts and the distribution directory.
        fileCleaner: {
            // Clean the distribution build output, carefully excluding version control files.
            productionBuild: {
                files: [{
                    dot: true, // Ensures files starting with a dot are included in the cleaning process.
                    src: [
                        '.tmp',
                        '<%= project.outputTarget %>/*',
                        `!<%= project.outputTarget %>/.git*` // Explicitly exclude Git-related files.
                    ]
                }]
            },
            // Clean up temporary files generated during the development process.
            tempFiles: '.tmp'
        },

        // Task for linting JavaScript code to enforce style guidelines and identify potential errors.
        jsLinter: {
            settings: {
                jshintrc: '.jshintrc' // Path to the JSHint configuration file.
            },
            // Apply linting to the Gruntfile itself and all application JavaScript files.
            allFiles: [
                'Gruntfile.js',
                `<%= project.sourceApp %>/scripts/${SCRIPT_PATTERN}`
            ]
        },

        // Task for running unit tests using the Karma test runner.
        testRunner: {
            unitTests: {
                configFile: 'karma.conf.js', // Path to the Karma configuration file.
                singleRun: true // Configure Karma to run tests once and then exit.
            }
        },

        // Task for compiling CoffeeScript files into standard JavaScript.
        coffeeCompiler: {
            // Compile application CoffeeScript files for development and intermediate builds.
            compileApp: {
                files: [{
                    expand: true,
                    cwd: '<%= project.sourceApp %>/scripts',
                    src: COFFEE_PATTERN,
                    dest: '.tmp/scripts',
                    ext: '.js' // Output files will have a .js extension.
                }]
            },
            // Compile CoffeeScript files specifically for testing purposes.
            compileTests: {
                files: [{
                    expand: true,
                    cwd: TEST_SPEC_DIR,
                    src: COFFEE_PATTERN,
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },

        // Task for compiling Sass/SCSS files into CSS using Compass.
        sassCompiler: {
            options: {
                sassDir: '<%= project.sourceApp %>/styles',
                cssDir: '.tmp/styles',
                imagesDir: '<%= project.sourceApp %>/images',
                javascriptsDir: '<%= project.sourceApp %>/scripts',
                fontsDir: '<%= project.sourceApp %>/styles/fonts',
                importPath: '<%= project.sourceApp %>/components',
                relativeAssets: true // Use relative paths for assets within the generated CSS.
            },
            // Production build configuration for Sass, typically without debug info.
            production: {},
            // Development server configuration for Sass, including debug information.
            development: {
                options: {
                    debugInfo: true // Enable debug information in the generated CSS.
                }
            }
        },

        // Task for concatenating multiple JavaScript files into a single, optimized file.
        fileConcatenator: {
            productionBundle: {
                files: {
                    '<%= project.outputTarget %>/scripts/scripts.js': [
                        `.tmp/scripts/${SCRIPT_PATTERN}`,
                        `<%= project.sourceApp %>/scripts/${SCRIPT_PATTERN}`
                    ]
                }
            }
        },

        // Task to prepare HTML files for minification and asset revisioning using Usemin.
        minificationPreparation: {
            html: '<%= project.sourceApp %>/index.html',
            options: {
                dest: '<%= project.outputTarget %>' // Destination directory for processed files.
            }
        },

        // Task to apply minification and revisioning to generated assets (e.g., CSS, JS).
        minificationApplication: {
            html: [`<%= project.outputTarget %>/${TEMPLATE_PATTERN}`],
            css: [`<%= project.outputTarget %>/styles/${STYLE_PATTERN}`],
            options: {
                dirs: ['<%= project.outputTarget %>'] // Directories to search for assets to process.
            }
        },

        // Task for optimizing image files (e.g., PNG, JPG) to reduce their size for production.
        imageOptimizer: {
            optimizedImages: {
                files: [{
                    expand: true,
                    cwd: '<%= project.sourceApp %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}', // Target common raster image formats.
                    dest: '<%= project.outputTarget %>/images'
                }]
            }
        },

        // Task for minifying CSS files to reduce file size and improve load times.
        cssMinifier: {
            productionCss: {
                files: {
                    '<%= project.outputTarget %>/styles/main.css': [
                        `.tmp/styles/${STYLE_PATTERN}`,
                        `<%= project.sourceApp %>/styles/${STYLE_PATTERN}`
                    ]
                }
            }
        },

        // Task for minifying HTML files, removing whitespace and comments.
        htmlMinifier: {
            productionHtml: {
                options: {
                    // Example options (can be uncommented and adjusted for specific production needs):
                    // removeCommentsFromCDATA: true,
                    // collapseWhitespace: true,
                    // collapseBooleanAttributes: true,
                    // removeAttributeQuotes: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= project.sourceApp %>',
                    src: ['*.html', 'views/*.html'], // Include root and view HTML files.
                    dest: '<%= project.outputTarget %>'
                }]
            }
        },

        // Task for automatically annotating AngularJS files for minification safety.
        // This ensures dependency injection works correctly after variable renaming.
        angularAnnotator: {
            productionScripts: {
                files: [{
                    expand: true,
                    cwd: '<%= project.outputTarget %>/scripts',
                    src: '*.js',
                    dest: '<%= project.outputTarget %>/scripts'
                }]
            }
        },

        // Task for minifying JavaScript files, reducing their size for faster delivery.
        jsMinifier: {
            productionJs: {
                files: {
                    // Overwrite the concatenated script file with its minified version.
                    '<%= project.outputTarget %>/scripts/scripts.js': [
                        '<%= project.outputTarget %>/scripts/scripts.js'
                    ]
                }
            }
        },

        // Task for revisioning static assets (e.g., adding content hashes to filenames) for cache busting.
        cacheBuster: {
            hashedAssets: {
                files: {
                    src: [
                        `<%= project.outputTarget %>/scripts/${SCRIPT_PATTERN}`,
                        `<%= project.outputTarget %>/styles/${STYLE_PATTERN}`,
                        `<%= project.outputTarget %>/images/${IMAGE_PATTERN.replace(',svg', '')}`, // Exclude SVG from revisioning if not desired.
                        '<%= project.outputTarget %>/styles/fonts/*'
                    ]
                }
            }
        },

        // Task for copying essential static files to the distribution directory.
        fileCopier: {
            staticFiles: {
                files: [{
                    expand: true,
                    dot: true, // Include files starting with a dot.
                    cwd: '<%= project.sourceApp %>',
                    dest: '<%= project.outputTarget %>',
                    src: [
                        '*.{ico,txt}', // Favicon and text files like robots.txt.
                        '.htaccess', // Apache server configuration file.
                        'components/**/*', // Third-party components or libraries.
                        'images/{,*/}*.{gif,webp}' // Specific image formats not handled by imageOptimizer.
                    ]
                }]
            }
        }
    });

    // Grunt alias: 'regarde' was an older task name, now aliased to 'fileMonitor'.
    // This ensures compatibility with older configurations or conventions.
    builderEngine.aliasTask('regarde', 'fileMonitor');

    // --- Grunt Task Registrations ---

    // Define the 'develop' task for local development with live reload and immediate feedback.
    builderEngine.registerTask('develop', [
        'fileCleaner:tempFiles',       // 1. Clear temporary build files.
        'coffeeCompiler:compileApp',   // 2. Compile application CoffeeScript.
        'sassCompiler:development',    // 3. Compile Sass with debug information.
        // 'fileMonitor:liveSync',     // This task's options (livereload: true) start the server,
                                       // but the `fileMonitor` task itself is registered later to start watching.
        'httpService:devServer',       // 4. Start the local development web server.
        'browserLauncher',             // 5. Open the application in the default browser.
        'fileMonitor'                  // 6. Start watching files for changes and trigger live reload/recompilation.
    ]);

    // Define the 'validate' task for running project tests and ensuring code quality.
    builderEngine.registerTask('validate', [
        'fileCleaner:tempFiles',       // 1. Clean temporary files before running tests.
        'coffeeCompiler',              // 2. Compile all CoffeeScript (app and tests).
        'sassCompiler',                // 3. Compile all Sass.
        'httpService:testServer',      // 4. Start a dedicated web server for tests.
        'testRunner'                   // 5. Execute unit tests using Karma.
    ]);

    // Define a new intermediate task for logging or pre-processing steps before the main build.
    builderEngine.registerTask('pre-package', 'Performs pre-packaging checks and setup.', function() {
        builderEngine.log.writeln('Initiating pre-packaging procedures...');
        // This could include environment variable checks, dependency validation, or other preparatory steps.
    });

    // Define the 'packageApp' task for creating a production-ready, optimized build.
    builderEngine.registerTask('packageApp', [
        'pre-package',                 // 1. Run any custom pre-packaging checks.
        'fileCleaner:productionBuild', // 2. Clean the previous distribution build.
        'jsLinter',                    // 3. Lint all JavaScript code.
        'validate',                    // 4. Run tests to ensure build integrity and functionality.
        'coffeeCompiler',              // 5. Compile CoffeeScript for the production build.
        'sassCompiler:production',     // 6. Compile Sass for production (minified, no debug).
        'minificationPreparation',     // 7. Prepare HTML for asset minification and revisioning.
        'imageOptimizer',              // 8. Optimize all images.
        'cssMinifier',                 // 9. Minify CSS files.
        'htmlMinifier',                // 10. Minify HTML files.
        'fileConcatenator',            // 11. Concatenate JavaScript files into a single bundle.
        'fileCopier',                  // 12. Copy essential static assets.
        // 'cdnInjector',              // (Removed as per Type III requirements - CDN integration task omitted).
        'angularAnnotator',            // 13. Annotate AngularJS files for minification safety.
        'jsMinifier',                  // 14. Minify the concatenated JavaScript bundle.
        'cacheBuster',                 // 15. Add cache busting hashes to asset filenames.
        'minificationApplication'      // 16. Apply minification and asset revisioning to HTML/CSS.
    ]);

    // Define the default task, which executes the 'packageApp' task to create a production build.
    builderEngine.registerTask('standardBuild', ['packageApp']);
};