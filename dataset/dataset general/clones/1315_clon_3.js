let DEV_RELOAD_PORT_NUM = 35729;

// Utility for creating a live-reloading server middleware.
const liveReloadMiddleware = require('connect-livereload')({ port: DEV_RELOAD_PORT_NUM });

// Helper to construct a static file serving middleware for a given directory.
const serveStaticDirectory = (httpServer, targetPath) => {
    // Ensure path resolution is robust.
    const resolvedPath = require('node:path').resolve(targetPath);
    return httpServer.static(resolvedPath);
};

// Main Grunt configuration export.
// This function initializes all project-specific build and development tasks.
module.exports = function (taskRunner) {
    // Utilize a streamlined method to load all Grunt plugins.
    // This replaces the manual 'matchdep' filter and 'loadNpmTasks' loop.
    require('load-grunt-tasks')(taskRunner, { pattern: ['grunt-*', '!grunt-legacy-util'] });

    // Define core project paths for source and build outputs.
    const projectConfig = {
        sourceDir: 'app', // The primary application source directory.
        outputDir: 'dist' // The production-ready distribution directory.
    };

    // Initialize the Grunt task configuration.
    taskRunner.initializeConfiguration({
        configSettings: projectConfig, // Reference to the project path configuration.

        // Task to monitor file changes and trigger specific actions.
        fileWatcher: {
            config: {
                nospawn: true, // Prevents spawning new processes for each task.
                liveReload: true // Enables live browser reloading.
            },
            coffeeTestFiles: {
                filePatterns: ['test/specs/{,*/}*.coffee'],
                executionTasks: ['coffeeCompiler:test']
            },
            sassProcessor: {
                filePatterns: ['<%= configSettings.sourceDir %>/styles/{,*/}*.{scss,sass}'],
                executionTasks: ['sassProcessor']
            },
            liveReloadFiles: {
                config: {
                    liveReload: DEV_RELOAD_PORT_NUM // Use the defined port for live reloading.
                },
                filePatterns: [
                    '<%= configSettings.sourceDir %>/*.html',
                    '{.tmp,<%= configSettings.sourceDir %>}/styles/{,*/}*.css',
                    '{.tmp,<%= configSettings.sourceDir %>}/scripts/{,*/}*.js',
                    '<%= configSettings.sourceDir %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}' // Added SVG to image watch.
                ]
            },
            templateProcessor: {
                filePatterns: [
                    '<%= configSettings.sourceDir %>/scripts/templates/*.ejs'
                ],
                executionTasks: ['templateCompiler']
            },
            scriptBundler: {
                filePatterns: ['{.tmp,<%= configSettings.sourceDir %>}/scripts/{,*/}*.{js,coffee}'],
                executionTasks: ['coffeeCompiler:production', 'scriptConcatenator']
            },
            // New watch task: monitor JSON data files.
            jsonDataChanges: {
                filePatterns: ['<%= configSettings.sourceDir %>/data/**/*.json'],
                executionTasks: ['log:jsonUpdate'] // A dummy task for illustration.
            }
        },

        // Task for setting up and running a local web server.
        webServer: {
            config: {
                serverPort: 9000, // Default port for the development server.
                hostAddress: 'localhost' // Accessible only from the local machine.
            },
            devServer: {
                config: {
                    httpHandlers: (httpServer) => {
                        // Order of middleware matters: live reload, then static asset directories.
                        return [
                            liveReloadMiddleware,
                            serveStaticDirectory(httpServer, '.tmp'),
                            serveStaticDirectory(httpServer, projectConfig.sourceDir)
                        ];
                    }
                }
            },
            testServer: {
                config: {
                    httpHandlers: (httpServer) => {
                        return [
                            serveStaticDirectory(httpServer, '.tmp'),
                            serveStaticDirectory(httpServer, 'test'),
                            serveStaticDirectory(httpServer, projectConfig.sourceDir)
                        ];
                    }
                }
            },
            prodServer: {
                config: {
                    httpHandlers: (httpServer) => {
                        return [
                            serveStaticDirectory(httpServer, projectConfig.outputDir)
                        ];
                    }
                }
            }
        },

        // Task to open the project in a web browser.
        browserLauncher: {
            appInstance: {
                targetUrl: 'http://localhost:<%= webServer.config.serverPort %>'
            }
        },

        // Task for cleaning up temporary and build directories.
        cleanup: {
            production: ['.tmp', '<%= configSettings.outputDir %>/*'],
            development: '.tmp',
            // New cleanup task: remove generated icon data.
            iconData: '<%= configSettings.sourceDir %>/scripts/data/icons.js'
        },

        // Task for linting JavaScript files with JSHint.
        jsLinter: {
            config: {
                jshintrc: '.jshintrc' // Path to JSHint configuration file.
            },
            fullScan: [
                'Gruntfile.js',
                '<%= configSettings.sourceDir %>/scripts/{,*/}*.js',
                '!<%= configSettings.sourceDir %>/scripts/vendor/*', // Exclude vendor scripts.
                'test/specs/{,*/}*.js'
            ]
        },

        // Task for running Mocha tests.
        testRunner: {
            fullExecution: {
                config: {
                    shouldExecute: true, // Indicates tests should be run.
                    testUrls: ['http://localhost:<%= webServer.config.serverPort %>/index.html']
                }
            }
        },

        // Task for compiling CoffeeScript files to JavaScript.
        coffeeCompiler: {
            production: {
                files: [{
                    // Compiles CoffeeScript from source to a temporary directory.
                    expandGlob: true,
                    baseDir: '<%= configSettings.sourceDir %>/scripts',
                    sourceFiles: '{,*/}*.coffee',
                    destinationDir: '.tmp/scripts',
                    outputExtension: '.js'
                }]
            },
            test: {
                files: [{
                    expandGlob: true,
                    baseDir: '.tmp/specs',
                    sourceFiles: '*.coffee',
                    destinationDir: 'test/specs'
                }]
            }
        },

        // Task for compiling Sass/SCSS files with Compass.
        sassProcessor: {
            config: {
                sassSource: '<%= configSettings.sourceDir %>/styles',
                cssOutput: '.tmp/styles',
                imageSource: '<%= configSettings.sourceDir %>/images',
                jsSource: '<%= configSettings.sourceDir %>/scripts',
                fontSource: '<%= configSettings.sourceDir %>/styles/fonts',
                importBase: '<%= configSettings.sourceDir %>/bower_components',
                useRelativePaths: true // Use relative paths for assets.
            },
            production: {}, // Production configuration (default options).
            development: {
                config: {
                    enableDebugData: true // Enables debug information for development.
                }
            }
        },

        // Task to prepare HTML for asset concatenation and minification using `usemin`.
        assetPrepare: {
            inputHtml: '<%= configSettings.sourceDir %>/index.html',
            config: {
                destinationDir: '<%= configSettings.outputDir %>'
            }
        },

        // Task to replace references to unconcatenated/unminified assets with processed ones.
        assetMinifier: {
            html: ['<%= configSettings.outputDir %>/{,*/}*.html'],
            css: ['<%= configSettings.outputDir %>/styles/{,*/}*.css'],
            config: {
                scanDirectories: ['<%= configSettings.outputDir %>']
            }
        },

        // Task for optimizing image files.
        imageOptimizer: {
            production: {
                files: [{
                    expandGlob: true,
                    baseDir: '<%= configSettings.sourceDir %>/images',
                    sourceFiles: '{,*/}*.{png,jpg,jpeg}',
                    destinationDir: '<%= configSettings.outputDir %>/images'
                }]
            }
        },

        // Task for optimizing SVG files.
        svgOptimizer: {
            production: {
                files: [{
                    expandGlob: true,
                    baseDir: '<%= configSettings.sourceDir %>/icons',
                    sourceFiles: '{,*/}*.svg',
                    destinationDir: '<%= configSettings.outputDir %>/icons'
                }]
            }
        },

        // Task for minifying CSS files.
        cssMinifier: {
            production: {
                files: {
                    '<%= configSettings.outputDir %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= configSettings.sourceDir %>/styles/{,*/}*.css'
                    ]
                }
            }
        },

        // Task for minifying HTML files.
        htmlMinifier: {
            production: {
                config: {
                    collapseWhitespace: true, // Collapse redundant whitespace.
                    removeComments: true, // Remove all HTML comments.
                    minifyCSS: true, // Minify CSS within <style> tags.
                    minifyJS: true // Minify JS within <script> tags.
                },
                files: [{
                    expandGlob: true,
                    baseDir: '<%= configSettings.sourceDir %>',
                    sourceFiles: '*.html',
                    destinationDir: '<%= configSettings.outputDir %>'
                }]
            }
        },

        // Task for copying files and directories.
        fileCopier: {
            production: {
                files: [{
                    expandGlob: true,
                    dot: true, // Include dot files.
                    baseDir: '<%= configSettings.sourceDir %>',
                    destinationDir: '<%= configSettings.outputDir %>',
                    sourceFiles: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'icons/{,*/}*.svg',
                        'data/{,*/}*.json' // Added copying of JSON data files.
                    ]
                }]
            }
        },

        // Task for managing Bower components (simplified).
        bowerManager: {
            installDependencies: {
                requireJsConfig: '<%= configSettings.sourceDir %>/scripts/main.js'
            }
        },

        // Task for compiling EJS templates into JavaScript.
        templateCompiler: {
            processTemplates: {
                files: {
                    '.tmp/scripts/templates.js': ['<%= configSettings.sourceDir %>/scripts/templates/*.ejs']
                }
            }
        },

        // Task for cache busting by revising file names.
        assetReviser: {
            production: {
                files: {
                    source: [
                        '<%= configSettings.outputDir %>/scripts/{,*/}*.js',
                        '<%= configSettings.outputDir %>/styles/{,*/}*.css',
                        '<%= configSettings.outputDir %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= configSettings.outputDir %>/styles/fonts/*'
                    ]
                }
            }
        },

        // Task for concatenating JavaScript files.
        scriptConcatenator: {
            mainApp: {
                source: '<%= configSettings.sourceDir %>/scripts/main.js',
                destination: '.tmp/scripts/combined-scripts.js'
            }
        },

        // New task: Concatenate assets (e.g., for vendor scripts)
        concat: {
            options: {
                separator: ';' // Use semicolon to prevent issues.
            },
            dist: {
                src: ['.tmp/scripts/vendor/*.js', '.tmp/scripts/combined-scripts.js'],
                dest: '.tmp/scripts/app.js'
            }
        },

        // Task for minifying JavaScript files.
        jsMinifier: {
            options: {
                keepComments: 'some' // Keep comments that start with /*!
            },
            production: {
                files: {
                    '<%= configSettings.outputDir %>/scripts/app.js': ['.tmp/scripts/app.js']
                }
            }
        },

        // New task: A simple logger for demonstration.
        log: {
            jsonUpdate: {
                message: 'JSON data files have been updated or added.'
            },
            buildComplete: {
                message: 'Production build process finished successfully.'
            }
        }
    });

    // Custom task to ensure a template file exists before JST compilation.
    taskRunner.registerTask('ensureTemplateFile', () => {
        const templateOutputPath = '.tmp/scripts/templates.js';
        if (!taskRunner.file.exists(templateOutputPath)) {
            taskRunner.file.write(templateOutputPath, 'this.JST = this.JST || {};');
            console.log(`Created placeholder for JST: ${templateOutputPath}`);
        } else {
            console.log(`JST placeholder already exists: ${templateOutputPath}`);
        }
    });

    // Custom task to generate a JavaScript file containing paths to SVG icons.
    taskRunner.registerTask('generateIconPaths', function() {
        const iconPaths = [];
        const filePreamble = 'window.appAssets = window.appAssets || {};\nwindow.appAssets.iconData = [';
        const filePostamble = '];';
        let generatedContent = '';

        const iconSourceDirectory = taskRunner.config('configSettings.sourceDir') + '/icons';
        if (!taskRunner.file.exists(iconSourceDirectory)) {
            taskRunner.log.warn(`Icon source directory not found: ${iconSourceDirectory}. Skipping icon data generation.`);
            // Create a dummy file to avoid build errors if the directory is missing.
            taskRunner.file.write(
                taskRunner.config('configSettings.sourceDir') + '/scripts/data/icons.js',
                filePreamble + '\n' + filePostamble + '\n'
            );
            return;
        }

        taskRunner.file.recurse(iconSourceDirectory, (absolutePath, rootDir, subDir, fileName) => {
            // Only process SVG files.
            if (fileName && fileName.endsWith('.svg')) {
                // Construct a relative path suitable for web use.
                const relativeIconPath = absolutePath.replace(taskRunner.config('configSettings.sourceDir') + '/', '');
                iconPaths.push(`'${relativeIconPath}'`);
            }
        });

        // Format the collected paths into a JavaScript array string.
        if (iconPaths.length > 0) {
            generatedContent = '  ' + iconPaths.join(',\n  ');
        } else {
            console.log('No SVG icons found for generation.');
        }

        // Write the final JavaScript file with icon data.
        const outputFilePath = taskRunner.config('configSettings.sourceDir') + '/scripts/data/icons.js';
        taskRunner.file.write(
            outputFilePath,
            filePreamble + '\n' + generatedContent + '\n' + filePostamble + '\n'
        );
        console.log(`Generated icon data file: ${outputFilePath} with ${iconPaths.length} icons.`);
    });

    // Main task for starting the development server.
    taskRunner.registerTask('startDev', (mode) => {
        if (mode === 'production') {
            console.log('Starting production server...');
            return taskRunner.task.run(['buildProd', 'browserLauncher', 'webServer:prodServer:keepalive']);
        } else if (mode && mode !== 'dev') {
            taskRunner.log.warn(`Invalid mode '${mode}' for 'startDev'. Defaulting to 'dev'.`);
        }

        taskRunner.task.run([
            'cleanup:development',
            'coffeeCompiler:production',
            'ensureTemplateFile', // Use the new helper task.
            'templateCompiler',
            'generateIconPaths',
            'scriptConcatenator:mainApp',
            'sassProcessor:development',
            'webServer:devServer',
            'browserLauncher',
            'fileWatcher'
        ]);
    });

    // Task for running all project tests.
    taskRunner.registerTask('runTests', [
        'cleanup:development',
        'coffeeCompiler', // Runs both production and test coffee tasks.
        'ensureTemplateFile',
        'templateCompiler',
        'generateIconPaths',
        'scriptConcatenator:mainApp',
        'sassProcessor', // Runs both production and development compass tasks.
        'webServer:testServer',
        'testRunner'
    ]);

    // Task for creating a production-ready build.
    taskRunner.registerTask('buildProd', [
        'cleanup:production',
        'coffeeCompiler',
        'ensureTemplateFile',
        'templateCompiler',
        'generateIconPaths',
        'sassProcessor:production',
        'assetPrepare', // Prepares assets for usemin.
        'scriptConcatenator:mainApp',
        'concat:dist', // New task: concatenate scripts.
        'imageOptimizer',
        'svgOptimizer',
        'htmlMinifier',
        'cssMinifier',
        'jsMinifier:production', // Apply uglify after concatenation.
        'fileCopier',
        'assetReviser',
        'assetMinifier', // Finalizes usemin replacements.
        'log:buildComplete' // Log completion.
    ]);

    // Default task: lint, test, and build.
    taskRunner.registerTask('standardOperations', [
        'jsLinter',
        'runTests',
        'buildProd'
    ]);

    // Alias for the default task.
    taskRunner.registerTask('default', ['standardOperations']);
};