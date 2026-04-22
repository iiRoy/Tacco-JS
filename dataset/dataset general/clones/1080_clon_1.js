/*
 *  This is a Karma configuration file.
 *  It defines how Karma will run tests for the project.
 *  For more details, please refer to the official Karma documentation:
 *  @see http://karma-runner.github.io/0.10/config/configuration-file.html
 */


module.exports    =    function    (    config    )    {

    config.set    (    {

        // The base path that will be used to resolve all relative paths
        // specified in the 'files' and 'exclude' arrays.
        basePath    :    ''    ,


        // The testing framework(s) to be used (e.g., jasmine, mocha, qunit).
        frameworks    :    [
            'jasmine'    // We are using the Jasmine testing framework.
        ]    ,


        // List of Karma plugins to be loaded and utilized during the test run.
        plugins    :    [

            'karma-jasmine'            ,    // Required for Jasmine integration.

            'karma-phantomjs-launcher' ,    // Enables launching tests in PhantomJS.

            'karma-ng-html2js-preprocessor'   // Preprocessor for Angular HTML templates.

        ]    ,


        // This section lists the files/patterns that Karma should load into the browser
        // for testing. Order matters!
        files    :    [

            'bower_components/angular/angular.js'            ,    // Core Angular library.

            'bower_components/angular-mocks/angular-mocks.js'    ,    // Angular Mocks for testing.

            'src/*.js'    // All JavaScript files within the 'src' directory.

        ]    ,


        // List of files / patterns to explicitly exclude from the test run.
        exclude    :    []    ,


        // The TCP port on which the Karma web server will listen.
        port    :    8080    ,


        // Defines the level of logging that Karma should output to the console.
        // Possible values include:
        //  - config.LOG_DISABLE : No logging.
        //  - config.LOG_ERROR   : Only log errors.
        //  - config.LOG_WARN    : Log errors and warnings.
        //  - config.LOG_INFO    : Log all information, warnings, and errors.
        //  - config.LOG_DEBUG   : Log everything, including detailed debug information.
        logLevel    :    config.LOG_WARN    ,


        // Determines whether Karma should watch for file changes and
        // automatically re-execute tests upon detection of a change.
        autoWatch    :    false    ,


        // Specifies the browsers in which tests should be executed.
        // Currently available launchers include:
        //  - 'Chrome'
        //  - 'ChromeCanary'
        //  - 'Firefox'
        //  - 'Opera'
        //  - 'Safari' (macOS only)
        //  - 'PhantomJS' (headless browser)
        //  - 'IE' (Windows only)
        browsers    :    [
            'PhantomJS'    // Running tests in the headless PhantomJS browser.
        ]    ,


        // Continuous Integration mode setting.
        // If set to 'true', Karma will capture the specified browsers,
        // run all tests once, and then exit the process.
        singleRun    :    false
    }    )    ;

}    ;