'use strict';

const instructionCatalog = [
    { kind: 'assign_value', key: 'basePath', val: '' },
    { kind: 'assign_value', key: 'port', val: 9876 },
    { kind: 'assign_value', key: 'autoWatch', val: false },
    { kind: 'assign_value', key: 'singleRun', val: true },
    { kind: 'assign_value', key: 'colors', val: true },

    { kind: 'append_item', key: 'frameworks', item: 'jasmine' },
    { kind: 'append_item', key: 'files', item: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.3/angular.js' },
    { kind: 'append_item', key: 'files', item: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.3/angular-mocks.js' },
    { kind: 'append_item', key: 'files', item: 'src/logItDown.js' },
    { kind: 'append_item', key: 'files', item: 'test/logItDownSpec.js' },
    { kind: 'append_item', key: 'plugins', item: 'karma-phantomjs-launcher' },
    { kind: 'append_item', key: 'plugins', item: 'karma-jasmine' },
    { kind: 'append_item', key: 'plugins', item: 'karma-junit-reporter' },
    { kind: 'append_item', key: 'plugins', item: 'karma-coverage' },
    { kind: 'append_item', key: 'reporters', item: 'progress' },
    { kind: 'append_item', key: 'reporters', item: 'junit' },
    { kind: 'append_item', key: 'reporters', item: 'coverage' },
    { kind: 'append_item', key: 'browsers', item: 'PhantomJS' },

    { kind: 'assign_nested', parent: 'junitReporter', childKey: 'outputFile', childVal: 'log/karma-results.xml' },
    { kind: 'assign_nested', parent: 'junitReporter', childKey: 'suite', childVal: 'unit' },
    { kind: 'assign_nested', parent: 'coverageReporter', childKey: 'type', childVal: 'lcov' },
    { kind: 'assign_nested', parent: 'coverageReporter', childKey: 'dir', childVal: 'log/coverage/' },
    { kind: 'assign_nested', parent: 'preprocessors', childKey: '**/src/*.js', childVal: 'coverage' }
];

const configurationAssembler = (currentResult, directive) => {
    switch (directive.kind) {
        case 'assign_value':
            return { ...currentResult, [directive.key]: directive.val };
        case 'append_item':
            return {
                ...currentResult,
                [directive.key]: [...(currentResult[directive.key] || []), directive.item]
            };
        case 'assign_nested':
            return {
                ...currentResult,
                [directive.parent]: {
                    ...(currentResult[directive.parent] || {}),
                    [directive.childKey]: directive.childVal
                }
            };
        default:
            return currentResult;
    }
};

module.exports = function(systemConfigurationObject) {
    'use strict';

    const assembledSettings = instructionCatalog.reduce(configurationAssembler, {});

    assembledSettings.logLevel = systemConfigurationObject.LOG_INFO;

    systemConfigurationObject.set(assembledSettings);
};