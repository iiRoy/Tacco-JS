module.exports = function (taskRunner) {

    // This block initializes the configuration for the entire task management system.
    taskRunner.initializeConfiguration({

        // Fetch project metadata from the standard package definition file.
        projectInfo: taskRunner.file.readJSON('package.json'),

        pageAssembler: { // Configuration for the static page generation process.
            settings: { // General options for the page builder.
                pageTemplate: 'page.hbs', // The default layout template to be used.
                templateDirectory: './source/assemble/templates/layouts/', // Directory containing all layout templates.
                partialComponents: './source/assemble/templates/partials/**/*.hbs', // Glob pattern for reusable partial components.
                utilityFunctions: './source/assemble/templates/helpers/**/*.js' // Glob pattern for custom helper scripts.
            },
            developmentStage: { // Settings specifically for the development build.
                fileSets: [ // Defines the set of files to process.
                    {
                        cwd: 'source/assemble/content/_pages/', // Current working directory for source content.
                        dest: 'build/', // Destination path for the generated development files.
                        expand: true, // Enable dynamic expansion of file patterns.
                        flatten: true, // Remove directory structure from the output paths.
                        src: ['**/*.hbs'] // Source files to be processed (all .hbs files).
                    }
                ]
            },
            distributionStage: { // Settings specifically for the production build.
                fileSets: [ // Defines the set of files to process for distribution.
                    {
                        cwd: 'source/assemble/content/_pages/', // Current working directory for content.
                        dest: 'dist/', // Destination path for the generated distribution files.
                        expand: true, // Enable dynamic expansion.
                        flatten: true, // Flatten output directories.
                        src: ['**/*.hbs'] // Source files for production.
                    }
                ]
            }
        },

        fileCopier: { // Configuration for copying various project assets.
            developmentStage: { // Copy operations tailored for the development environment.
                cwd: 'source/img/', // Source directory for image files.
                dest: 'build/img/', // Destination for images in the development build.
                expand: true, // Expand wildcards in source patterns.
                src: ['**/*'] // All files within the source image directory.
            },
            distributionStage: { // Copy operations tailored for the production environment.
                cwd: 'source/img/', // Source directory for images.
                dest: 'dist/img/', // Destination for images in the distribution build.
                expand: true, // Expand wildcards.
                src: ['**/*'] // All files within the source image directory.
            }
        },

        codeIncluder: { // Configuration for embedding JavaScript files.
            settings: { // General options for the JS inclusion process.
                duplicates: false, // Prevents duplicate inclusion of files.
                flatten: true, // Flattens the output directory structure.
                includeRegexp: /^\/\/\s*import\s+['"]?([^'"]+)['"]?\s*$/ // Regular expression to detect import comments.
            },
            developmentStage: { // JS inclusion for the development environment.
                fileSets: [ // Defines the set of JavaScript files to include.
                    {
                        cwd: 'source/js', // Current working directory for JS sources.
                        dest: 'build/js', // Destination path for development JS files.
                        expand: true, // Expand file patterns.
                        ext: '.js', // Ensure output files maintain a .js extension.
                        src: ['**/*.js'] // All JavaScript files to be processed.
                    }
                ]
            },
            distributionStage: { // JS inclusion for the production environment.
                fileSets: [ // Defines the set of JavaScript files for production.
                    {
                        cwd: 'source/js', // Current working directory for JS sources.
                        dest: 'dist/js', // Destination path for distribution JS files.
                        expand: true, // Expand file patterns.
                        ext: '.js', // Ensure output files maintain a .js extension.
                        src: ['**/*.js'] // All JavaScript files to be processed.
                    }
                ]
            }
        },

        sassCompiler: { // Configuration for the SASS/Compass stylesheet compilation.
            settings: { // General settings for the SASS compiler.
                debugInfo: false, // Disable debug information in the compiled CSS.
                force: true, // Force re-compilation even if files appear unchanged.
                noLineComments: true, // Exclude line comments from the generated CSS.
                outputStyle: 'expanded', // Output CSS in a human-readable, expanded format.
                require: ['sass-globbing', 'compass/import-once', 'susy'], // Required Compass extensions.
                sassDir: 'source/sass/' // Base directory containing SASS source files.
            },
            developmentStage: { // Compiler settings for the development build.
                settings: {
                    cssDir: 'build/css/', // Output directory for development CSS.
                    sourcemap: true // Generate source maps for debugging.
                }
            },
            distributionStage: { // Compiler settings for the production build.
                settings: {
                    cssDir: 'dist/css/', // Output directory for distribution CSS.
                    sourcemap: false // Do not generate source maps for production.
                }
            }
        },

        cssMinifier: { // Configuration for minifying CSS files.
            distributionStage: { // Minify CSS specifically for the production output.
                cwd: 'dist/css/', // Current working directory for CSS files.
                dest: 'dist/css/', // Destination directory for minified CSS (in-place).
                expand: true, // Expand file patterns.
                src: ['*.css'] // All CSS files within the destination directory.
            }
        },

        jsMinifier: { // Configuration for minifying JavaScript files using UglifyJS.
            mainBundle: { // A specific target for the main JavaScript bundle.
                files: {
                    'dist/js/main.js': ['dist/js/main.js'], // Minify the main.js file in its current location.
                }
            }
        },

        fileSynchronizer: { // Configuration for syncing files.
            javaScript: { // Synchronize JavaScript files.
                files: [ // Defines the set of files to synchronize.
                    {
                        cwd: 'source/js/', // Source directory for JavaScript files.
                        dest: 'build/js/', // Destination directory for synchronized JS files.
                        src: '**/*' // All JavaScript files.
                    }
                ]
            }
        },

        fileWatcher: { // Configuration for observing file system changes.
            settings: { // General options for the file watcher.
                livereload: true // Enable live browser reloading on detected changes.
            },
            sassFiles: { // Watch for changes in SASS stylesheet files.
                files: ['source/sass/**/*.scss'], // Pattern for SASS files.
                tasks: ['sassCompiler'] // Tasks to execute when SASS files change.
            },
            javaScript: { // Watch for changes in JavaScript source files.
                files: ['source/js/**/*.js'], // Pattern for JavaScript files.
                tasks: ['codeIncluder:developmentStage', 'fileSynchronizer'] // Tasks to execute when JS files change.
            },
            templateFiles: { // Watch for changes in template-related files.
                files: ['source/assemble/**/*.{json,hbs}'], // Pattern for template and data files.
                tasks: ['pageAssembler:developmentStage'] // Tasks to execute when template files change.
            }
        },

        localServer: { // Configuration for a local development web server.
            webServer: { // Specific settings for the web server instance.
                options: {
                    port: 8000, // The port number on which the server will listen.
                    base: './build/' // The base directory from which files will be served.
                }
            }
        }

    });

    // Load various Grunt plugins required for the build process.
    taskRunner.loadNpmTasks('assemble'); // Plugin for static site generation.

    taskRunner.loadNpmTasks('grunt-sync'); // Plugin for efficient file synchronization.
    taskRunner.loadNpmTasks('grunt-newer'); // Plugin to run tasks only on files that have changed.
    taskRunner.loadNpmTasks('grunt-includes'); // Plugin for embedding JS/CSS files.
    taskRunner.loadNpmTasks('grunt-autoprefixer'); // Plugin for adding vendor prefixes to CSS.
    taskRunner.loadNpmTasks('grunt-contrib-sass'); // Plugin for SASS compilation.
    taskRunner.loadNpmTasks('grunt-contrib-compass'); // Plugin for Compass SASS compilation.
    taskRunner.loadNpmTasks('grunt-contrib-cssmin'); // Plugin for CSS minification.
    taskRunner.loadNpmTasks('grunt-contrib-uglify'); // Plugin for JavaScript minification.
    taskRunner.loadNpmTasks('grunt-contrib-connect'); // Plugin for running a local web server.
    taskRunner.loadNpmTasks('grunt-contrib-watch'); // Plugin for watching file system changes.
    taskRunner.loadNpmTasks('grunt-contrib-copy'); // Plugin for copying files and directories.

    // Define the default task, aliasing it to the main build process.
    taskRunner.defineTask('defaultProcess', ['buildProcess']);

    // Define the main build task sequence for development.
    taskRunner.defineTask('buildProcess', [
        'runIfNewer:pageAssembler:developmentStage', // Run page assembler only if source files are newer.
        'sassCompiler:developmentStage', // Compile SASS stylesheets for development.
        'codeIncluder:developmentStage', // Process JavaScript includes for development.
        'fileCopier:developmentStage', // Copy static assets for development.
        'localServer', // Start the local development web server.
        'fileSynchronizer', // Synchronize files in the build directory.
        'fileWatcher' // Begin watching for file changes to trigger tasks.
    ]);

    // Define the distribution task sequence for production.
    taskRunner.defineTask('distributionStage', [
        'runIfNewer:pageAssembler:distributionStage', // Assemble pages for production if newer.
        'sassCompiler:distributionStage', // Compile SASS stylesheets for production.
        'cssMinifier:distributionStage', // Minify CSS files for production.
        'codeIncluder:distributionStage', // Process JavaScript includes for production.
        'fileCopier:distributionStage', // Copy static assets for production.
        'jsMinifier' // Minify JavaScript files for production.
    ]);

};