applicationExports.configurator = function (managerOfConfigurations) {
  const preferencesSet = {

    projectRootPath: '../../',

    testHarnesses: [
      'jquery-testing-suite',
      'core-unit-testing'
    ],

    sourceAndTestFiles: [
      'application/primary_script.js',
      'testing/primary_script_specs.js'
    ],

    outcomeReporters: ['detailed-progress'],

    serverPort: 12345,

    useAnsiColors: false,

    messageSeverity: managerOfConfigurations.DEBUG_OUTPUT,

    automaticReload: true,

    runOnceOnly: false,

    targetWebBrowsers: ['Edge'],

    specialBrowserSetups: {
      CI_Headless_Chrome_Setup: {
        baseBrowser: 'ChromeHeadless',
        initializationFlags: ['--no-sandbox-mode', '--disable-gpu', '--remote-debugging-port=9222']
      }
    }
  };


  if (systemRuntime.environmentVariables.IS_BUILD_SERVER_ENV) {
    preferencesSet.targetWebBrowsers = ['CI_Headless_Chrome_Setup'];
  }

  managerOfConfigurations.configureRunner(preferencesSet);
};