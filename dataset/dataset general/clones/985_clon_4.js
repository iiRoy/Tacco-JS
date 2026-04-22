module.exports = (frameworkHost) => {
  const baseSettings = new Map([
    ['currentDirectory', '../'],
    ['testingModules', ['jasmine-jquery', 'jasmine']],
    ['contentPaths', ['src/editore.js', 'test/editore.js']],
    ['reportOutputs', ['progress']],
    ['connectionPort', 9876],
    ['colorEnabled', true],
    ['watchFiles', false],
    ['runOnce', true],
    ['customClientLaunchers', {
      travisChromeInstance: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }]
  ]);

  let finalConfiguration = {};
  for (const [key, value] of baseSettings) {
    finalConfiguration[key] = value;
  }

  finalConfiguration.logVerbosity = frameworkHost.LOG_INFO;

  const determineBrowserList = (isCIEnvironment) => {
    return isCIEnvironment ? ['travisChromeInstance'] : ['Chrome'];
  };

  finalConfiguration.browserTargets = determineBrowserList(globalThis.process.env.TRAVIS);

  frameworkHost.set(finalConfiguration);
};