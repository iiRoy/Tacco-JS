'use strict';

module.exports = function (assembler) {
    const REFRESH_GATE_NUMBER = 35729;
    
    const refreshInjector = require('connect-livereload')({ port: REFRESH_GATE_NUMBER });

    const servePath = (hostConnector, directoryName) => {
        return hostConnector.static(require('path').resolve(directoryName));
    };

    const taskLoader = require('matchdep').filterDev('grunt-*');
    taskLoader.forEach(taskName => assembler.loadNpmTasks(taskName));

    const projectStructure = {
        sourceRoot: 'app',
        outputTarget: 'dist'
    };

    const configurationEnvelope = {};

    configurationEnvelope.projectStructure = projectStructure;

    configurationEnvelope.monitorFiles = {
        options: {
            nospawn: true,
            livereload: true
        },
        beanScriptValidation: {
            files: ['test/spec/{,*/}*.coffee'],
            tasks: ['beanBrew:testing']
        },
        styleCompiler: {
            files: [`<%= projectStructure.sourceRoot %>/styles/{,*/}*.{scss,sass}`],
            tasks: ['directionFinder']
        },
        liveRefresh: {
            options: {
                livereload: REFRESH_GATE_NUMBER
            },
            files: [
                `<%= projectStructure.sourceRoot %>/*.html`,
                `{.tmp,<%= projectStructure.sourceRoot %>}/styles/{,*/}*.css`,
                `{.tmp,<%= projectStructure.sourceRoot %>}/scripts/{,*/}*.js`,
                `<%= projectStructure.sourceRoot %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}`
            ]
        },
        templateProcessor: {
            files: [
                `<%= projectStructure.sourceRoot %>/scripts/templates/*.ejs`
            ],
            tasks: ['templateCompiler']
        },
        moduleBinder: {
            files: ['{.tmp,<%= projectStructure.sourceRoot %>}/scripts/{,*/}*.{js,coffee}'],
            tasks: ['beanBrew:output', 'moduleBinder']
        }
    };

    configurationEnvelope.webHost = {
        options: {
            port: 9000,
            hostname: 'localhost'
        },
        liveServer: {
            options: {
                middleware: (hostConnector) => {
                    const middlewareComponents = [];
                    middlewareComponents.push(refreshInjector);
                    middlewareComponents.push(servePath(hostConnector, '.tmp'));
                    middlewareComponents.push(servePath(hostConnector, projectStructure.sourceRoot));
                    return middlewareComponents;
                }
            }
        },
        testServer: {
            options: {
                middleware: (hostConnector) => {
                    const handlerSequence = [];
                    handlerSequence.push(servePath(hostConnector, '.tmp'));
                    handlerSequence.push(servePath(hostConnector, 'test'));
                    handlerSequence.push(servePath(hostConnector, projectStructure.sourceRoot));
                    return handlerSequence;
                }
            }
        },
        productionServer: {
            options: {
                middleware: (hostConnector) => {
                    return [servePath(hostConnector, projectStructure.outputTarget)];
                }
            }
        }
    };

    configurationEnvelope.browserLauncher = {
        server: {
            path: 'http://localhost:<%= webHost.options.port %>'
        }
    };

    configurationEnvelope.purify = {
        output: ['.tmp', '<%= projectStructure.outputTarget %>/*'],
        developmentCache: '.tmp'
    };

    configurationEnvelope.codeReview = {
        options: {
            jshintrc: '.jshintrc'
        },
        entireProject: [
            'Gruntfile.js',
            `<%= projectStructure.sourceRoot %>/scripts/{,*/}*.js`,
            `!<%= projectStructure.sourceRoot %>/scripts/vendor/*`,
            'test/spec/{,*/}*.js'
        ]
    };

    configurationEnvelope.testRunner = {
        all: {
            options: {
                run: true,
                urls: ['http://localhost:<%= webHost.options.port %>/index.html']
            }
        }
    };

    configurationEnvelope.beanBrew = {
        output: {
            files: [{
                expand: true,
                cwd: '<%= projectStructure.sourceRoot %>/scripts',
                src: '{,*/}*.coffee',
                dest: '.tmp/scripts',
                ext: '.js'
            }]
        },
        testing: {
            files: [{
                expand: true,
                cwd: '.tmp/spec',
                src: '*.coffee',
                dest: 'test/spec'
            }]
        }
    };

    configurationEnvelope.directionFinder = {
        options: {
            sassDir: '<%= projectStructure.sourceRoot %>/styles',
            cssDir: '.tmp/styles',
            imagesDir: '<%= projectStructure.sourceRoot %>/images',
            javascriptsDir: '<%= projectStructure.sourceRoot %>/scripts',
            fontsDir: '<%= projectStructure.sourceRoot %>/styles/fonts',
            importPath: '<%= projectStructure.sourceRoot %>/bower_components',
            relativeAssets: true
        },
        finalOutput: {},
        devServer: {
            options: {
                debugInfo: true
            }
        }
    };

    configurationEnvelope.assetBundlerSetup = {
        htmlSource: '<%= projectStructure.sourceRoot %>/index.html',
        options: {
            dest: '<%= projectStructure.outputTarget %>'
        }
    };

    configurationEnvelope.assetBundlerFinalize = {
        markupFiles: [`<%= projectStructure.outputTarget %>/{,*/}*.html`],
        styleSheets: [`<%= projectStructure.outputTarget %>/styles/{,*/}*.css`],
        options: {
            dirs: [`<%= projectStructure.outputTarget %>`]
        }
    };

    configurationEnvelope.imageCompressor = {
        output: {
            files: [{
                expand: true,
                cwd: '<%= projectStructure.sourceRoot %>/images',
                src: '{,*/}*.{png,jpg,jpeg}',
                dest: '<%= projectStructure.outputTarget %>/images'
            }]
        }
    };

    configurationEnvelope.vectorCompressor = {
        output: {
            files: [{
                expand: true,
                cwd: '<%= projectStructure.sourceRoot %>/icons',
                src: '{,*/}*.svg',
                dest: '<%= projectStructure.outputTarget %>/icons'
            }]
        }
    };

    configurationEnvelope.styleMinifier = {
        output: {
            files: {
                '<%= projectStructure.outputTarget %>/styles/main.css': [
                    '.tmp/styles/{,*/}*.css',
                    '<%= projectStructure.sourceRoot %>/styles/{,*/}*.css'
                ]
            }
        }
    };

    configurationEnvelope.markupMinifier = {
        output: {
            options: {
                // Original commented options:
                /*removeCommentsFromCDATA: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true*/
            },
            files: [{
                expand: true,
                cwd: '<%= projectStructure.sourceRoot %>',
                src: '*.html',
                dest: '<%= projectStructure.outputTarget %>'
            }]
        }
    };

    configurationEnvelope.fileDuplicator = {
        output: {
            files: [{
                expand: true,
                dot: true,
                cwd: '<%= projectStructure.sourceRoot %>',
                dest: '<%= projectStructure.outputTarget %>',
                src: [
                    '*.{ico,txt}',
                    '.htaccess',
                    'images/{,*/}*.{webp,gif}',
                    'icons/{,*/}*.svg'
                ]
            }]
        }
    };

    configurationEnvelope.packageResolver = {
        all: {
            rjsConfig: '<%= projectStructure.sourceRoot %>/scripts/main.js'
        }
    };

    configurationEnvelope.templateCompiler = {
        compilation: {
            files: {
                '.tmp/scripts/templates.js': [`<%= projectStructure.sourceRoot %>/scripts/templates/*.ejs`]
            }
        }
    };

    configurationEnvelope.assetReviser = {
        output: {
            files: {
                src: [
                    `<%= projectStructure.outputTarget %>/scripts/{,*/}*.js`,
                    `<%= projectStructure.outputTarget %>/styles/{,*/}*.css`,
                    `<%= projectStructure.outputTarget %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}`,
                    `<%= projectStructure.outputTarget %>/styles/fonts/*`
                ]
            }
        }
    };

    configurationEnvelope.moduleBinder = {
        appEntry: {
            src: '<%= projectStructure.sourceRoot %>/scripts/main.js',
            dest: '.tmp/scripts/combined-scripts.js'
        }
    };

    configurationEnvelope.scriptMinifier = {
        options: {
            preserveComments: 'some'
        }
    };

    assembler.initConfig(configurationEnvelope);

    assembler.registerTask('initializeTemplatePlaceholder', function () {
        assembler.file.write('.tmp/scripts/templates.js', 'this.JST = this.JST || {};');
    });
    
    assembler.registerTask('generateIconManifest', function() {
        const graphicList = [];
        const startMarker = 'window.openSpendingIcons.Data.Icons = [';
        const endMarker = '];';
        
        const iconDirectory = assembler.config.get('projectStructure.sourceRoot') + '/icons';
        
        assembler.file.recurse(iconDirectory, function(absolutePath, baseDir, subDir, fileName) {
            if (fileName.match(/\.svg$/)) {
                const relativePath = absolutePath.replace(assembler.config.get('projectStructure.sourceRoot') + '/', '');
                graphicList.push(`  '${relativePath}'`);
            }
        });
        
        const contentBlock = graphicList.length > 0 ? graphicList.join(',\n') : '';
        
        assembler.file.write(
            assembler.config.get('projectStructure.sourceRoot') + '/scripts/data/icons.js',
            `${startMarker}\n${contentBlock}\n${endMarker}\n`
        );
    });

    assembler.registerTask('launchDev', function (operationTarget) {
        if (operationTarget === 'output') {
            return assembler.task.run(['packageApp', 'browserLauncher', 'webHost:productionServer:keepalive']);
        }

        assembler.task.run([
            'purify:developmentCache',
            'beanBrew:output',
            'initializeTemplatePlaceholder',
            'templateCompiler',
            'generateIconManifest',
            'moduleBinder:appEntry',
            'directionFinder:devServer',
            'webHost:liveServer',
            'browserLauncher',
            'monitorFiles'
        ]);
    });

    assembler.registerTask('validateCode', [
        'purify:developmentCache',
        'beanBrew',
        'initializeTemplatePlaceholder',
        'templateCompiler',
        'generateIconManifest',
        'moduleBinder:appEntry',
        'directionFinder',
        'webHost:testServer',
        'testRunner'
    ]);

    assembler.registerTask('packageApp', [
        'purify:output',
        'beanBrew',
        'initializeTemplatePlaceholder',
        'templateCompiler',
        'generateIconManifest',
        'directionFinder:finalOutput',
        'assetBundlerSetup',
        'moduleBinder:appEntry',
        'imageCompressor',
        'vectorCompressor',
        'markupMinifier',
        'concat',
        'styleMinifier',
        'scriptMinifier',
        'fileDuplicator',
        'assetReviser',
        'assetBundlerFinalize'
    ]);

    assembler.registerTask('standardProcess', [
        'codeReview',
        'validateCode',
        'packageApp'
    ]);
};