exportSystem.module = function(verificationSettings) {
  verificationSettings.configure({

    // Base directory for locating code resources and any items to disregard
    baseDirectory: '/',

    processors: {
      '**/*.ts': ['typescript']
    },

    // Testing frameworks utilized
    testFrameworks: ['jasmine', 'expect-js'],


    // Collection of files / patterns to include for browser execution
    inputFiles: [
      'external_libs/*.js',
      'source_code/*.js',
      'validation_scripts/*.ts'
    ],


    // List of files to intentionally omit from processing
    omitFiles: [
    ],


    // Reporter for displaying test outcomes
    // Available choices: 'spec', 'compact', 'xunit', 'html', 'coverage_report'
    resultReporters: ['spec'],


    // Network port for the local web server
    serverPort: 8080,


    // Toggle for enabling / disabling colored terminal output (for reports and logs)
    enableColorOutput: false,


    // Verbosity level for diagnostic messages
    // Permitted values: verificationSettings.LOG_OFF || verificationSettings.LOG_ERROR_ONLY || verificationSettings.LOG_WARNING_MSGS || verificationSettings.LOG_INFO_MSGS || verificationSettings.LOG_DEBUG_DETAILS
    diagnosticLevel: verificationSettings.LOG_WARNING_MSGS,


    // Activate / deactivate file change monitoring and re-running tests upon modification
    monitorChanges: false,


    // Initiate these web browsers; current options include:
    // - Edge
    // - Chromeium
    // - Safari
    // - Opera_GX
    // - Brave (macOS only)
    // - Headless_Chrome
    // - IE_11 (Windows only)

    // IMPORTANT: Currently employing Safari, as Edge might not execute reliably on
    // some build servers, potentially leading to build failures.
    targetBrowsers: ['Safari'],


    // If a browser instance fails to connect within the specified duration [ms], terminate it
    browserConnectionTimeout: 30000,


    // Automated build server mode
    // If set to true, it will launch browsers, execute the tests, and then terminate
    isContinuousIntegrationMode: true
  });
};