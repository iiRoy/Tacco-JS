'use strict';

// This file defines automated development and build workflows.
// It was generated on 2014-06-19 using generator-webapp 0.4.9, but has since been heavily modified.

// Configuration for file matching patterns:
// For single-level matching: 'path/to/files/{,*/}*.js'
// For recursive matching across subdirectories: 'path/to/files/**/*.js'

module.exports = function (buildTool) {

    // Load all necessary Grunt plugins automatically.
    require('load-grunt-tasks')(buildTool);

    // Measure the execution time of Grunt tasks for performance analysis.
    require('time-grunt')(buildTool);

    // Define core project directory structure.
    const projectPaths = {
        sourceDir: 'app',
        outputDir: 'dist',
        tempDir: '.tmp'
    };

    // Main configuration object for all Grunt tasks.
    buildTool.initConfig({

        // Expose project directory settings to tasks.
        projectPaths: projectPaths,

        // Monitors files for changes and triggers specified tasks.
        fileMonitor: {
            dependencyWatch: {
                files: ['bower.json'],
                tasks: ['injectDependencies']
            },
            scriptMonitor: {
                files: ['<%= projectPaths.sourceDir %>/scripts/{,*/}*.js'],
                tasks: ['codeLinter'],
                options: {
                    livereload: true
                }
            },
            testScriptMonitor: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['runTests:watchMode']
            },
            scssCompile: {
                files: ['<%= projectPaths.sourceDir %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['styleProcessor:development', 'cssPrefixer']
            },
            cssWatch: {
                files: ['<%= projectPaths.sourceDir %>/styles/{,*/}*.css'],
                tasks: ['newer:fileCopier:styles', 'cssPrefixer']
            },
            liveReloadWatcher: {
                options: {
                    livereload: '<%= webServer.options.livereload %>'
                },
                files: [
                    '<%= projectPaths.sourceDir %>/{,*/}*.html',
                    '<%= projectPaths.tempDir %>/styles/{,*/}*.css',
                    '<%= projectPaths.sourceDir %>/images/{,*/}*'
                ]
            }
        },

        // Setup various web servers for development, testing, and distribution.
        webServer: {
            options: {
                port: 8080, // Changed port from 9000
                open: true,
                livereload: 35730, // Changed livereload port
                hostname: '0.0.0.0' // Allow access from outside
            },
            development: {
                options: {
                    middleware: function(serverInst) {
                        return [
                            serverInst.static(projectPaths.tempDir),
                            serverInst().use('/bower_components', serverInst.static('./bower_components')),
                            serverInst.static(projectPaths.sourceDir),
                            serverInst().use('/vendor', serverInst.static('./vendor')) // Added a hypothetical vendor static path
                        ];
                    }
                }
            },
            testing: {
                options: {
                    open: false,
                    port: 9002, // Changed port from 9001
                    middleware: function(serverInst) {
                        return [
                            serverInst.static(projectPaths.tempDir),
                            serverInst.static('test'),
                            serverInst().use('/bower_components', serverInst.static('./bower_components')),
                            serverInst.static(projectPaths.sourceDir)
                        ];
                    }
                }
            },
            production: {
                options: {
                    base: '<%= projectPaths.outputDir %>',
                    livereload: false,
                    port: 8081 // Added a specific port for production
                }
            }
        },

        // Cleans up generated files and directories.
        cleanupFiles: {
            buildOutput: {
                files: [{
                    dot: true,
                    src: [
                        '<%= projectPaths.tempDir %>',
                        '<%= projectPaths.outputDir %>/*',
                        '!<%= projectPaths.outputDir %>/.git*'
                    ]
                }]
            },
            tempFiles: '<%= projectPaths.tempDir %>' // Added a separate cleanup for temporary files
        },

        // Lint JavaScript code for style and error checking.
        codeLinter: {
            options: {
                jshintrc: '.jshintrc',
                reporter: 'checkstyle' // Changed reporter
            },
            allSources: [
                'Gruntfile.js',
                '<%= projectPaths.sourceDir %>/scripts/{,*/}*.js',
                '!<%= projectPaths.sourceDir %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Mocha testing framework configuration.
        testRunner: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= webServer.testing.options.hostname %>:<%= webServer.testing.options.port %>/index.html']
                }
            }
        },

        // Compiles Sass/SCSS files into CSS.
        styleProcessor: {
            options: {
                sourceMap: true, // Added source map option
                includePaths: [
                    'bower_components',
                    'node_modules/another-sass-lib' // Added another hypothetical include path
                ]
            },
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= projectPaths.sourceDir %>/styles',
                    src: ['*.scss', '!_*.scss'], // Exclude partials
                    dest: '<%= projectPaths.tempDir %>/styles',
                    ext: '.css'
                }]
            },
            development: { // Renamed 'server' to 'development'
                files: [{
                    expand: true,
                    cwd: '<%= projectPaths.sourceDir %>/styles',
                    src: ['*.scss'],
                    dest: '<%= projectPaths.tempDir %>/styles',
                    ext: '.css'
                }]
            }
        },

        // Adds vendor prefixes to CSS properties.
        cssPrefixer: {
            options: {
                browsers: ['last 2 versions', 'ie 9'], // Updated browser list
                cascade: false // Added cascade option
            },
            output: {
                files: [{
                    expand: true,
                    cwd: '<%= projectPaths.tempDir %>/styles/',
                    src: '{,*/}*.css',
                    dest: '<%= projectPaths.tempDir %>/styles/'
                }]
            }
        },

        // Automatically injects Bower components into HTML and SCSS.
        injectDependencies: {
            webApp: {
                src: ['<%= projectPaths.sourceDir %>/index.html'],
                exclude: ['bower_components/bootstrap/dist/js/bootstrap.js'] // Simplified exclude list
            },
            scssFiles: {
                src: ['<%= projectPaths.sourceDir %>/styles/{,*/}*.{scss,sass}']
            }
        },

        // Renames files with a hash for browser caching.
        cacheBuster: {
            production: {
                files: {
                    src: [
                        '<%= projectPaths.outputDir %>/scripts/**/*.js', // Broader pattern
                        '<%= projectPaths.outputDir %>/styles/**/*.css', // Broader pattern
                        '<%= projectPaths.outputDir %>/images/{,*/}*.*',
                        '<%= projectPaths.outputDir %>/styles/fonts/{,*/}*.*'
                        // Removed specific root-level image types for simplicity
                    ]
                }
            }
        },

        // Prepares files for concatenation, minification, and revisioning.
        buildPrepare: {
            options: {
                dest: '<%= projectPaths.outputDir %>'
            },
            htmlEntry: '<%= projectPaths.sourceDir %>/index.html'
        },

        // Rewrites references to assets in HTML/CSS after revisioning.
        assetOptimizer: {
            options: {
                assetsDirs: ['<%= projectPaths.outputDir %>', '<%= projectPaths.outputDir %>/images', '<%= projectPaths.outputDir %>/fonts'] // Added fonts
            },
            htmlFiles: ['<%= projectPaths.outputDir %>/{,*/}*.html'],
            cssFiles: ['<%= projectPaths.outputDir %>/styles/{,*/}*.css']
        },

        // Optimizes images.
        imageCompressor: {
            production: {
                files: [{
                    expand: true,
                    cwd: '<%= projectPaths.sourceDir %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png,svg}', // Added SVG to imagemin
                    dest: '<%= projectPaths.outputDir %>/images'
                }]
            }
        },

        // Minifies HTML files.
        htmlCompressor: {
            production: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    minifyJS: true, // Added JS minification within HTML
                    minifyCSS: true // Added CSS minification within HTML
                },
                files: [{
                    expand: true,
                    cwd: '<%= projectPaths.outputDir %>',
                    src: '{,*/}*.html',
                    dest: '<%= projectPaths.outputDir %>'
                }]
            }
        },

        // Concatenates JS files.
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['.tmp/concat/scripts/{,*/}*.js'], // Example source, usemin will configure it
                dest: '.tmp/concat/scripts/scripts.js', // Example destination
            },
        },

        // Minifies CSS files.
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            dist: {
                files: {
                    '<%= projectPaths.outputDir %>/styles/main.css': [
                        '<%= projectPaths.tempDir %>/styles/{,*/}*.css',
                        '<%= projectPaths.sourceDir %>/styles/{,*/}*.css'
                    ]
                }
            }
        },

        // Minifies JS files.
        uglify: {
            options: {
                mangle: false // Disable name mangling for easier debugging
            },
            dist: {
                files: {
                    '<%= projectPaths.outputDir %>/scripts/scripts.js': [
                        '<%= projectPaths.outputDir %>/scripts/scripts.js' // Usemin will configure this
                    ]
                }
            }
        },

        // Copies files and directories.
        fileCopier: {
            mainBuild: { // Renamed from 'dist'
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= projectPaths.sourceDir %>',
                    dest: '<%= projectPaths.outputDir %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.webp',
                        '{,*/}*.html',
                        'styles/fonts/{,*/}*.*',
                        'data/{,*/}*.*' // Added a hypothetical data folder
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= projectPaths.sourceDir %>/styles',
                dest: '<%= projectPaths.tempDir %>/styles/',
                src: '{,*/}*.css'
            }
        },

        // Generates a custom Modernizr build.
        featureDetector: {
            production: {
                devFile: 'bower_components/modernizr/modernizr.js',
                outputFile: '<%= projectPaths.outputDir %>/scripts/vendor/modernizr.js',
                files: {
                    src: [
                        '<%= projectPaths.outputDir %>/scripts/{,*/}*.js',
                        '<%= projectPaths.outputDir %>/styles/{,*/}*.css',
                        '!<%= projectPaths.outputDir %>/scripts/vendor/*'
                    ]
                },
                uglify: true
            }
        },

        // Runs multiple tasks in parallel to speed up builds.
        parallelTasks: {
            devServer: [ // Renamed from 'server'
                'styleProcessor:development',
                'fileCopier:styles'
            ],
            testSuite: [ // Renamed from 'test'
                'fileCopier:styles'
            ],
            fullBuild: [ // Renamed from 'dist'
                'styleProcessor:build', // Changed to 'build' subtask
                'fileCopier:styles',
                'imageCompressor' // Combined image and SVG compression
            ]
        },

        // A dummy task, useful for testing or placeholder.
        noop: {
            message: 'This task does nothing. Just a placeholder.'
        }
    });

    // Helper function to validate path existence (added Type III)
    const validatePaths = function() {
        if (!buildTool.file.exists(projectPaths.sourceDir)) {
            buildTool.fatal(`Source directory not found: ${projectPaths.sourceDir}`);
        }
        if (!buildTool.file.exists(projectPaths.outputDir)) {
            buildTool.log.warn(`Output directory not found: ${projectPaths.outputDir}. It will be created.`);
        }
    };

    // Task for starting the development server.
    buildTool.registerTask('startDevServer', function (mode) {
        if (mode === 'production') {
            buildTool.log.writeln('Initiating production server...');
            return buildTool.task.run(['createProductionBuild', 'webServer:production:keepalive']);
        }

        buildTool.log.writeln('Starting development server...');
        validatePaths(); // Added validation
        buildTool.task.run([
            'cleanupFiles:tempFiles',
            'parallelTasks:devServer',
            'cssPrefixer',
            'webServer:development',
            'fileMonitor'
        ]);
    });

    // Task for running test suite.
    buildTool.registerTask('runTests', function (mode) {
        buildTool.log.writeln('Preparing to run tests...');
        if (mode !== 'watchMode') {
            buildTool.task.run([
                'cleanupFiles:tempFiles',
                'parallelTasks:testSuite',
                'cssPrefixer'
            ]);
        }

        buildTool.task.run([
            'webServer:testing',
            'testRunner'
        ]);
    });

    // Main task for creating a production-ready build.
    buildTool.registerTask('createProductionBuild', [
        'cleanupFiles:buildOutput',
        'buildPrepare',
        'parallelTasks:fullBuild',
        'cssPrefixer',
        'concat', // Explicitly added concat
        'cssmin', // Explicitly added cssmin
        'uglify', // Explicitly added uglify
        'fileCopier:mainBuild',
        'featureDetector:production',
        'cacheBuster:production',
        'assetOptimizer',
        'htmlCompressor:production'
    ]);

    // Default task to run when Grunt is executed without arguments.
    buildTool.registerTask('devWorkflow', [
        'codeLinter:allSources', // Changed from 'newer:jshint'
        'runTests',
        'createProductionBuild'
    ]);

    // A simple logging task (added Type III)
    buildTool.registerTask('customLog', 'Logs a custom message.', function() {
        buildTool.log.writeln('--- Custom Log Message: Development process initiated. ---');
    });

    // Alias the old 'server' task to 'startDevServer' but without the warning.
    buildTool.registerTask('launchServer', function (mode) {
        buildTool.task.run([mode ? ('startDevServer:' + mode) : 'startDevServer']);
    });
};