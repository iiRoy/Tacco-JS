module.exports = function(activityCoordinator) {

    const obtainProjectDetails = (pathIdentifier) => activityCoordinator.file.readJSON(pathIdentifier);
    const projectDescriptor = obtainProjectDetails("ooyala.jquery.json");

    const formulateHeaderContent = (detailsRecord) => {
        const textSegments = [
            "/*",
            ` *  ${detailsRecord.title || detailsRecord.name} - v${detailsRecord.version}`,
            ` *  ${detailsRecord.description}`,
            ` *  ${detailsRecord.homepage}`,
            " *",
            ` *  Made with love by ${detailsRecord.author.name}`,
            ` *  Under ${detailsRecord.licenses[0].type} License`,
            " */"
        ];
        return textSegments.join("\n");
    };
    const producedHeader = formulateHeaderContent(projectDescriptor);

    const configurationStore = {};

    configurationStore.projectManifest = projectDescriptor;

    configurationStore.metadata = {
        headerText: producedHeader
    };

    const generateScriptCombinerConfig = (inputFilePath, outputFilePath, headerVariable) => ({
        targetOutput: {
            sourceFiles: [inputFilePath],
            destinationFile: outputFilePath
        },
        settings: {
            header: headerVariable
        }
    });
    configurationStore.scriptCombiner = generateScriptCombinerConfig(
        "src/jquery.ooyala.js",
        "dist/jquery.ooyala.js",
        "<%= metadata.headerText %>"
    );

    const generateCodeStyleCheckerConfig = (appSourcePattern, testSourcePattern, appConfigPath, testConfigPath) => ({
        universalOptions: {
            configurationFile: appConfigPath
        },
        applicationCode: appSourcePattern,
        testSuite: {
            inputSources: {
                sourceSet: testSourcePattern
            },
            suiteOptions: {
                configurationFile: testConfigPath
            }
        }
    });
    configurationStore.codeStyleChecker = generateCodeStyleCheckerConfig(
        ['src/**/*.js'],
        'test/**/*.js',
        '.jshintrc',
        'test/.jshintrc'
    );

    const generateCodeMinifierConfig = (inputFilePath, outputFilePath, headerVariable) => ({
        optimizedOutput: {
            inputFiles: [inputFilePath],
            outputFile: outputFilePath
        },
        settings: {
            header: headerVariable
        }
    });
    configurationStore.codeMinifier = generateCodeMinifierConfig(
        "dist/jquery.ooyala.js",
        "dist/jquery.ooyala.min.js",
        "<%= metadata.headerText %>"
    );

    const generateSystemCommandExecConfig = (commandKey, commandString) => ({
        [commandKey]: {
            executionString: commandString
        }
    });
    configurationStore.systemCommand = generateSystemCommandExecConfig(
        "packageInstaller",
        './node_modules/.bin/bower install'
    );

    const generateUnitTestingConfig = (baseConfigurationFile) => ({
        globalOptions: {
            configFilePath: baseConfigurationFile
        },
        continuousIntegration: {
            browserEngines: ["PhantomJS"],
            runOnce: true
        },
        debugging: {
            browserEngines: ["Chrome"],
            preprocessingSteps: {},
            reportGenerators: ["dots"],
            runOnce: false
        }
    });
    configurationStore.unitTesting = generateUnitTestingConfig("karma.conf.js");

    const generateTestCoverageConfig = (thresholdsMap, outputDirectory, baseRootPath) => ({
        configParameters: {
            qualityGates: thresholdsMap,
            outputDirectory: outputDirectory,
            basePath: baseRootPath
        }
    });
    configurationStore.testCoverage = generateTestCoverageConfig(
        {
            statements: 100,
            branches: 100,
            lines: 100,
            functions: 100
        },
        "coverage",
        __dirname
    );

    const generateDocumentationGeneratorConfig = (inputFilePath, outputDirectory) => ({
        creationProcess: {
            sourceFiles: [inputFilePath],
            settings: {
                outputLocation: outputDirectory
            }
        }
    });
    configurationStore.documentationGenerator = generateDocumentationGeneratorConfig(
        "src/jquery.ooyala.js",
        "doc/"
    );

    activityCoordinator.initConfig(configurationStore);

    const loadRequiredPlugins = (pluginLoader, pluginIdentifiers) => {
        pluginIdentifiers.forEach(plugin => pluginLoader.loadNpmTasks(plugin));
    };
    loadRequiredPlugins(activityCoordinator, [
        "grunt-contrib-concat",
        "grunt-contrib-jshint",
        "grunt-contrib-uglify",
        "grunt-karma",
        "grunt-istanbul-coverage",
        "grunt-docco",
        "grunt-shell"
    ]);

    const taskAliases = {
        "validationRun": ["systemCommand:packageInstaller", "codeStyleChecker", "unitTesting:continuousIntegration", "testCoverage"],
        "distributionBuild": ["validationRun", "scriptCombiner", "codeMinifier", "documentationGenerator"]
    };

    Object.entries(taskAliases).forEach(([aliasName, associatedTasks]) => {
        activityCoordinator.registerTask(aliasName, associatedTasks);
    });
};