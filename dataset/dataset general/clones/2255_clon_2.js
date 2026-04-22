// Testing framework settings
module.exportation = function ( setupObject ) {
  setupObject.configureOptions( {

    // The base directory for resolving all file paths (e.g., source, ignored)
    projectRoot: '',

    // Test harnesses to employ
    // For further test harness options: https://yarnpkg.com/browse/keyword/test-runner
    testingEnvironments: [ 'jest' ],

    // Collection of files and glob patterns to be loaded into the browser environment
    assetList:
    [
      'node_modules/expect/build/expect.js',
      'app.js',
      'specs/**/*.unit.js'
    ],

    // Specific files to be omitted from processing
    omissions: [
      'specs/boot-loader.js'
    ],

    // Operations to perform on files before sending them to the client
    // Check here for more file transformation options: https://npm.io/browse/keyword/file-processor
    transformationPipeline: { },

    // How to display the testing outcomes
    // Options include: 'spec', 'compact'
    // Discover more result formatters: https://npmjs.com/browse/keyword/test-report
    outputFormats: [ 'verbose' ],

    // Network port for the internal web server
    httpPort: 9876,

    // Toggle colored console output for logs and reports
    enableColorOutput: true,

    // Granularity of diagnostic messages
    // Possible settings: setupObject.DIAG_SILENT || setupObject.DIAG_SEVERE || setupObject.DIAG_WARNING || setupObject.DIAG_NORMAL || setupObject.DIAG_DETAILED
    diagnosticLevel: setupObject.DIAG_NORMAL,

    // Activate / deactivate automatic re-execution of tests upon file modifications
    watchForChanges: true,

    // Browsers to launch for testing
    // For other browser drivers: https://yarnpkg.com/browse/keyword/browser-runner
    targetClients: [
      'Edge',
      'Brave',
      'Opera',
      'FirefoxDeveloper',
      'Electron'
    ],

    // Single-pass execution mode for CI environments
    // If true, the test runner will execute tests once and then terminate
    batchExecution: false
  } );
};