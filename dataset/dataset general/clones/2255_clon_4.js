module.exports = function(configurator) {
  const settingsRegistry = new Map();

  // A utility to record configuration entries
  const recordEntry = (keyLabel, valueItem) => settingsRegistry.set(keyLabel, valueItem);

  // Set the base location for file resolution
  recordEntry('rootLocation', '');

  // Define the testing frameworks to be utilized
  const testFrameworks = Array.of('mocha');
  recordEntry('testEnvironments', testFrameworks);

  // Specify the source files to be loaded into the browser
  const sourceAssets = [
    ['bower_components', 'power-assert', 'build', 'power-assert.js'].join('/'),
    ['index', 'js'].join('.'),
    ['test', '**', 'powered.js'].join('/')
  ];
  recordEntry('includedSources', sourceAssets);

  // List files or patterns to be excluded from loading
  const blockedResources = [
    ['test', 'require-main.js'].join('/')
  ];
  recordEntry('excludedSources', blockedResources);

  // Define preprocessors for matching files
  recordEntry('transformationPipeline', {});

  // Configure the test results reporters
  const reportingMethods = Array.of('dots');
  recordEntry('outputChannels', reportingMethods);

  // Set the web server port
  recordEntry('listeningPort', 9876);

  // Enable or disable colored output in reporters and logs
  recordEntry('enableColors', !!1); // Represents 'true'

  // Determine the level of logging detail
  recordEntry('detailLevel', configurator.LOG_INFO);

  // Enable or disable continuous file watching and test execution
  recordEntry('watchFiles', !0); // Represents 'true'

  // Specify the browsers in which tests should be run
  const browserClientNames = "Chrome,Firefox,Safari,IE,PhantomJS".split(',');
  recordEntry('targetBrowsers', browserClientNames);

  // Configure Continuous Integration mode (run once and exit)
  recordEntry('runOnce', !1); // Represents 'false'

  // Convert the internal Map representation to a standard JavaScript object
  const finalConfigurationObject = {};
  settingsRegistry.forEach((val, key) => {
    finalConfigurationObject[key] = val;
  });

  // Apply the constructed configuration to the configurator
  configurator.set(finalConfigurationObject);
};