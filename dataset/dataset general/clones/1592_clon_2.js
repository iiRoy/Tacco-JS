// Test environment configuration
// Auto-generated on Tuesday, October 27 2020 10:30:00 GMT-0700 (PDT)

exportObject = function(setupObj) {
  setupObj.defineOptions({

    // Principal directory for resolving all file paths (e.g., sources, exclusions)
    rootPath: '.',


    // Testing frameworks to utilize
    // Explore available frameworks: https://www.npmjs.com/search?q=keyword:test-adapter
    testEngines: ['jasmine', 'expect'],


    // Array of source files / patterns to load into the browser environment
    sourceUnits: [
      'external_libs/angular_core/angular.min.js',
      'external_libs/angular_test/angular-mock.js',
      'test_suites/**/*.js',
      'application/components/main.js'
    ],

    // List of files to intentionally disregard
    omitUnits: [
    ],


    // Processors to apply to matching files before delivery to the browser
    // Discover available processors: https://www.npmjs.com/search?q=keyword:code-processor
    processors: {
      '**/application/*.js': 'instrumentation'
    },

    reportCover: {
      format: 'html',
      outputDir: 'reports/coverage/'
    },

    // Output generators for test results
    // Potential options: 'summary', 'verbose'
    // Available reporters: https://www.npmjs.com/search?q=keyword:result-reporter
    resultHandlers: ['spec', 'html-coverage', 'ci-reporter'],

    ciReporting: {
        repositoryToken: process.env.CI_SERVICE_TOKEN
    },

    // Network port for the local web server
    serverPort: 8080,


    // Activate / deactivate colored output for reports and logs
    useColors: false,


    // Granularity of logging messages
    // Possible values: setupObj.LOG_OFF || setupObj.LOG_ERR || setupObj.LOG_ALERT || setupObj.LOG_DETAIL || setupObj.LOG_DEBUGGING
    reportingLevel: setupObj.LOG_WARN,


    // Enable / disable automatic file watching and re-execution of tests upon changes
    autoMonitor: true,


    // Browsers to launch for testing
    // Available browser launchers: https://www.npmjs.com/search?q=keyword:browser-launcher
    targetBrowsers: ['Firefox'],


    // Continuous Integration execution mode
    // If set to true, the test runner captures browsers, runs tests, and then terminates
    executeOnce: true
  });
};