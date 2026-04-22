module.exports = function (buildSystemAPI) {
    const refreshGatewayPort = 35729;
    const hotReloadInjector = require('connect-livereload')({ connectorPort: refreshGatewayPort });
    const staticContentHandler = function (connection, locationPath) {
        return connection.static(require('path').resolve(locationPath));
    };

    const pluginSetupAgent = function(pattern, context) {
        require('matchdep').filterDev(pattern).forEach(context.loadNpmTasks);
    };
    pluginSetupAgent('grunt-*', buildSystemAPI);

    const projectSpace = {
        sourceApp: 'app',
        outputDist: 'dist'
    };

    buildSystemAPI.configManager({
        applicationLayout: projectSpace,
        fileMonitor: {
            coffeeScripts: {
                sourceFiles: ['<%= applicationLayout.sourceApp %>/scripts/**/*.coffee'],
                taskSequence: ['compileCoffee:distribute', 'bundleScripts']
            },
            coffeeTests: {
                sourceFiles: ['test/spec/{,*/}*.coffee'],
                taskSequence: ['compileCoffee:testSuite']
            },
            scssStyles: {
                sourceFiles: ['<%= applicationLayout.sourceApp %>/styles/{,*/}*.{scss,sass}'],
                taskSequence: ['processStyles:developmentServer']
            },
            templateRender: {
                sourceFiles: '<%= applicationLayout.sourceApp %>/templates/**/*.hbs',
                taskSequence: ['renderTemplates']
            },
            markupConvert: {
                sourceFiles: '<%= applicationLayout.sourceApp %>/templates/**/*.md',
                taskSequence: ['convertMarkup']
            },
            autoReload: {
                configSettings: {
                    reloadPort: refreshGatewayPort
                },
                watchedItems: [
                    '<%= applicationLayout.sourceApp %>/*.html',
                    '{.tmp,<%= applicationLayout.sourceApp %>}/styles/{,*/}*.css',
                    '{.tmp,<%= applicationLayout.sourceApp %>}/scripts/{,*/}*.js',
                    '<%= applicationLayout.sourceApp %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        webService: {
            serviceOptions: {
                hostPort: 9000,
                accessHost: 'localhost'
            },
            liveService: {
                serviceOptions: {
                    middleware: function (connection) {
                        return [
                            hotReloadInjector,
                            staticContentHandler(connection, '.tmp'),
                            staticContentHandler(connection, projectSpace.sourceApp)
                        ];
                    }
                }
            },
            testService: {
                serviceOptions: {
                    middleware: function (connection) {
                        return [
                            staticContentHandler(connection, '.tmp'),
                            staticContentHandler(connection, 'test')
                        ];
                    }
                }
            },
            distributionService: {
                serviceOptions: {
                    middleware: function (connection) {
                        return [
                            staticContentHandler(connection, projectSpace.outputDist)
                        ];
                    }
                }
            }
        },
        browserOpener: {
            appServer: {
                targetAddress: 'http://localhost:<%= webService.serviceOptions.hostPort %>'
            }
        },
        cleanupProcess: {
            outputDirectory: {
                filePattern: [{
                    includeHidden: true,
                    sources: [
                        '.tmp',
                        '<%= applicationLayout.outputDist %>/*',
                        '!<%= applicationLayout.outputDist %>/.git*'
                    ]
                }]
            },
            temporaryServer: '.tmp'
        },
        jsCodeQuality: {
            checkOptions: {
                configFileName: '.jshintrc'
            },
            allSources: [
                'buildSystemConfig.js',
                '<%= applicationLayout.sourceApp %>/scripts/{,*/}*.js',
                '!<%= applicationLayout.sourceApp %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        testExecution: {
            allCases: {
                executionOptions: {
                    runTests: true,
                    testUrls: ['http://localhost:<%= webService.serviceOptions.hostPort %>/index.html']
                }
            }
        },
        compileCoffee: {
            distribute: {
                fileMapping: [{
                    expandPath: true,
                    baseDirectory: '<%= applicationLayout.sourceApp %>/scripts',
                    sourcePattern: '**/*.coffee',
                    targetDirectory: '.tmp/scripts',
                    outputFormat: '.js'
                }]
            },
            testSuite: {
                fileMapping: [{
                    expandPath: true,
                    baseDirectory: 'test/spec',
                    sourcePattern: '{,*/}*.coffee',
                    targetDirectory: '.tmp/spec',
                    outputFormat: '.js'
                }]
            }
        },
        processStyles: {
            styleOptions: {
                sassSourceDir: '<%= applicationLayout.sourceApp %>/styles',
                cssTargetDir: '.tmp/styles',
                generatedImageDir: '.tmp/images/generated',
                imageSourceDir: '<%= applicationLayout.sourceApp %>/images',
                jsSourceDir: '<%= applicationLayout.sourceApp %>/scripts',
                fontSourceDir: '<%= applicationLayout.sourceApp %>/styles/fonts',
                importBaseDir: '<%= applicationLayout.sourceApp %>/bower_components',
                httpImagesBase: '/images',
                httpGenImagesBase: '/images/generated',
                httpFontsBase: '/styles/fonts',
                relativeAssetsFlag: false
            },
            production: {},
            developmentServer: {
                styleOptions: {
                    debugInfoFlag: true
                }
            }
        },
        concatenator: {
            output: {}
        },
        javascriptMinifier: {
            output: {}
        },
        assetRevisioner: {
            output: {
                fileSources: {
                    list: [
                        '<%= applicationLayout.outputDist %>/scripts/{,*/}*.js',
                        '<%= applicationLayout.outputDist %>/styles/{,*/}*.css',
                        '<%= applicationLayout.outputDist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= applicationLayout.outputDist %>/styles/fonts/*'
                    ]
                }
            }
        },
        assetPipePreparation: {
            prepOptions: {
                targetDir: '<%= applicationLayout.outputDist %>'
            },
            htmlInputFile: '<%= applicationLayout.sourceApp %>/index.html'
        },
        assetPipeApplication: {
            applyOptions: {
                targetDirs: ['<%= applicationLayout.outputDist %>']
            },
            htmlFiles: ['<%= applicationLayout.outputDist %>/{,*/}*.html'],
            cssFiles: ['<%= applicationLayout.outputDist %>/styles/{,*/}*.css']
        },
        imageOptimization: {
            output: {
                fileMapping: [{
                    expandPath: true,
                    baseDirectory: '<%= applicationLayout.sourceApp %>/images',
                    sourcePattern: '{,*/}*.{png,jpg,jpeg}',
                    targetDirectory: '<%= applicationLayout.outputDist %>/images'
                }]
            }
        },
        svgOptimization: {
            output: {
                fileMapping: [{
                    expandPath: true,
                    baseDirectory: '<%= applicationLayout.sourceApp %>/images',
                    sourcePattern: '{,*/}*.svg',
                    targetDirectory: '<%= applicationLayout.outputDist %>/images'
                }]
            }
        },
        styleMinifier: {
        },
        htmlMinify: {
            output: {
                fileMapping: [{
                    expandPath: true,
                    baseDirectory: '<%= applicationLayout.sourceApp %>',
                    sourcePattern: '*.html',
                    targetDirectory: '<%= applicationLayout.outputDist %>'
                }]
            }
        },
        fileCopyOperation: {
            output: {
                fileMapping: [{
                    expandPath: true,
                    includeHidden: true,
                    baseDirectory: '<%= applicationLayout.sourceApp %>',
                    targetDirectory: '<%= applicationLayout.outputDist %>',
                    sourcePattern: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/*'
                    ]
                }, {
                    expandPath: true,
                    baseDirectory: '.tmp/images',
                    targetDirectory: '<%= applicationLayout.outputDist %>/images',
                    sourcePattern: [
                        'generated/*'
                    ]
                }]
            },
            uncompressed: {
                fileMapping: [{
                    expandPath: true,
                    sourcePattern: ['<%= applicationLayout.outputDist %>/js/bs-*.min.js'],
                    outputFormat: '.max.js'
                }]
            }
        },
        multiTaskExecutor: {
            devServer: [
                'processStyles',
                'convertMarkup',
                'renderTemplates',
                'compileCoffee:distribute'
            ],
            testSuite: [
                'compileCoffee'
            ],
            distBuild: [
                'compileCoffee',
                'convertMarkup',
                'renderTemplates',
                'processStyles',
                'imageOptimization',
                'svgOptimization',
                'htmlMinify'
            ]
        },
        renderTemplates: {
            componentRendering: {
                renderOptions: {
                    templateNameGenerator: function(filePath) {
                        return filePath.substring(filePath.lastIndexOf('/components/')+1,filePath.length);
                    },
                    templateNamespace: "Ember.TEMPLATES"
                },
                outputMap: {
                    '.tmp/scripts/bs-core.js': '<%= applicationLayout.sourceApp %>/templates/views/item-pane.hbs',
                    '.tmp/scripts/bs-basic.js': [
                        '<%= applicationLayout.sourceApp %>/templates/components/bs-page-header.hbs',
                        '<%= applicationLayout.sourceApp %>/templates/components/bs-well.hbs',
                        '<%= applicationLayout.sourceApp %>/templates/components/bs-panel.hbs',
                    ],
                    '.tmp/scripts/bs-alert.js': '<%= applicationLayout.sourceApp %>/templates/components/bs-alert.hbs',
                    '.tmp/scripts/bs-label.js': '<%= applicationLayout.sourceApp %>/templates/components/bs-label.hbs',
                    '.tmp/scripts/bs-badge.js': '<%= applicationLayout.sourceApp %>/templates/components/bs-badge.hbs',
                    '.tmp/scripts/bs-button.js': '<%= applicationLayout.sourceApp %>/templates/components/bs-button.hbs',
                    '.tmp/scripts/bs-btn-toolbar.js': '<%= applicationLayout.sourceApp %>/templates/components/bs-btn-toolbar.hbs',
                    '.tmp/scripts/bs-progressbar.js': [
                        '<%= applicationLayout.sourceApp %>/templates/components/bs-progress.hbs',
                        '<%= applicationLayout.sourceApp %>/templates/components/bs-progressbar.hbs'
                        ],
                    '.tmp/scripts/bs-pills.js': '<%= applicationLayout.sourceApp %>/templates/components/bs-pills.hbs',
                    '.tmp/scripts/bs-modal.js': '<%= applicationLayout.sourceApp %>/templates/components/bs-modal.hbs'
                }
            },
            showcaseRendering: {
                renderOptions: {
                    templateNameGenerator: function(filePath) {
                        return filePath.substring(filePath.lastIndexOf('/showcase/')+1,filePath.length).replace('showcase/', '');
                    },
                    templateNamespace: "Ember.TEMPLATES"
                },
                outputMap: {
                    '.tmp/scripts/showcase-templates.js': '<%= applicationLayout.sourceApp %>/templates/showcase/**/*.hbs'
                }
            }
        },
        convertMarkup: {
            allMarkups: {
                fileSpecs: [
                    {
                        expandPath: true,
                        sourcePattern: '<%= applicationLayout.sourceApp %>/templates/showcase/show_components/*.md',
                        targetDirectory: '',
                        outputFormat: '.hbs'
                    }
                ],
                conversionOptions: {
                    templatePath: '<%= applicationLayout.sourceApp %>/templates/showcase/show_components/template.jst',
                    postProcessing: function(contentData, contextData) {
                        let processedContent = contentData.replace(/\\{\\{/g,"&#123;&#123;");
                        processedContent = processedContent.replace(/\\}\\}/g,"&#125;&#125;");
                        processedContent = processedContent.replace(/\&quot\;/g,'"');
                        console.log(processedContent);
                        return processedContent;
                    },
                    markupSettings: {
                        gfmEnabled: true,
                        codeLineStyling: {
                            beforeTag: '<span>',
                            afterTag: '</span>'
                        }
                    }
                }
            }
        },
        bundleScripts: {
            showcaseBundle: {
                bundleOptions: {
                    pathTransformer: function (inputPath) {
                        return '.tmp/' + inputPath;
                    }
                },
                inputSource: '.tmp/scripts/showcase.js',
                outputDestination: '.tmp/scripts/showcase-scripts.js'
            }
        }
    });

    buildSystemAPI.defineProcedure('initiateServer', function (modeIdentifier) {
        if (modeIdentifier === 'distribution') {
            return buildSystemAPI.executeTasks(['createDistribution', 'browserOpener', 'webService:distributionService:keepalive']);
        }

        buildSystemAPI.executeTasks([
            'cleanupProcess:temporaryServer',
            'multiTaskExecutor:devServer',
            'bundleScripts:showcaseBundle',
            'webService:liveService',
            'fileMonitor'
        ]);
    });

    buildSystemAPI.defineProcedure('runUnitTests', [
        'cleanupProcess:temporaryServer',
        'multiTaskExecutor:testSuite',
        'webService:testService'
    ]);

    buildSystemAPI.defineProcedure('createDistribution', [
        'cleanupProcess:outputDirectory',
        'assetPipePreparation',
        'multiTaskExecutor:distBuild',
        'bundleScripts',
        'concatenator',
        'fileCopyOperation:uncompressed',
        'styleMinifier',
        'javascriptMinifier',
        'fileCopyOperation:output',
        'assetRevisioner',
        'assetPipeApplication'
    ]);

    buildSystemAPI.defineProcedure('defaultActions', [
        'runUnitTests',
        'createDistribution'
    ]);
};