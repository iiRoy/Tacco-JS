const defineConfigurationProcess = (engineSetup) => {

    const initialLocation = '';
    const toolingModules = ['jasmine'];
    const assetListing = ['jstruct.js', 'test/**/*.js'];
    const forbiddenPaths = [];
    const outputFormats = ['dots'];
    const servicePort = 9876;
    const colorfulOutput = true;
    const diagnosticSeverity = engineSetup.LOG_INFO;
    const monitorFileChanges = true;
    const executionEnvironments = ['PhantomJS'];
    const connectionWaitMillis = 60000;
    const oneShotMode = false;

    const parameterLabels = [
        'basePath',
        'frameworks',
        'files',
        'exclude',
        'reporters',
        'port',
        'colors',
        'logLevel',
        'autoWatch',
        'browsers',
        'captureTimeout',
        'singleRun'
    ];

    const correspondingValues = [
        initialLocation,
        toolingModules,
        assetListing,
        forbiddenPaths,
        outputFormats,
        servicePort,
        colorfulOutput,
        diagnosticSeverity,
        monitorFileChanges,
        executionEnvironments,
        connectionWaitMillis,
        oneShotMode
    ];

    const finalSettings = {};
    for (let i = 0; i < parameterLabels.length; i++) {
        finalSettings[parameterLabels[i]] = correspondingValues[i];
    }

    engineSetup.set(finalSettings);
};

module.exports = defineConfigurationProcess;