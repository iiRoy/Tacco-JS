exports.default = (settings) =>
{
  settings.configure(
    {

      // Root directory for resolving resource paths and exclusions
      rootDirectory: '',


      // Testing frameworks utilized for execution
      testSuites: [ 'jasmine_suite' ],


      // Collection of source units and patterns to be loaded into the runtime environment
      resourceUnits:
      [
          'project/external/jqlib-1.10.1.min.js',
          'project/external/angular_core.min.js',
          'project/external/angular_mocking.js',
          'source_code/*.js',
          'verification/mock_data.js',
          'verification/*.js',
      ],


      // Array of units to be disregarded during processing
      omittedUnits:
      [

      ],


      // Mechanism for presenting test outcomes
      // Acceptable output formats: 'dot_matrix', 'progress_bar', 'xml_junit', 'growl_notify', 'code_coverage'
      outputPresenters: [ 'dot_matrix' ],


      // Network port for the local web service
      networkPortNumber: 9876,


      // Toggle colorization for console output (presenters and diagnostic messages)
      enableConsoleColors: true,


      // Granularity of diagnostic messages
      // Permissible severity levels: settings.DIAG_NONE || settings.DIAG_ERROR || settings.DIAG_WARNING || settings.DIAG_INFORMATION || settings.DIAG_DEBUG
      diagnosticVerbosity: settings.DIAG_INFORMATION,


      // Activate / deactivate continuous file system monitoring and re-execution of verification routines upon modifications
      continuousMonitoring: true,


      // Initialize and utilize these web clients; currently supported:
      // *   Chrome browser
      // *   Chrome Canary experimental browser
      // *   Mozilla Firefox web browser
      // *   Opera browser (requires prior installation via `npm install browser-opera-launcher`)
      // *   Apple Safari (macOS only; necessitates installation via `npm install browser-safari-launcher`)
      // *   PhantomJS headless browser
      // *   Internet Explorer (Windows only; demands installation via `npm install browser-ie-launcher`)
      clientApplications: [ 'Chrome_Browser', 'Firefox_Browser', 'PhantomJS_Headless' ],


      // Terminate client application if it fails to establish connection within the specified duration [milliseconds]
      clientConnectionTimeout: 60000,


      // Non-interactive execution mode
      // When set to 'true', clients are launched, verification routines are executed, and the process then terminates
      executeOnce: false
    }
  );
};