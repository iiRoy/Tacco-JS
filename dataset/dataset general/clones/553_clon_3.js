'use strict';

/**
 * This Gruntfile orchestrates the asset compilation, optimization, and development workflow
 * for a modern web application. It processes source files and generates optimized outputs.
 *
 * @param {object} buildTool - The Grunt instance, renamed for clarity.
 */
module.exports = function (buildTool) {

    // Configure various tasks for the build process.
    buildTool.setupConfig({

        // Fetches project metadata from package.json for use in banners or other tasks.
        projectManifest: buildTool.file.readJSON('package.json'),

        // Task to clean specified directories.
        clean: {
            // Clears the entire distribution and temporary build folders.
            distribution: ['dist/', 'temp/']
        },

        // Task for copying static assets that don't require processing.
        copy: {
            // Moves various static files from source to destination.
            staticContent: {
                files: [
                    {
                        expand: true, // Enable dynamic expansion.
                        cwd: 'src/assets/', // Source folder for static assets.
                        src: ['**/*.{png,jpg,jpeg,gif,svg,webp,ico,json,xml,txt}'], // Pattern to match.
                        dest: 'dist/assets/' // Destination folder.
                    },
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['site.webmanifest', 'browserconfig.xml', 'robots.txt', '_headers'], // Root-level files.
                        dest: 'dist/'
                    }
                ]
            }
        },

        // Task for minifying and optimizing HTML files.
        htmlOptimizer: {
            // Production-ready HTML optimization settings.
            productionBuild: {
                options: {
                    removeComments: true,          // Strip all HTML comments.
                    collapseWhitespace: true,      // Collapse redundant whitespace.
                    minifyJS: true,                // Minify inline JavaScript.
                    minifyCSS: true,               // Minify inline CSS.
                    processConditionalComments: true // Process IE conditional comments.
                },
                files: {
                    // Destination file : Source file.
                    'dist/index.html': 'src/views/index.html'
                }
            }
        },

        // Task for minifying and obfuscating JavaScript files.
        jsCompressor: {
            // Configuration for the main application bundle.
            mainAppBundle: {
                options: {
                    compress: {
                        drop_console: true,        // Remove console.log and similar.
                        dead_code: true,           // Eliminate dead code branches.
                        unused: true               // Remove unused functions/variables.
                    },
                    mangle: {
                        toplevel: true             // Mangle top-level variable names.
                    },
                    sourceMap: false               // No source maps for production.
                },
                files: {
                    // Output file : Array of input files (order matters for concatenation).
                    'dist/app.min.js': ['src/scripts/vendors/*.js', 'src/scripts/core.js', 'src/scripts/modules/*.js']
                }
            }
        },

        // Task for compiling Sass/SCSS files into standard CSS.
        sassCompiler: {
            // Default compilation target for development.
            devStyles: {
                files: {
                    // Intermediate CSS output : Main SCSS entry point.
                    'temp/compiled-styles.css': 'src/styles/main.scss'
                }
            }
        },

        // Task for automatically adding vendor prefixes to CSS properties.
        cssPrefixer: {
            // Applies prefixes to the compiled CSS based on browser targets.
            autoPrefix: {
                options: {
                    browsers: ['last 3 versions', '> 1%', 'IE >= 11'], // Target browsers.
                    cascade: false, // Don't re-align properties.
                    remove: true // Remove old/unnecessary prefixes.
                },
                files: {
                    // Overwrite the intermediate CSS file with prefixed content.
                    'temp/compiled-styles.css': 'temp/compiled-styles.css'
                }
            }
        },

        // Task for minifying and concatenating CSS files, adding a custom header.
        finalCssMinifier: {
            // Target for the final, minified CSS with a project banner.
            withProjectHeader: {
                options: {
                    report: 'gzip', // Show minified size and gzipped size.
                    banner: '/*!\n * <%= projectManifest.name %> - v<%= projectManifest.version %>\n * <%= projectManifest.homepage %>\n * Copyright (c) <%= buildTool.template.today("yyyy") %> <%= projectManifest.author %>\n * Licensed under the <%= projectManifest.license %> license.\n */\n'
                },
                files: {
                    // Final minified CSS : Intermediate prefixed CSS.
                    'dist/styles.min.css': ['temp/compiled-styles.css']
                }
            }
        },

        // Task for watching file changes and running specific tasks automatically.
        fileWatcher: {
            options: {
                livereload: false, // Disable live browser refresh to avoid conflicts.
                spawn: true,       // Run tasks in a separate child process.
                debounceDelay: 750 // Milliseconds to wait before triggering tasks.
            },
            // Monitors HTML file changes and re-optimizes them.
            markupFiles: {
                files: ['src/views/**/*.html'],
                tasks: ['htmlOptimizer']
            },
            // Monitors JavaScript file changes and recompresses them.
            scriptFiles: {
                files: ['src/scripts/**/*.js'],
                tasks: ['jsCompressor']
            },
            // Monitors SCSS file changes, recompiles, prefixes, and minifies CSS.
            styleFiles: {
                files: ['src/styles/**/*.scss'],
                tasks: ['sassCompiler', 'cssPrefixer', 'finalCssMinifier']
            },
            // Monitors static asset changes and re-copies them.
            assetFiles: {
                files: ['src/assets/**/*', 'src/site.webmanifest', 'src/robots.txt'],
                tasks: ['copy']
            }
        }
    });

    // Load all required Grunt plugins (modules) from node_modules.
    // Plugin names remain standard 'grunt-contrib-*' or specific package names.
    buildTool.loadNpmTasks('grunt-contrib-clean');
    buildTool.loadNpmTasks('grunt-contrib-copy');
    buildTool.loadNpmTasks('grunt-contrib-htmlmin');
    buildTool.loadNpmTasks('grunt-contrib-uglify');
    buildTool.loadNpmTasks('grunt-contrib-sass');
    buildTool.loadNpmTasks('grunt-autoprefixer'); // This plugin is not 'grunt-contrib-autoprefixer'.
    buildTool.loadNpmTasks('grunt-contrib-cssmin');
    buildTool.loadNpmTasks('grunt-contrib-watch');

    // Define a 'build' task for a complete, one-time production build.
    buildTool.registerTask('build', [
        'clean:distribution',
        'copy:staticContent',
        'htmlOptimizer:productionBuild',
        'jsCompressor:mainAppBundle',
        'sassCompiler:devStyles',
        'cssPrefixer:autoPrefix',
        'finalCssMinifier:withProjectHeader'
    ]);

    // Define the 'default' task, which runs the full build then starts watching for changes.
    buildTool.registerTask('default', ['build', 'fileWatcher']);
};