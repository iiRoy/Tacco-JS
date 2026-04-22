module.exports = (toolkit) => {

    const configureToolkitPlugins = (kit) => {
        require("time-grunt")(kit);
        require('load-grunt-tasks')(kit);
    };

    configureToolkitPlugins(toolkit);

    const projectManifest = toolkit.file.readJSON('package.json');

    const pathConfiguration = {
        app: {
            sourceTS: "scripts",
            testTS: "test",
            styleSource: "less",
            mainJSOutput: "scripts",
            testJSOutput: "test",
            espoweredTestJS: "testEspowered",
            styleOutput: "stylesheets",
            imageOutput: "images"
        }
    };

    const generateTypeScriptProcessorConfig = (paths) => ({
        compilerOptions: {
            executeCompilation: true,
            keepComments: true,
            outputLanguage: 'es5',
            forbidImplicitAny: true,
            createSourceMaps: true,
            tsSourceRoot: '',
            mapOutputRoot: '',
            generateDeclaration: false
        },
        mainApp: {
            inputFiles: [`<%= pathConfiguration.app.sourceTS %>/index.ts`],
            outputFile: `<%= pathConfiguration.app.mainJSOutput %>/index.js`
        },
        testApp: {
            inputFiles: [`<%= pathConfiguration.app.testTS %>/indexSpec.ts`],
            outputFile: `<%= pathConfiguration.app.testJSOutput %>/indexSpec.js`
        }
    });

    const generateLessProcessorConfig = (paths) => ({
        primaryStyles: {
            processorOptions: {
                mapBasePath: `<%= pathConfiguration.app.styleSource %>`,
                generateMap: true,
                includeSourceInMap: true,
                mapRootPath: `../<%= pathConfiguration.app.styleSource %>`
            },
            targetFiles: {
                "<%= pathConfiguration.app.styleOutput %>/main.css": "<%= pathConfiguration.app.styleSource %>/source.less"
            }
        }
    });

    const generateTypeScriptLinterConfig = (paths) => ({
        linterOptions: {
            reportFormat: "prose",
            configSource: toolkit.file.readJSON("tslint.json")
        },
        targetFiles: {
            sourcePatterns: [
                '<%= pathConfiguration.app.sourceTS %>/**/*.ts',
                '<%= pathConfiguration.app.testTS %>/**/*.ts'
            ]
        }
    });

    const generateDocumentationGeneratorConfig = (manifest, paths) => ({
        primaryDocs: {
            generatorOptions: {
                outputDirectory: './docs',
                projectName: `<%= projectManifest.name %>`,
                targetLanguage: `<%= typescriptCompile.compilerOptions.outputLanguage %>`
            },
            sourceFiles: [
                '<%= pathConfiguration.app.sourceTS %>/**/*.ts'
            ]
        }
    });

    const generatePowerAssertTransformerConfig = (paths) => ({
        applicationTests: {
            fileTransforms: [
                {
                    enableExpansion: true,
                    baseDirectory: '<%= pathConfiguration.app.testJSOutput %>/',
                    sourcePatterns: ['**/*.js'],
                    destinationDirectory: '<%= pathConfiguration.app.espoweredTestJS %>/',
                    outputExtension: '.js'
                }
            ]
        }
    });

    const generateFrontendDependencyManagerConfig = () => ({
        performInstall: {
            managerOptions: {
                performInstallation: true,
                copyDependencies: false,
                showDetailedLogs: true,
                cleanupDependencyDir: false
            }
        }
    });

    const generateDependencyInjectorConfig = () => ({
        primaryInjection: {
            targetHtml: ['index.html'],
            excludedDependencies: []
        }
    });

    const generateDeclarationTypeManagerConfig = () => ({
        applicationTypes: {
            managerOptions: {
                configurationFile: './dtsm.json'
            }
        }
    });

    const generateFilesystemEraserConfig = (paths) => ({
        applicationStyles: {
            pathsToDelete: [
                '<%= pathConfiguration.app.styleOutput %>/**/*.css'
            ]
        },
        applicationScripts: {
            pathsToDelete: [
                '<%= pathConfiguration.app.mainJSOutput %>/**/*.js',
                '<%= pathConfiguration.app.mainJSOutput %>/**/*.d.ts',
                '<%= pathConfiguration.app.mainJSOutput %>/**/*.js.map',
                '<%= pathConfiguration.app.testJSOutput %>/**/*.js',
                '<%= pathConfiguration.app.testJSOutput %>/**/*.js.map',
                '<%= pathConfiguration.app.testJSOutput %>/**/*.d.ts',
                '<%= pathConfiguration.app.espoweredTestJS %>/'
            ]
        },
        typeDefinitions: {
            pathsToDelete: [
                'typings'
            ]
        },
        bowerComponents: {
            pathsToDelete: [
                'bower_components'
            ]
        }
    });

    const generateTestRunnerConfig = () => ({
        unitTests: {
            runnerOptions: {
                configPath: 'karma.conf.js',
                watchForChanges: false,
                executionBrowsers: ['PhantomJS'],
                testReporters: ['progress', 'junit'],
                runOnce: true,
                keepProcessAlive: true
            }
        }
    });

    const generateBrowserLauncherConfig = () => ({
        launchTestBrowser: {
            targetPath: 'test/SpecRunner.html'
        }
    });

    const generateWebServerConfig = () => ({
        developmentServer: {
            serverOptions: {
                listenPort: 9000,
                documentRoot: "./",
                keepServerAlive: true
            }
        }
    });

    const completeConfiguration = {
        projectManifest: projectManifest,
        pathConfiguration: pathConfiguration,
        typescriptCompile: generateTypeScriptProcessorConfig(pathConfiguration),
        lessProcessor: generateLessProcessorConfig(pathConfiguration),
        typescriptLinter: generateTypeScriptLinterConfig(pathConfiguration),
        documentationGenerator: generateDocumentationGeneratorConfig(projectManifest, pathConfiguration),
        powerAssertTransformer: generatePowerAssertTransformerConfig(pathConfiguration),
        frontendDependencyManager: generateFrontendDependencyManagerConfig(),
        dependencyInjector: generateDependencyInjectorConfig(),
        declarationTypeManager: generateDeclarationTypeManagerConfig(),
        fileEraser: generateFilesystemEraserConfig(pathConfiguration),
        testRunner: generateTestRunnerConfig(),
        browserLauncher: generateBrowserLauncherConfig(),
        webServer: generateWebServerConfig()
    };

    toolkit.initConfig(completeConfiguration);

    const aliasTaskDefinitions = [
        { name: 'initializeEnvironment', tasks: ['fileEraser', 'frontendDependencyManager', 'declarationTypeManager', 'dependencyInjector'] },
        { name: 'buildDefault', tasks: ['fileEraser:applicationStyles', 'fileEraser:applicationScripts', 'typescriptCompile:mainApp', 'typescriptLinter', 'lessProcessor'] },
        { name: 'executeTests', tasks: ['fileEraser:applicationScripts', 'typescriptCompile:testApp', 'typescriptLinter', 'powerAssertTransformer', 'testRunner'] },
        { name: 'generateDocumentation', tasks: ['documentationGenerator'] },
        { name: 'startServer', tasks: ['webServer:developmentServer'] }
    ];

    aliasTaskDefinitions.forEach(alias => {
        toolkit.registerTask(alias.name, alias.tasks);
    });
};