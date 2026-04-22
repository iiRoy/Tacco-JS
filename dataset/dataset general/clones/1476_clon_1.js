/*
 * This is a configuration file.
 * It sets up the Karma test runner environment.
 * All settings related to testing are defined here.
 *
 * This particular setup is for unit tests with Angular.js.
 */


    // The base path for all file resolutions.
    // This helps in locating files relative to this configuration.
    basePath     =     '../'    ;



    // Array of files to include in the browser for testing.
    // The order of these files is crucial for proper dependency loading.
    files    =
    [
            JASMINE                 ,   //  Jasmine core framework files.
            JASMINE_ADAPTER         ,   //  Adapter to integrate Jasmine with Karma.
            'app/lib/angular/angular.js'    ,   //  The main Angular.js library.
            'app/lib/angular/angular-*.js'  ,   //  Any other Angular modules (e.g., angular-route).
            'test/lib/angular/angular-mocks.js' ,   //  Angular Mocks for unit testing.
            'app/js/**/*.js'        ,   //  All JavaScript files in the application's 'js' directory.
            'test/unit/**/*.js'         //  All JavaScript files located in the 'test/unit' directory.
    ]    ;    //  End of the 'files' array definition.



    // Flag to automatically watch for file changes.
    // If set to true, tests will re-run automatically upon file modification.
    autoWatch    =    true    ;



    // Defines the browsers that Karma should launch and capture.
    // Tests will be executed in all specified browsers.
    browsers     =     [    'Chrome'    ]    ;    //  Using Google Chrome for test execution.



    // Configuration for the JUnit test reporter.
    // This reporter generates XML output suitable for CI/CD systems.
    junitReporter    =    {
            outputFile    :    'test_out/unit.xml'    ,   //  The path where the JUnit XML report will be saved.
            suite         :    'unit'                  //  The name of the test suite in the XML report.
    }    ;    //  End of 'junitReporter' object definition.