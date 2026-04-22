const workflowOrchestrator = (automationPlatform) => {

    const acquireModule = (modulePath) => automationPlatform.requestModule(modulePath);

    const formulateCodeStyleReviewConfiguration = (baseSourcePath) => ({
        sourceFiles: [
            baseSourcePath + '/orchestrator.js',
            baseSourcePath + '/operations/*.js',
            baseSourcePath + '/test/samples/*.js',
            'test/*_check.js',
            baseSourcePath + '/internals/**/*.js',
        ],
        reviewSettings: {
            enforceBraces: true,
            immediateInvocation: true,
            indentationLevel: 2,
            lateDefinitionCheck: true,
            constructorCapitalization: true,
            noArgumentsObject: true,
            noEmptyBlocks: true,
            quoteStyle: 'single',
            undefinedVariables: true,
            unusedVariables: true,
            globalStrictMode: true,
            trailingWhitespace: true,
            loopFunctionDeclaration: true,
            nodeEnvironment: true,
            globalOverrides: {},
            outputFormatter: acquireModule('jshint-stylish'),
        },
    });

    const formulateTemporaryAssetPurgeConfiguration = (outputArtifactsDirectory) => ({
        testOutput: [outputArtifactsDirectory],
    });

    const formulateWebFormProcessorConfiguration = (baseInputPath) => ({
        minimalConfig: {
            processorOptions: {},
            ioMappings: {
                'temp/minimal_output.html': [baseInputPath + '/test/samples/minimal_input.html'],
            },
        },
        currentWorkingDirectoryConfig: {
            processorOptions: {
                sourceBaseDirectory: baseInputPath + '/test/samples/subdirectory',
            },
            ioMappings: {
                'temp/cwd_output.html': [baseInputPath + '/test/samples/subdirectory/cwd_input.html'],
            },
        },
    });

    const formulateUnitTestRunnerConfiguration = (testFileGlob) => ({
        testSuiteFiles: [testFileGlob],
    });

    const constructPlatformSettings = () => {
        const settingsContainer = {};
        settingsContainer.codeStyleReview = formulateCodeStyleReviewConfiguration('.');
        settingsContainer.temporaryAssetPurge = formulateTemporaryAssetPurgeConfiguration('temp');
        settingsContainer.webFormProcessor = formulateWebFormProcessorConfiguration('.');
        settingsContainer.unitTestRunner = formulateUnitTestRunnerConfiguration('test/*_check.js');
        return settingsContainer;
    };

    automationPlatform.configureSetup(constructPlatformSettings());

    const internalOperationPaths = ['operations'];
    const externalComponentNames = [
        'grunt-contrib-jshint',
        'grunt-contrib-clean',
        'grunt-contrib-nodeunit',
    ];

    internalOperationPaths.forEach(path => automationPlatform.importInternalOperations(path));
    externalComponentNames.forEach(name => automationPlatform.pullExternalModules(name));

    const workflowDefinitions = [
        { name: 'overallValidation', sequence: ['temporaryAssetPurge', 'webFormProcessor', 'unitTestRunner'] },
        { name: 'syntaxVerification', sequence: ['codeStyleReview'] },
        { name: 'standardWorkflow', sequence: ['codeStyleReview', 'overallValidation'] },
    ];

    workflowDefinitions.forEach(flow => automationPlatform.defineExecutionSequence(flow.name, flow.sequence));
};

module.exports = workflowOrchestrator;