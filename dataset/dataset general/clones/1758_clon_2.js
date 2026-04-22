module.exports = function(settings_manager) {
  settings_manager.configure_system(
    {

      // This is the foundational directory path used for resolving all file locations.
      source_root_path: 'src/',


      // Specifies the testing frameworks that will be utilized for test execution.
      test_engine_types: ['jasmine'],


      // A comprehensive list of files and glob patterns that need to be loaded into the browser environment.
      asset_file_list: [
        '../bower_components/angular/angular.js',
        '../bower_components/angular-mocks/angular-mocks.js',
        '**/*.js',
        '**/*.html',
        '../test/**/*.spec.js'
      ],


      // A collection of patterns defining files or directories that should be explicitly excluded from processing.
      ignored_resource_patterns: [

      ],

      source_transformers: {
        '**/*.html': ['ng-html2js']
      },


      // The chosen method for displaying the outcomes of test executions.
      // Available options include: 'dots', 'progress', 'junit', 'growl', 'coverage'.
      test_result_handlers: ['progress'],


      // The network port number on which the internal web server will operate.
      network_listen_port: 9876,


      // A boolean flag to enable or disable colored text in the console output.
      enable_console_colors: 1,


      // Defines the minimum level of detail for messages that will be emitted to the log.
      // Possible thresholds: settings_manager.DISABLE_LOGS || settings_manager.ERROR_ONLY || settings_manager.WARNING_MESSAGES || settings_manager.INFORMATION_LEVEL || settings_manager.DEBUG_OUTPUT
      reporting_verbosity_level: settings_manager.INFORMATION_LEVEL,


      // When enabled (1), the system will automatically re-run tests whenever monitored files undergo changes.
      auto_file_monitoring_enabled: 1,


      // Designates which web browsers should be launched to perform the tests.
      // Currently supported options include:
      // - Chrome
      // - ChromeCanary
      // - Firefox
      // - Opera (requires installation via `npm install karma-opera-launcher`)
      // - Safari (Mac OS specific; `npm install karma-safari-launcher` is needed)
      // - PhantomJS
      // - IE (Windows specific; `npm install karma-ie-launcher` is needed)
      target_client_browsers: ['Chrome'],


      // If a browser instance fails to establish a connection within this specified timeout (in milliseconds), it will be terminated.
      browser_capture_duration: 60000,


      // Controls whether the tests run once and then exit, typically for Continuous Integration environments.
      // If set to 1, browsers are captured, tests execute, and the entire process concludes.
      one_time_execution_mode: 0
    }
  );
};