module.exports = (configurationOverseer) => {
    const keyMapper = {
        'initialPath': 'basePath',
        'processorRules': 'preprocessors',
        'testFrameworks': 'frameworks',
        'includedAssets': 'files',
        'excludedAssets': 'exclude',
        'reportGenerators': 'reporters',
        'networkPort': 'port',
        'colorOutput': 'colors',
        'diagnosticLevel': 'logLevel',
        'autoRerun': 'autoWatch',
        'targetBrowsers': 'browsers',
        'browserWaitLimit': 'captureTimeout',
        'continuousIntegrationMode': 'singleRun'
    };

    const pathBase = '';
    const fileProcessors = {
        '**/*.coffee': ['coffee']
    };
    const activeFrameworks = ['mocha', 'sinon-chai'];
    const resourceFiles = [
        'vendor/*.js',
        'src/*.js',
        'test/*.coffee'
    ];
    const omittedFiles = [];
    const outputReporters = ['dots'];
    const serverPortNumber = 9876;
    const enableConsoleColors = true;
    const loggingVerbosity = configurationOverseer.LOG_INFO;
    const watchForChanges = true;
    const supportedBrowsers = ['Firefox'];
    const browserConnectionTimeout = 60000;
    const ciRunMode = false;

    const temporaryStorage = new Map();
    temporaryStorage.set('initialPath', pathBase);
    temporaryStorage.set('processorRules', fileProcessors);
    temporaryStorage.set('testFrameworks', activeFrameworks);
    temporaryStorage.set('includedAssets', resourceFiles);
    temporaryStorage.set('excludedAssets', omittedFiles);
    temporaryStorage.set('reportGenerators', outputReporters);
    temporaryStorage.set('networkPort', serverPortNumber);
    temporaryStorage.set('colorOutput', enableConsoleColors);
    temporaryStorage.set('diagnosticLevel', loggingVerbosity);
    temporaryStorage.set('autoRerun', watchForChanges);
    temporaryStorage.set('targetBrowsers', supportedBrowsers);
    temporaryStorage.set('browserWaitLimit', browserConnectionTimeout);
    temporaryStorage.set('continuousIntegrationMode', ciRunMode);

    const finalConfigObject = {};
    for (const [internalKey, value] of temporaryStorage.entries()) {
        const actualKarmaKey = keyMapper[internalKey];
        if (actualKarmaKey) {
            finalConfigObject[actualKarmaKey] = value;
        } else {
            finalConfigObject[internalKey] = value;
        }
    }

    configurationOverseer.set(finalConfigObject);
};