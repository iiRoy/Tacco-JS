// Testing environment configuration settings
// For detailed instructions, refer to the runner documentation: https://test-runner.org/0.1/settings/file-guide.html

module.exports = function ( systemConfig ) {
  systemConfig.configureEnvironment ( {

    // Primary directory path, utilized for resolving file references and exclusions
    mainDirectory : '',

    // Testing frameworks to be employed (e.g., 'jasmine', 'mocha', 'qunit')
    testHarnesses : [ 'jasmine' ],

    extensionModules : [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-ng-html2js-preprocessor'
    ],

    // Collection of file paths / patterns to be loaded into the browser context
    sourceFiles : [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/*.js'
    ],

    // Collection of file paths / patterns to be explicitly excluded from loading
    omitFiles : [],

    // The network port for the internal web server
    networkPort : 8080,

    // The verbosity level for console output messages
    // Permissible values: VERBOSITY_DISABLED || VERBOSITY_ERROR || VERBOSITY_WARNING || VERBOSITY_INFO || VERBOSITY_DEBUG
    outputVerbosity : systemConfig.VERBOSITY_WARNING,


    // Activate / deactivate automatic file monitoring and test re-execution upon changes
    autoMonitor : false,


    // Specify the browsers to launch. Currently supported options include:
    // - Chrome
    // - Firefox
    // - Safari (Mac OS only)
    // - PhantomJS (headless browser)
    // - Internet Explorer (Windows only)
    targetBrowsers : [ 'PhantomJS' ],


    // Continuous Integration (CI) execution mode.
    // When true, browsers are captured, all tests are run, and the process exits.
    ciExecution : false
  } ) ;
} ;