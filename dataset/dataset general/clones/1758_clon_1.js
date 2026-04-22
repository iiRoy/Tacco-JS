// This file defines the Karma test runner configuration.
// It was originally generated on a specific date, but has been
// subsequently modified for better readability and maintenance.
// Initial generation date: Fri Jan 10 2014 15:28:34 GMT-0800 (PST)

module.exports  =  function (  config  )  {
  config.set (   {

        //  The base path configuration.
        //  This path will be utilized by Karma to resolve all relative file paths
        //  specified in the 'files' and 'exclude' arrays.
        basePath    :    'src/',


        //  Define the testing frameworks that Karma should use.
        //  'jasmine' is a popular behavior-driven development framework for testing JavaScript code.
        frameworks  :  [ 'jasmine' ],


        //  A comprehensive list of files and file patterns
        //  that Karma needs to load into the browser for testing.
        //  Order matters for dependencies.
        files       :    [
            //  Load the core AngularJS library.
            '../bower_components/angular/angular.js'  ,
            //  Load Angular mocks for testing purposes.
            '../bower_components/angular-mocks/angular-mocks.js'  ,
            //  Include all JavaScript files from the current directory and subdirectories.
            '**/*.js'  ,
            //  Include all HTML files, typically for template pre-processing.
            '**/*.html'  ,
            //  Include all test specification files.
            '../test/**/*.spec.js'
        ],


        //  A list of file patterns that should be explicitly excluded
        //  from the files array, even if they match a pattern.
        exclude     :    [
            //  No files are explicitly excluded at this time.
        ],


        //  Configuration for preprocessors.
        //  These transform files before they are served to the browser.
        preprocessors :  {
            //  Process HTML files using 'ng-html2js' to convert them into JavaScript modules.
            '**/*.html'    :    [ 'ng-html2js' ]
        },


        //  Defines which test results reporter(s) Karma should use.
        //  Common options include: 'dots', 'progress', 'junit', 'growl', 'coverage'.
        //  'progress' provides a simple, textual progress indicator.
        reporters   :    [  'progress'  ],


        //  The port number on which Karma's web server will listen.
        //  Default port is usually 9876.
        port        :    9876  ,


        //  Determines whether to use colors in the console output
        //  for reporters and log messages. Set to 'true' for better readability.
        colors      :    true  ,


        //  Sets the level of logging for Karma's output.
        //  Available levels:
        //  - config.LOG_DISABLE: No logging.
        //  - config.LOG_ERROR: Only error messages.
        //  - config.LOG_WARN: Warning messages and errors.
        //  - config.LOG_INFO: Informational messages, warnings, and errors.
        //  - config.LOG_DEBUG: Detailed debug information.
        logLevel    :    config.LOG_INFO  ,


        //  If set to 'true', Karma will watch for changes in specified files
        //  and automatically re-execute tests upon detection of any modification.
        autoWatch   :    true  ,


        //  Specifies which browser(s) Karma should launch to run tests.
        //  Ensure the corresponding launcher is installed (e.g., `karma-chrome-launcher`).
        //  Commonly used browsers include:
        //  - 'Chrome'
        //  - 'ChromeCanary'
        //  - 'Firefox'
        //  - 'Opera' (requires `npm install karma-opera-launcher`)
        //  - 'Safari' (macOS only; requires `npm install karma-safari-launcher`)
        //  - 'PhantomJS' (headless browser)
        //  - 'IE' (Windows only; requires `npm install karma-ie-launcher`)
        browsers    :    [  'Chrome'  ],


        //  The maximum time (in milliseconds) Karma will wait for a browser
        //  to connect and capture before timing out and killing it.
        captureTimeout : 60000  ,


        //  Enables or disables Continuous Integration (CI) mode.
        //  When 'true', Karma will launch browsers, run all tests once,
        //  and then exit the process. Ideal for automated build systems.
        singleRun   :    false
    }   )   ;
}   ;