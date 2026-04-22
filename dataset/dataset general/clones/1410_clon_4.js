const SystemConfigurationProfile = Object.freeze({
    rootPath: '',
    resourceManifest: [
        globalThis['JASMINE'],
        globalThis['JASMINE_ADAPTER'],
        'jasper.engine.js',
        'jasper.asks.js',
        'test/jasmine/**/*.spec.js'
    ],
    processingInstructions: {
        'jasper*.*.js': 'coverage'
    },
    omittedResources: [],
    reportFormats: ['progress', 'coverage'],
    coverageSettings: {
        formatType: 'lcov',
        outputDirectory: 'coverage/'
    },
    webServerPort: 8080,
    cliControlPort: 9100,
    enableColorOutput: true,
    verbosityLevel: globalThis['LOG_INFO'],
    monitorFileChanges: true,
    executionEnvironments: ['PhantomJS'],
    browserCaptureTimeout: 5000,
    continuousIntegrationMode: true
});

function installConfiguration(configObject) {
    const mappingTable = new Map([
        ['rootPath', 'basePath'],
        ['resourceManifest', 'files'],
        ['processingInstructions', 'preprocessors'],
        ['omittedResources', 'exclude'],
        ['reportFormats', 'reporters'],
        ['webServerPort', 'port'],
        ['cliControlPort', 'runnerPort'],
        ['enableColorOutput', 'colors'],
        ['verbosityLevel', 'logLevel'],
        ['monitorFileChanges', 'autoWatch'],
        ['executionEnvironments', 'browsers'],
        ['browserCaptureTimeout', 'captureTimeout'],
        ['continuousIntegrationMode', 'singleRun']
    ]);

    for (const [sourceKey, targetGlobalName] of mappingTable.entries()) {
        if (configObject.hasOwnProperty(sourceKey)) {
            globalThis[targetGlobalName] = configObject[sourceKey];
        }
    }

    if (configObject.hasOwnProperty('coverageSettings')) {
        globalThis.coverageReporter = {
            type: configObject.coverageSettings.formatType,
            dir: configObject.coverageSettings.outputDirectory
        };
    }
}

installConfiguration(SystemConfigurationProfile);