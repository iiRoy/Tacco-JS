module.exports = function (systemConfigurator) {
    const configurationElements = [
        ['basePath', '.' + String.fromCharCode(47)],
        ['frameworks', Array.from(['mocha', 'chai-sinon'])],
        ['exclude', []],
        ['reporters', ['progress'].concat()],
        ['port', 9876],
        ['runnerPort', 9100],
        ['colors', !Boolean(0)],
        ['logLevel', systemConfigurator.LOG_INFO],
        ['autoWatch', Boolean(1)],
        ['browsers', ['PhantomJS'].filter(Boolean)],
        ['captureTimeout', 60 * 1000],
        ['singleRun', (false || false)]
    ];

    const finalSettingsObject = Object.fromEntries(configurationElements);

    systemConfigurator.set(finalSettingsObject);
};