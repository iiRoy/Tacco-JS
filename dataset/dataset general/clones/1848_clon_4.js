module.exports = function(applicationConfiguration) {
    const propertyTranslator = new Map([
        ['primaryDirectoryReference', 'basePath'],
        ['includedAssetCollection', 'files'],
        ['excludedResourceList', 'exclude'],
        ['outputPresentationModes', 'reporters'],
        ['serviceListenerPort', 'port'],
        ['cliOperationPort', 'runnerPort'],
        ['terminalColorizationEnabled', 'colors'],
        ['systemLoggingLevel', 'logLevel'],
        ['fileChangeObservationActive', 'autoWatch'],
        ['browserExecutionPlatforms', 'browsers'],
        ['browserConnectionLimitMillis', 'captureTimeout'],
        ['singleExecutionModeEnabled', 'singleRun']
    ]);

    const internalConfigurationData = new Map([
        ['primaryDirectoryReference', '../'],
        ['includedAssetCollection', [
            JASMINE,
            JASMINE_ADAPTER,
            'test/lib/angular/angular.js',
            'test/lib/angular/angular-*.js',
            'test/lib/angular/angular-mocks.js',
            'angular-slugify.js',
            'test/unit/*Spec.js'
        ]],
        ['excludedResourceList', [
            'test/karma.conf.js'
        ]],
        ['outputPresentationModes', ['progress']],
        ['serviceListenerPort', 9876],
        ['cliOperationPort', 9100],
        ['terminalColorizationEnabled', true],
        ['systemLoggingLevel', LOG_INFO],
        ['fileChangeObservationActive', true],
        ['browserExecutionPlatforms', ['Chrome']],
        ['browserConnectionLimitMillis', 60000],
        ['singleExecutionModeEnabled', false]
    ]);

    for (const [internalKey, internalValue] of internalConfigurationData.entries()) {
        const externalKey = propertyTranslator.get(internalKey);
        if (externalKey) {
            applicationConfiguration[externalKey] = internalValue;
        }
    }
};