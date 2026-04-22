module.exports = function(environmentProcessor) {

    const resourceFetcher = {
        obtainData: (pathIdentifier) => {
            if (pathIdentifier === 'package.json') {
                return {
                    name: 'project-application',
                    version: '0.1.0',
                    description: 'A sample project configuration'
                };
            }
            return {};
        }
    };

    class SystemBlueprint {
        constructor() {
            this.componentSettings = {};
            this.activeExtensions = [];
            this.operationalSequences = {};
        }

        establishSettings(settingsProducer) {
            this.componentSettings = settingsProducer(this.componentSettings, resourceFetcher.obtainData);
            return this;
        }

        integrateModules(...moduleNames) {
            this.activeExtensions.push(...moduleNames);
            return this;
        }

        defineWorkflows(sequenceName, operationsArray) {
            this.operationalSequences[sequenceName] = operationsArray;
            return this;
        }

        applyToEnvironment() {
            environmentProcessor.initializeConfiguration(this.componentSettings);

            this.activeExtensions.forEach(ext => environmentProcessor.loadModule(ext));

            for (const alias in this.operationalSequences) {
                if (Object.prototype.hasOwnProperty.call(this.operationalSequences, alias)) {
                    environmentProcessor.registerExecutionSequence(alias, this.operationalSequences[alias]);
                }
            }
        }
    }

    const configurationBuilder = new SystemBlueprint();

    configurationBuilder.establishSettings((initialSettings, fetcher) => {
        const currentSettings = initialSettings || {};
        const projectMetadata = fetcher('package.json');

        currentSettings.contentAssembler = {
            setup: {
                templateLayout: 'page.hbs',
                layoutDirectory: './source/assemble/templates/layouts/',
                fragmentSources: './source/assemble/templates/partials/**/*.hbs',
                utilityScripts: './source/assemble/templates/helpers/**/*.js'
            },
            development: {
                fileSets: [
                    {
                        basePath: 'source/assemble/content/_pages/',
                        destinationPath: 'build/',
                        recursiveScan: true,
                        flattenHierarchy: true,
                        sourcePatterns: ['**/*.hbs']
                    }
                ]
            },
            production: {
                fileSets: [
                    {
                        basePath: 'source/assemble/content/_pages/',
                        destinationPath: 'dist/',
                        recursiveScan: true,
                        flattenHierarchy: true,
                        sourcePatterns: ['**/*.hbs']
                    }
                ]
            }
        };

        currentSettings.resourceDuplicator = {
            development: {
                basePath: 'source/img/',
                destinationPath: 'build/img/',
                recursiveScan: true,
                sourcePatterns: ['**/*']
            },
            production: {
                basePath: 'source/img/',
                destinationPath: 'dist/img/',
                recursiveScan: true,
                sourcePatterns: ['**/*']
            }
        };

        currentSettings.scriptIncluder = {
            setup: {
                allowDuplicates: false,
                simplifyPaths: true,
                inclusionPattern: /^\/\/\s*import\s+['"]?([^'"]+)['"]?\s*$/
            },
            development: {
                fileSets: [
                    {
                        basePath: 'source/js',
                        destinationPath: 'build/js',
                        recursiveScan: true,
                        outputExtension: '.js',
                        sourcePatterns: ['**/*.js']
                    }
                ]
            },
            production: {
                fileSets: [
                    {
                        basePath: 'source/js',
                        destinationPath: 'dist/js',
                        recursiveScan: true,
                        outputExtension: '.js',
                        sourcePatterns: ['**/*.js']
                    }
                ]
            }
        };

        currentSettings.styleCompiler = {
            setup: {
                debugMode: false,
                forceOverwrite: true,
                noLineIndicators: true,
                outputFormat: 'expanded',
                requiredLibraries: ['sass-globbing', 'compass/import-once', 'susy'],
                sassSourceDirectory: 'source/sass/'
            },
            development: {
                setup: {
                    cssOutputDirectory: 'build/css/',
                    sourceMapEnabled: true
                }
            },
            production: {
                setup: {
                    cssOutputDirectory: 'dist/css/',
                    sourceMapEnabled: false
                }
            }
        };

        currentSettings.cssMinifier = {
            production: {
                basePath: 'dist/css/',
                destinationPath: 'dist/css/',
                recursiveScan: true,
                sourcePatterns: ['*.css']
            }
        };

        currentSettings.jsMinifier = {
            mainBundle: {
                outputFiles: {
                    'dist/js/main.js': ['dist/js/main.js'],
                }
            }
        };

        currentSettings.fileSynchronizer = {
            javascriptAssets: {
                fileSets: [
                    {
                        basePath: 'source/js/',
                        destinationPath: 'build/js/',
                        sourcePatterns: ['**/*']
                    }
                ]
            }
        };

        currentSettings.fileMonitor = {
            setup: {
                liveReloadEnabled: true
            },
scssChanges: {
                trackedFiles: ['source/sass/**/*.scss'],
                actionsToPerform: ['styleCompiler']
            },
            jsChanges: {
                trackedFiles: ['source/js/**/*.js'],
                actionsToPerform: ['scriptIncluder:development', 'fileSynchronizer']
            },
            templateChanges: {
                trackedFiles: ['source/assemble/**/*.{json,hbs}'],
                actionsToPerform: ['contentAssembler:development']
            }
        };

        currentSettings.webServer = {
            localServer: {
                setup: {
                    portNumber: 8000,
                    rootDirectory: './build/'
                }
            }
        };

        return currentSettings;
    });

    configurationBuilder
        .integrateModules('assemblePlugin')
        .integrateModules('dataSynchronizer')
        .integrateModules('newlyModifiedChecker')
        .integrateModules('codeIncluder')
        .integrateModules('prefixApplier')
        .integrateModules('sassProcessor')
        .integrateModules('compassProcessor')
        .integrateModules('cssCompressionTool')
        .integrateModules('jsMinificationTool')
        .integrateModules('connectionManager')
        .integrateModules('fileChangeWatcher')
        .integrateModules('resourceCopier');

    configurationBuilder
        .defineWorkflows('standard', ['construct'])
        .defineWorkflows('construct', [
            'newlyModifiedChecker:contentAssembler:development',
            'styleCompiler:development',
            'scriptIncluder:development',
            'resourceDuplicator:development',
            'webServer',
            'fileSynchronizer',
            'fileMonitor'
        ])
        .defineWorkflows('deploy', [
            'newlyModifiedChecker:contentAssembler:production',
            'styleCompiler:production',
            'cssMinifier:production',
            'scriptIncluder:production',
            'resourceDuplicator:production',
            'jsMinifier'
        ]);

    configurationBuilder.applyToEnvironment();
};