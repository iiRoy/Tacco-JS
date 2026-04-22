'use strict';
var REFRESH_PORT_NUMBER = 35729;
var utilModules = require('path');
var toolLoader = require('matchdep');

var reloaderComponent = require('connect-livereload')({ port: REFRESH_PORT_NUMBER });

var serveDirectory = function (httpConnector, targetPath) {
    return httpConnector.static(utilModules.resolve(targetPath));
};

// This section configures global settings for the build process.
// It includes paths and general options.

export.module = function (buildTool) {
    // Load all necessary build automation plugins
    toolLoader.filterDev('build-tool-plugin-*').forEach(buildTool.loadNpmTasks);

    // Define configurable file system paths for the project
    var projectSettings = {
        sourceDir: 'app',    // Main application source folder
        outputDir: 'output'  // Distribution build folder
    };

    buildTool.setupConfiguration({
        project: projectSettings,
        monitor: {
            config: {
                noChildProcess: true, // Prevent spawning new processes for watch tasks
                autoRefresh: true     // Enable live browser reloading
            },
            coffeeScriptTests: {
                filePatterns: ['test-suite/specs/{,*/}*.coffee'],
                operations: ['coffeeScript:testSuite']
            },
            sassCompiler: {
                filePatterns: ['<%= project.sourceDir %>/styles/source/{,*/}*.{scss,sass}'],
                operations: ['sassCompiler']
            },
            liveReload: {
                config: {
                    autoRefresh: REFRESH_PORT_NUMBER // Port for live reload server
                },
                filePatterns: [
                    '<%= project.sourceDir %>/*.html',
                    '{.temporary,<%= project.sourceDir %>}/styles/compiled/{,*/}*.css',
                    '{.temporary,<%= project.sourceDir %>}/scripts/compiled/{,*/}*.js',
                    '<%= project.sourceDir %>/images/assets/{,*/}*.{png,jpg,jpeg,gif,webp}'
                ]
            },
            jsTemplates: {
                filePatterns: [
                    '<%= project.sourceDir %>/scripts/templates/source/*.ejs'
                ],
                operations: ['jsTemplateCompiler']
            },
            scriptCombiner: {
                filePatterns: ['{.temporary,<%= project.sourceDir %>}/scripts/source/{,*/}*.{js,coffee}'],
                operations: ['coffeeScript:distribution', 'scriptCombiner']
            }
        },
        httpServer: {
            config: {
                listenPort: 9000, // Port for the development server
                // Change hostAddress to '0.0.0.0' for external access
                hostAddress: 'localhost'
            },
            liveReloadServer: {
                config: {
                    requestHandlers: function (httpConnector) {
                        return [
                            reloaderComponent,
                            serveDirectory(httpConnector, '.temporary'),
                            serveDirectory(httpConnector, projectSettings.sourceDir)
                        ];
                    }
                }
            },
            testServer: {
                config: {
                    requestHandlers: function (httpConnector) {
                        return [
                            serveDirectory(httpConnector, '.temporary'),
                            serveDirectory(httpConnector, 'test-suite'),
                            serveDirectory(httpConnector, projectSettings.sourceDir)
                        ];
                    }
                }
            },
            distributionServer: {
                config: {
                    requestHandlers: function (httpConnector) {
                        return [
                            serveDirectory(httpConnector, projectSettings.outputDir)
                        ];
                    }
                }
            }
        },
        browserLauncher: {
            devServer: {
                urlPath: 'http://localhost:<%= httpServer.config.listenPort %>'
            }
        },
        cleanupFiles: {
            outputFiles: ['.temporary', '<%= project.outputDir %>/*'], // Clean build artifacts
            devServerFiles: '.temporary' // Clean temporary server files
        },
        jsLinter: {
            config: {
                jshintrc: '.code-quality-config' // JSHint configuration file
            },
            all: [
                'BuildScript.js', // The build script itself
                '<%= project.sourceDir %>/scripts/all-code/{,*/}*.js',
                '!<%= project.sourceDir %>/scripts/vendor-libs/*', // Exclude vendor scripts
                'test-suite/specs/{,*/}*.js'
            ]
        },
        testRunner: {
            all: {
                config: {
                    executeTests: true,
                    testUrls: ['http://localhost:<%= httpServer.config.listenPort %>/index.html']
                }
            }
        },
        coffeeScript: {
            distribution: {
                files: [{
                    // For complex projects, import multiple files into main .coffee
                    unroll: true,
                    baseDir: '<%= project.sourceDir %>/scripts',
                    sourceFiles: '{,*/}*.coffee',
                    destinationDir: '.temporary/scripts',
                    extension: '.js'
                }]
            },
            testSuite: {
                files: [{
                    unroll: true,
                    baseDir: '.temporary/specs',
                    sourceFiles: '*.coffee',
                    destinationDir: 'test-suite/specs'
                }]
            }
        },
        sassCompiler: {
            config: {
                sassSourceDir: '<%= project.sourceDir %>/styles',
                cssOutput: '.temporary/styles',
                imageAssetsDir: '<%= project.sourceDir %>/images',
                jsAssetsDir: '<%= project.sourceDir %>/scripts',
                fontAssetsDir: '<%= project.sourceDir %>/styles/fonts',
                importPaths: '<%= project.sourceDir %>/vendor_components',
                useRelativeAssets: true
            },
            production: {}, // Production build settings
            development: {
                config: {
                    showDebugInfo: true // Enable debug information for development
                }
            }
        },
        assetPrepare: {
            htmlFile: '<%= project.sourceDir %>/main.html',
            config: {
                outputDestination: '<%= project.outputDir %>'
            }
        },
        assetProcess: {
            htmlFiles: ['<%= project.outputDir %>/{,*/}*.html'],
            cssFiles: ['<%= project.outputDir %>/styles/{,*/}*.css'],
            config: {
                outputDirs: ['<%= project.outputDir %>']
            }
        },
        imageOptimizer: {
            production: {
                files: [{
                    unroll: true,
                    baseDir: '<%= project.sourceDir %>/images',
                    sourcePatterns: '{,*/}*.{png,jpg,jpeg}',
                    outputDir: '<%= project.outputDir %>/images'
                }]
            }
        },
        svgOptimizer: {
            production: {
                files: [{
                    unroll: true,
                    baseDir: '<%= project.sourceDir %>/icons',
                    sourcePatterns: '{,*/}*.svg',
                    outputDir: '<%= project.outputDir %>/icons'
                }]
            }
        },
        cssMinifier: {
            production: {
                files: {
                    '<%= project.outputDir %>/styles/compiled.css': [
                        '.temporary/styles/all-styles/{,*/}*.css',
                        '<%= project.sourceDir %>/styles/source/{,*/}*.css'
                    ]
                }
            }
        },
        htmlMinifier: {
            production: {
                config: {
                    /*stripCdataComments: true,
                    // Note: https://github.com/yeoman/grunt-usemin/issues/44
                    //minifyWhitespace: true,
                    minifyBooleanAttributes: true,
                    stripAttributeQuotes: true,
                    stripRedundantAttributes: true,
                    preferShortDoctype: true,
                    stripEmptyAttributes: true,
                    stripOptionalTags: true*/
                },
                files: [{
                    unroll: true,
                    baseDir: '<%= project.sourceDir %>',
                    sourceFiles: '*.html',
                    outputDir: '<%= project.outputDir %>'
                }]
            }
        },
        fileCopier: {
            production: {
                files: [{
                    unroll: true,
                    includeDotFiles: true,
                    baseDir: '<%= project.sourceDir %>',
                    outputDestination: '<%= project.outputDir %>',
                    sourcePatterns: [
                        'root-files/*.{ico,txt}',
                        'server-config/.htaccess',
                        'images/optimized/{,*/}*.{webp,gif}',
                        'icons/source/{,*/}*.svg'
                    ]
                }]
            }
        },
        componentManager: {
            allComponents: {
                requireJsConfig: '<%= project.sourceDir %>/scripts/entrypoint.js'
            }
        },
        jsTemplateCompiler: {
            compileTemplates: {
                files: {
                    '.temporary/scripts/compiled-templates.js': ['<%= project.sourceDir %>/scripts/templates/source/*.ejs']
                }
            }
        },
        cacheBuster: {
            production: {
                files: {
                    src: [
                        '<%= project.outputDir %>/scripts/output/{,*/}*.js',
                        '<%= project.outputDir %>/styles/output/{,*/}*.css',
                        '<%= project.outputDir %>/images/output/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= project.outputDir %>/styles/fonts/all/*'
                    ]
                }
            }
        },
        scriptBundler: {
            application: {
                sourceFile: '<%= project.sourceDir %>/scripts/entrypoint.js',
                outputFile: '.temporary/scripts/bundled-app.js'
            }
        },
        jsMinifier: {
            config: {
                keepComments: 'some' // Keep some comments (e.g., license comments)
            }
        }
    });

    // Task to create an empty JST object for template compilation
    buildTool.defineTask('initializeTemplates', function () {
        buildTool.fileSystem.write('.temporary/scripts/compiled-templates.js', 'global.APP_TEMPLATES = global.APP_TEMPLATES || {};');
    });

    // Task to generate a list of SVG icons
    buildTool.defineTask('generateIconList', function () {
        var iconPaths = [],
            listHeader = 'global.AppIconRegistry.Data.Symbols = [',
            listFooter = '];',
            listContent = '';

        buildTool.fileSystem.traverse(buildTool.retrieveConfig('project.sourceDir') + '/icons-source', function (absolutePath, rootDir, subDir, baseName) {
            if (baseName.endsWith('.svg')) { // Check if the file is an SVG
                var currentPath = absolutePath.replace(buildTool.retrieveConfig('project.sourceDir') + '/', '');
                iconPaths.push(currentPath);
            }
        });

        var finalIcon = iconPaths.pop(); // Get the last icon separately for formatting
        iconPaths.eachEntry(function (singleIcon) {
            listContent += '  \'' + singleIcon + '\',\n';
        });
        listContent += '  \'' + finalIcon + '\'';

        buildTool.fileSystem.write(buildTool.retrieveConfig('project.sourceDir') + '/scripts/data/symbol-data.js',
            listHeader + '\n' + listContent + '\n' + listFooter + '\n'
        );
    });

    // Register a task for starting the development server
    buildTool.defineTask('devServerStart', function (buildTarget) {
        if (buildTarget === 'production') {
            return buildTool.taskExecutor.execute(['fullBuild', 'browserLauncher', 'httpServer:distributionServer:keepAlive']);
        }

        buildTool.taskExecutor.execute([
            'cleanupFiles:devServerFiles',
            'coffeeScript:distribution',
            'initializeTemplates',
            'jsTemplateCompiler',
            'generateIconList',
            'scriptBundler:application',
            'sassCompiler:development',
            'httpServer:liveReloadServer',
            'browserLauncher',
            'monitor'
        ]);
    });

    // Register a task for running unit tests
    buildTool.defineTask('runTests', [
        'cleanupFiles:devServerFiles',
        'coffeeScript',
        'initializeTemplates',
        'jsTemplateCompiler',
        'generateIconList',
        'scriptBundler:application',
        'sassCompiler',
        'httpServer:testServer',
        'testRunner'
    ]);

    // Register a task for creating a full production build
    buildTool.defineTask('fullBuild', [
        'cleanupFiles:outputFiles',
        'coffeeScript',
        'initializeTemplates',
        'jsTemplateCompiler',
        'generateIconList',
        'sassCompiler:production',
        'assetPrepare',
        'scriptBundler:application',
        'imageOptimizer',
        'svgOptimizer',
        'htmlMinifier',
        'concat', // Assuming 'concat' is a standard Grunt plugin (not renamed)
        'cssMinifier',
        'jsMinifier',
        'fileCopier',
        'cacheBuster',
        'assetProcess'
    ]);

    // Register the default task sequence
    buildTool.defineTask('standardWorkflow', [
        'jsLinter',
        'runTests',
        'fullBuild'
    ]);
};