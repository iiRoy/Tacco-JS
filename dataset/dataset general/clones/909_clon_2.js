// Build system configuration, generated on 2024-03-10 using a specialized code generation tool.
'use strict';

// # Asset Pattern Matching
// For optimized performance, we only scan files one level deep:
// 'test_suite/specifications/{*,}.js'
// To include all nested subdirectories, use this recursive pattern:
// 'test_suite/specifications/**/*.js'

exportConfiguration = function (workflowEngine) {

    // Automatically load all necessary workflow engine plugins
    require('load-grunt-tasks')(workflowEngine);

    // Measure how long each task takes. This helps with performance tuning.
    require('time-grunt')(workflowEngine);

    // Customizable directory paths for application source and build output
    let projectSettings = {
        sourceRoot: 'application',
        outputTarget: 'production_dist'
    };

    // Define the full configuration for all build tasks
    workflowEngine.initConfig({

        // Main project directory settings
        configData: projectSettings,

        // Monitors file system for changes and triggers specific actions
        monitorFiles: {
            packageDependencies: {
                filePatterns: ['package.json'],
                actionList: ['packageInstaller']
            },
            scriptFiles: {
                filePatterns: ['<%= configData.sourceRoot %>/scripts/{*,}.js'],
                actionList: ['lintChecker'],
                runOpts: {
                    liveReloadFeature: true
                }
            },
            scriptTests: {
                filePatterns: ['test_suite/specifications/{*,}.js'],
                actionList: ['testProcess:observe']
            },
            engineConfig: {
                filePatterns: ['buildConfig.js']
            },
            styleSheets: {
                filePatterns: ['<%= configData.sourceRoot %>/styles/{*,}.{scss,sass}'],
                actionList: ['scssProcessor:devServer', 'vendorPrefixer']
            },
            cssAssets: {
                filePatterns: ['<%= configData.sourceRoot %>/styles/{*,}.css'],
                actionList: ['updated:fileCopier:styles', 'vendorPrefixer']
            },
            liveReloadHook: {
                runOpts: {
                    liveReloadFeature: '<%= webServer.runOpts.liveReloadFeature %>'
                },
                filePatterns: [
                    '<%= configData.sourceRoot %>/{*,}.html',
                    '.temp_build/styles/{*,}.css',
                    '<%= configData.sourceRoot %>/images/{*,}*'
                ]
            }
        },

        // Web server configurations for development and testing environments
        webServer: {
            runOpts: {
                serverPort: 8080,
                autoOpenBrowser: true,
                liveReloadFeature: 35728,
                // Change this to '0.0.0.0' for external access to the server
                hostAddress: '0.0.0.0'
            },
            liveReloadFeature: {
                runOpts: {
                    httpHandlers: function(connectionUtility) {
                        return [
                            connectionUtility.serveStatic('.temp_build'),
                            connectionUtility().use('/vendor_components', connectionUtility.serveStatic('./vendor_components')),
                            connectionUtility.serveStatic(projectSettings.sourceRoot)
                        ];
                    }
                }
            },
            testProcess: {
                runOpts: {
                    autoOpenBrowser: false,
                    serverPort: 8081,
                    httpHandlers: function(connectionUtility) {
                        return [
                            connectionUtility.serveStatic('.temp_build'),
                            connectionUtility.serveStatic('test_suite'),
                            connectionUtility().use('/vendor_components', connectionUtility.serveStatic('./vendor_components')),
                            connectionUtility.serveStatic(projectSettings.sourceRoot)
                        ];
                    }
                }
            },
            outputTarget: {
                runOpts: {
                    rootDir: '<%= configData.outputTarget %>',
                    liveReloadFeature: false
                }
            }
        },

        // Empties directories to ensure a clean slate before building
        purgeFiles: {
            outputTarget: {
                filePatterns: [{
                    includeHidden: true,
                    sourceFiles: [
                        '.temp_build',
                        '<%= configData.outputTarget %>/*',
                        '!<%= configData.outputTarget %>/.git*'
                    ]
                }]
            },
            devServer: '.temp_build'
        },

        // Ensures code quality and identifies potential errors in JavaScript files
        lintChecker: {
            runOpts: {
                lintRulesFile: '.jslintrc',
                reportGenerator: require('jshint-stylish')
            },
            allSources: [
                'buildConfig.js',
                '<%= configData.sourceRoot %>/scripts/{*,}.js',
                '!<%= configData.sourceRoot %>/scripts/external/*',
                'test_suite/specifications/{*,}.js'
            ]
        },

        // Configuration for the JavaScript testing framework
        testRunner: {
            fullSuite: {
                runOpts: {
                    executeTests: true,
                    testUrls: ['http://<%= webServer.testProcess.runOpts.hostAddress %>:<%= webServer.testProcess.runOpts.serverPort %>/index.html']
                }
            }
        },

        // Compiles SCSS files into CSS and generates necessary files
        scssProcessor: {
            runOpts: {
                importPaths: [
                    'vendor_components'
                ]
            },
            outputTarget: {
                filePatterns: [{
                    expandWildcards: true,
                    currentWorkingDir: '<%= configData.sourceRoot %>/styles',
                    sourceFiles: ['*.scss'],
                    destinationDir: '.temp_build/styles',
                    outputExtension: '.css'
                }]
            },
            devServer: {
                filePatterns: [{
                    expandWildcards: true,
                    currentWorkingDir: '<%= configData.sourceRoot %>/styles',
                    sourceFiles: ['*.scss'],
                    destinationDir: '.temp_build/styles',
                    outputExtension: '.css'
                }]
            }
        },

        // Adds vendor-specific prefixes to CSS properties for broader browser compatibility
        vendorPrefixer: {
            runOpts: {
                targetBrowsers: ['last 2 versions']
            },
            outputTarget: {
                filePatterns: [{
                    expandWildcards: true,
                    currentWorkingDir: '.temp_build/styles/',
                    sourceFiles: '{*,}.css',
                    destinationDir: '.temp_build/styles/'
                }]
            }
        },

        // Automatically injects client-side packages (e.g., from Bower) into the HTML file
        packageInstaller: {
            application: {
                sourceFiles: ['<%= configData.sourceRoot %>/main.html'],
                excludePackages: ['vendor_components/bootstrap-sass-official/dependencies/javascripts/bootstrap.js']
            },
            styles: {
                sourceFiles: ['<%= configData.sourceRoot %>/styles/{*,}.{scss,sass}']
            }
        },

        // Renames files with a hash for effective browser caching (cache busting)
        cacheBuster: {
            outputTarget: {
                filePatterns: {
                    sourceFiles: [
                        '<%= configData.outputTarget %>/scripts/{*,}.js',
                        '<%= configData.outputTarget %>/styles/{*,}.css',
                        '<%= configData.outputTarget %>/images/{*,}*.*',
                        '<%= configData.outputTarget %>/styles/fonts/{*,}*.*',
                        '<%= configData.outputTarget %>/*.{ico,svg}'
                    ]
                }
            }
        },

        // Prepares for asset optimization by identifying blocks in HTML
        optimizePrep: {
            runOpts: {
                destinationDir: '<%= configData.outputTarget %>'
            },
            htmlEntry: '<%= configData.sourceRoot %>/main.html'
        },

        // Performs asset optimizations like concatenation, minification, and revisioning based on HTML blocks
        assetOptimizer: {
            runOpts: {
                assetDirectories: ['<%= configData.outputTarget %>', '<%= configData.outputTarget %>/images']
            },
            htmlContent: ['<%= configData.outputTarget %>/{*,}.html'],
            cssContent: ['<%= configData.outputTarget %>/styles/{*,}.css']
        },

        // Minifies image files to reduce their size
        imageCompressor: {
            outputTarget: {
                filePatterns: [{
                    expandWildcards: true,
                    currentWorkingDir: '<%= configData.sourceRoot %>/images',
                    sourceFiles: '{*,}.{gif,jpeg,jpg,png}',
                    destinationDir: '<%= configData.outputTarget %>/images'
                }]
            }
        },

        // Minifies SVG (Scalable Vector Graphics) files
        vectorCompressor: {
            outputTarget: {
                filePatterns: [{
                    expandWildcards: true,
                    currentWorkingDir: '<%= configData.sourceRoot %>/images',
                    sourceFiles: '{*,}.svg',
                    destinationDir: '<%= configData.outputTarget %>/images'
                }]
            }
        },

        // Minifies HTML files by removing unnecessary characters and whitespace
        htmlCompressor: {
            outputTarget: {
                runOpts: {
                    collapseBooleans: true,
                    collapseWhitespaceChars: true,
                    removeQuoteAttrs: true,
                    stripCdataComments: true,
                    stripEmptyAttrs: true,
                    stripOptionalTags: true,
                    stripRedundantAttrs: true,
                    useConciseDoctype: true
                },
                filePatterns: [{
                    expandWildcards: true,
                    currentWorkingDir: '<%= configData.outputTarget %>',
                    sourceFiles: '{*,}.html',
                    destinationDir: '<%= configData.outputTarget %>'
                }]
            }
        },

        // The following tasks are for minification of CSS and JS, and concatenation.
        // They are typically used within 'assetOptimizer' but can be called directly.
        cssMinifier: {
            outputTarget: {
                filePatterns: {
                    '<%= configData.outputTarget %>/styles/primary.css': [
                        '.temp_build/styles/{*,}.css',
                        '<%= configData.sourceRoot %>/styles/{*,}.css'
                    ]
                }
            }
        },
        jsMinifier: {
            outputTarget: {
                filePatterns: {
                    '<%= configData.outputTarget %>/scripts/bundled.js': [
                        '<%= configData.outputTarget %>/scripts/bundled.js'
                    ]
                }
            }
        },
        concatenateFiles: {
            outputTarget: {}
        },

        // Transfers other necessary files to the build output directory
        fileCopier: {
            outputTarget: {
                filePatterns: [{
                    expandWildcards: true,
                    includeHidden: true,
                    currentWorkingDir: '<%= configData.sourceRoot %>',
                    destinationDir: '<%= configData.outputTarget %>',
                    sourceFiles: [
                        '*.{ico,webp,txt}',
                        '.htaccess',
                        'images/{*,}.gif',
                        '{*,}.html',
                        'styles/fonts/{*,}*.*'
                    ]
                }]
            },
            styles: {
                expandWildcards: true,
                includeHidden: true,
                currentWorkingDir: '<%= configData.sourceRoot %>/styles',
                destinationDir: '.temp_build/styles/',
                sourceFiles: '{*,}.css'
            }
        },

        // Generates a customized Modernizr build that includes only detected features
        featureDetector: {
            outputTarget: {
                developmentFile: 'vendor_components/modernizr/modernizr.js',
                finalOutputFile: '<%= configData.outputTarget %>/scripts/external/modernizr.js',
                filePatterns: {
                    sourceFiles: [
                        '<%= configData.outputTarget %>/scripts/{*,}.js',
                        '<%= configData.outputTarget %>/styles/{*,}.css',
                        '!<%= configData.outputTarget %>/scripts/external/*'
                    ]
                },
                minifyOutput: true
            }
        },

        // Executes multiple tasks in parallel to significantly speed up the build process
        parallelTasks: {
            devServer: [
                'scssProcessor:devServer',
                'fileCopier:styles'
            ],
            testProcess: [
                'fileCopier:styles'
            ],
            outputTarget: [
                'scssProcessor',
                'fileCopier:styles',
                'imageCompressor',
                'vectorCompressor'
            ]
        }
    });


    workflowEngine.registerTask('serveApp', function (executionGoal) {
        if (executionGoal === 'production') {
            return workflowEngine.task.run(['constructArtifacts', 'webServer:outputTarget:keepalive']);
        }

        workflowEngine.task.run([
            'purgeFiles:devServer',
            'parallelTasks:devServer',
            'vendorPrefixer',
            'webServer:liveReloadFeature',
            'monitorFiles'
        ]);
    });

    workflowEngine.registerTask('devServer', function (executionGoal) {
        workflowEngine.log.warn('The `devServer` task has been superseded. Please use `workflowEngine serveApp` to start a development server.');
        workflowEngine.task.run([executionGoal ? ('serveApp:' + executionGoal) : 'serveApp']);
    });

    workflowEngine.registerTask('testProcess', function (executionGoal) {
        if (executionGoal !== 'observe') {
            workflowEngine.task.run([
                'purgeFiles:devServer',
                'parallelTasks:testProcess',
                'vendorPrefixer'
            ]);
        }

        workflowEngine.task.run([
            'webServer:testProcess',
            'testRunner'
        ]);
    });

    workflowEngine.registerTask('constructArtifacts', [
        'purgeFiles:outputTarget',
        'optimizePrep',
        'parallelTasks:outputTarget',
        'vendorPrefixer',
        'concatenateFiles',
        'cssMinifier',
        'jsMinifier',
        'fileCopier:outputTarget',
        'featureDetector',
        'cacheBuster',
        'assetOptimizer',
        'htmlCompressor'
    ]);

    workflowEngine.registerTask('defaultActions', [
        'updated:lintChecker',
        'testProcess',
        'constructArtifacts'
    ]);
};