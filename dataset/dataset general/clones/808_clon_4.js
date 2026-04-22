const externalServiceIntegration = require('grunt-contrib-livereload/lib/utils');
const liveReloadServicePayload = externalServiceIntegration.livereloadSnippet;

const staticResourceHandler = function (connectionManager, baseDirectory) {
    return connectionManager.static(require('path').resolve(baseDirectory));
};

module.exports = function (externalBuildSystemAdapter) {
    let projectRootDesignations = {
        applicationSource: 'app',
        deploymentTarget: 'dist'
    };

    try {
        const projectMetadata = require('./component.json');
        if (projectMetadata && projectMetadata.appPath) {
            projectRootDesignations.applicationSource = projectMetadata.appPath;
        }
    } catch (e) {
        // Error intentionally ignored, as in original
    }

    const masterConfiguration = {
        primaryPaths: projectRootDesignations,
        externalHelpers: {
            liveReloadSnippetContent: liveReloadServicePayload,
            directoryStaticProvider: staticResourceHandler
        },
        moduleConfigurations: {
            fileWatchSystem: {
                coffeeFiles: {
                    patterns: [`${projectRootDesignations.applicationSource}/scripts/{,*/}*.coffee`],
                    actions: ['coffeeProcessor:dist']
                },
                coffeeTests: {
                    patterns: ['test/spec/{,*/}*.coffee'],
                    actions: ['coffeeProcessor:test']
                },
                sassStyles: {
                    patterns: [`${projectRootDesignations.applicationSource}/styles/{,*/}*.{scss,sass}`],
                    actions: ['sassCompiler']
                },
                liveReloadAssets: {
                    patterns: [
                        `${projectRootDesignations.applicationSource}/{,*/}*.html`,
                        `{.tmp,${projectRootDesignations.applicationSource}}/styles/{,*/}*.css`,
                        `{.tmp,${projectRootDesignations.applicationSource}}/scripts/{,*/}*.js`,
                        `${projectRootDesignations.applicationSource}/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}`
                    ],
                    actions: ['refreshBrowser']
                }
            },
            networkServer: {
                defaultSettings: {
                    port: 9000,
                    host: 'localhost'
                },
                liveDevelopment: {
                    settings: {
                        middleware: function (connectionProvider) {
                            return [
                                liveReloadServicePayload,
                                staticResourceHandler(connectionProvider, '.tmp'),
                                staticResourceHandler(connectionProvider, projectRootDesignations.applicationSource)
                            ];
                        }
                    }
                },
                testEnvironment: {
                    settings: {
                        middleware: function (connectionProvider) {
                            return [
                                staticResourceHandler(connectionProvider, '.tmp'),
                                staticResourceHandler(connectionProvider, 'test')
                            ];
                        }
                    }
                }
            },
            browserOpener: {
                developmentServer: {
                    url: `http://localhost:${9000}`
                }
            },
            cleanupUtility: {
                distributionBuild: {
                    items: [{
                        dotfiles: true,
                        sources: [
                            '.tmp',
                            `${projectRootDesignations.deploymentTarget}/*`,
                            `!${projectRootDesignations.deploymentTarget}/.git*`
                        ]
                    }]
                },
                temporaryServer: '.tmp'
            },
            javascriptLinter: {
                options: {
                    config: '.jshintrc'
                },
                allProjectJs: [
                    'Gruntfile.js',
                    `${projectRootDesignations.applicationSource}/scripts/{,*/}*.js`
                ]
            },
            unitTestRunner: {
                testSuite: {
                    configFilePath: 'karma.conf.js',
                    runOnce: true
                }
            },
            coffeeProcessor: {
                dist: {
                    files: [{
                        expand: true,
                        cwd: `${projectRootDesignations.applicationSource}/scripts`,
                        src: '{,*/}*.coffee',
                        dest: '.tmp/scripts',
                        ext: '.js'
                    }]
                },
                test: {
                    files: [{
                        expand: true,
                        cwd: 'test/spec',
                        src: '{,*/}*.coffee',
                        dest: '.tmp/spec',
                        ext: '.js'
                    }]
                }
            },
            sassCompiler: {
                options: {
                    sassDir: `${projectRootDesignations.applicationSource}/styles`,
                    cssDir: '.tmp/styles',
                    imagesDir: `${projectRootDesignations.applicationSource}/images`,
                    javascriptsDir: `${projectRootDesignations.applicationSource}/scripts`,
                    fontsDir: `${projectRootDesignations.applicationSource}/styles/fonts`,
                    importPath: `${projectRootDesignations.applicationSource}/components`,
                    relativeAssets: true
                },
                dist: {},
                server: {
                    options: {
                        debugInfo: true
                    }
                }
            },
            fileConcatenator: {
                dist: {
                    files: {
                        [`${projectRootDesignations.deploymentTarget}/scripts/scripts.js`]: [
                            '.tmp/scripts/{,*/}*.js',
                            `${projectRootDesignations.applicationSource}/scripts/{,*/}*.js`
                        ]
                    }
                }
            },
            assetPreparation: {
                html: `${projectRootDesignations.applicationSource}/index.html`,
                options: {
                    dest: `${projectRootDesignations.deploymentTarget}`
                }
            },
            assetApplication: {
                html: [`${projectRootDesignations.deploymentTarget}/{,*/}*.html`],
                css: [`${projectRootDesignations.deploymentTarget}/styles/{,*/}*.css`],
                options: {
                    dirs: [`${projectRootDesignations.deploymentTarget}`]
                }
            },
            imageOptimizer: {
                dist: {
                    files: [{
                        expand: true,
                        cwd: `${projectRootDesignations.applicationSource}/images`,
                        src: '{,*/}*.{png,jpg,jpeg}',
                        dest: `${projectRootDesignations.deploymentTarget}/images`
                    }]
                }
            },
            cssMinimizer: {
                dist: {
                    files: {
                        [`${projectRootDesignations.deploymentTarget}/styles/main.css`]: [
                            '.tmp/styles/{,*/}*.css',
                            `${projectRootDesignations.applicationSource}/styles/{,*/}*.css`
                        ]
                    }
                }
            },
            htmlMinimizer: {
                dist: {
                    options: {
                        /*removeCommentsFromCDATA: true,
                        // https://github.com/yeoman/grunt-usemin/issues/44
                        //collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        removeAttributeQuotes: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeOptionalTags: true*/
                    },
                    files: [{
                        expand: true,
                        cwd: `${projectRootDesignations.applicationSource}`,
                        src: ['*.html', 'views/*.html'],
                        dest: `${projectRootDesignations.deploymentTarget}`
                    }]
                }
            },
            cdnLinkerTool: {
                dist: {
                    html: [`${projectRootDesignations.deploymentTarget}/*.html`]
                }
            },
            angularJsAnnotator: {
                dist: {
                    files: [{
                        expand: true,
                        cwd: `${projectRootDesignations.deploymentTarget}/scripts`,
                        src: '*.js',
                        dest: `${projectRootDesignations.deploymentTarget}/scripts`
                    }]
                }
            },
            javascriptMinimizer: {
                dist: {
                    files: {
                        [`${projectRootDesignations.deploymentTarget}/scripts/scripts.js`]: [
                            `${projectRootDesignations.deploymentTarget}/scripts/scripts.js`
                        ],
                    }
                }
            },
            cacheRevisioner: {
                dist: {
                    files: {
                        src: [
                            `${projectRootDesignations.deploymentTarget}/scripts/{,*/}*.js`,
                            `${projectRootDesignations.deploymentTarget}/styles/{,*/}*.css`,
                            `${projectRootDesignations.deploymentTarget}/images/{,*/}*.{png,jpg,jpeg,gif,webp}`,
                            `${projectRootDesignations.deploymentTarget}/styles/fonts/*`
                        ]
                    }
                }
            },
            fileDuplicator: {
                dist: {
                    files: [{
                        expand: true,
                        dot: true,
                        cwd: `${projectRootDesignations.applicationSource}`,
                        dest: `${projectRootDesignations.deploymentTarget}`,
                        src: [
                            '*.{ico,txt}',
                            '.htaccess',
                            'components/**/*',
                            'images/{,*/}*.{gif,webp}'
                        ]
                    }]
                }
            }
        },
        taskNameAliases: {
            'observeFiles': 'fileWatchSystem'
        },
        taskSequences: {
            startLiveServer: [
                'cleanupUtility:temporaryServer',
                'coffeeProcessor:dist',
                'sassCompiler:server',
                'startLiveReloadMechanism',
                'networkServer:liveDevelopment',
                'browserOpener',
                'fileWatchSystem'
            ],
            runAllUnitTests: [
                'cleanupUtility:temporaryServer',
                'coffeeProcessor',
                'sassCompiler',
                'networkServer:testEnvironment',
                'unitTestRunner'
            ],
            createProductionBuild: [
                'cleanupUtility:distributionBuild',
                'javascriptLinter',
                'runAllUnitTests',
                'coffeeProcessor',
                'sassCompiler:dist',
                'assetPreparation',
                'imageOptimizer',
                'cssMinimizer',
                'htmlMinimizer',
                'fileConcatenator',
                'fileDuplicator',
                // 'cdnLinkerTool',
                'angularJsAnnotator',
                'javascriptMinimizer',
                'cacheRevisioner',
                'assetApplication'
            ],
            defaultExecution: ['createProductionBuild']
        }
    };

    externalBuildSystemAdapter.applyConfiguration(masterConfiguration);
};