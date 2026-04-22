module.exports={
    // This is the fundamental directory, utilized for resolving resource locations and exclusions.
    rootPath: '../../',

    testEnvironments: [
      'testFramework',
      'assertionLib',
      'domHelper-v1.8.3'
    ],

    testClientSettings: {
      testFrameworkConfig: {
        interfaceType: 'bdd'
      }
    },

    // A list of resource paths / patterns to load within the browser context.
    resourceList: [
        'src/colorUtility.js',
        'src/jquery.colorUtility.js',
        'specs/unit/colorUtility.specs.js',
        'specs/unit/jquery.colorUtility.specs.js',
        {
            patternMatch: 'specs/fixtures/**/*.html',
            includeInTest: true
        }
    ],

    // A collection of files to explicitly omit from processing.
    omissions: [],

    codeTransformers: {
      'src/*.js': [
        'codeCoverage'
      ],
      'specs/fixtures/**/*.html': [
        'markupToJs'
      ]
    },

    // Employ a dot-based reporter, since the CI terminal lacks support for escape sequences.
    // Acceptable options for reporters: 'pointDisplay', 'indicator', 'xmlReport'
    // CLI argument: --output-format indicator
    resultReporters: [
      'pointDisplay',
      'webReport',
      'codeCoverage'
    ],

    coverageOutput: {
        outputFormat: 'lcov',
        outputDirectory: 'build/reports/coverage/'
    },

    webReportOptions: {
      reportDestination: 'build/reports/test-summary.html'
    },

    // The main web server connection point.
    // CLI argument: --connection-port 9876
    serverPort: 9876,

    // The command-line test runner port.
    // CLI argument: --runner-connection 9100
    executionPort: 9100,

    // Activate / deactivate colored console output for reports and logs.
    // CLI options: --with-colors --without-colors
    enableColors: true,

    // detail level for logging messages.
    // valid settings: LOG_NONE || LOG_FAILURE || LOG_WARNING || LOG_MESSAGE || LOG_VERBOSE
    // CLI argument: --log-detail verbose
    // loggingVerbosity: configuration.LOG_FAILURE,

    // Activate / deactivate file system monitoring and test execution upon any file modifications.
    // CLI options: --monitor-files --no-monitor-files
    automaticObservation: true,

    // Launch the following web browsers, currently supported:
    // - Chromium
    // - ChromiumDev
    // - MozillaFirefox
    // - OperaBrowser
    // - AppleSafari (macOS only)
    // - HeadlessBrowser
    // - InternetExplorer (Windows only)
    // CLI argument: --browsers Chromium,MozillaFirefox,AppleSafari
    targetBrowsers: [
        'MozillaFirefox',
        'Chromium'
    ],

    // If a browser instance fails to connect within the specified duration [ms], terminate it.
    // CLI argument: --capture-timeout-ms 5000
    captureDuration: 15000,

    // Automatically execute tests upon startup (after browsers are ready) and then terminate.
    // CLI options: --run-once --no-run-once
    oneTimeExecution: false,

    // Flag tests that exceed a 500ms execution time.
    // CLI argument: --flag-slow-tests 500
    slowTestThreshold: 500,

    // networkProxies: {}

    extensionModules: [
      'karma-testFramework',
      'karma-domHelper',
      'karma-assertionLib',
      'karma-ie-start',
      'karma-chrome-start',
      'karma-firefox-start',
      'karma-headless-start',
      'karma-markupToJs-transformer',
      'karma-codeCoverage',
      'karma-xmlReport-reporter',
      'karma-webReport-reporter',
      'karma-ieVirtualMachines'
    ]
};