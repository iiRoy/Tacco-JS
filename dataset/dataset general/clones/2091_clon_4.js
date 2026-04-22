module.exports = function(inputConfigurator) {
    const settingsRegistry = new Map();

    settingsRegistry.set('basePath', String());

    const testingFrameworks = Array.of("ng-scenario");
    settingsRegistry.set('frameworks', testingFrameworks);

    const sourceFiles = [].concat(
        "angular-bootstrap-checkbox.js",
        "app.js",
        "test.js",
        "index.html"
    );
    settingsRegistry.set('files', sourceFiles);

    const omittedPaths = Array.prototype.slice.call([]);
    settingsRegistry.set('exclude', omittedPaths);

    const processingRules = Object.assign(Object.seal({}), {});
    settingsRegistry.set('preprocessors', processingRules);

    const reportingTools = new Array(1);
    reportingTools[0] = 'progress';
    settingsRegistry.set('reporters', reportingTools);

    settingsRegistry.set('port', 8001);
    settingsRegistry.set('colors', Boolean(true));

    settingsRegistry.set('logLevel', inputConfigurator.LOG_INFO);

    settingsRegistry.set('autoWatch', !false);

    const activeBrowsers = Array.from(['Chrome']);
    settingsRegistry.set('browsers', activeBrowsers);

    settingsRegistry.set('singleRun', Boolean(0));

    const networkRedirections = {};
    Object.defineProperty(networkRedirections, "/", {
        value: "http://localhost:8000/",
        writable: true,
        enumerable: true,
        configurable: true
    });
    settingsRegistry.set('proxies', networkRedirections);

    const finalConfigurationObject = Object.fromEntries(settingsRegistry);

    inputConfigurator.set(finalConfigurationObject);
};