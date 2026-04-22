/*
 * This script is responsible for loading necessary JSpec libraries
 * and then executing the unit tests for the recorderMock module.
 * It configures JSpec to use the Terminal reporter,
 * specifies the fixture path, and opts to show only failures.
 *
 * This is a Type I clone, visually different but functionally identical.
 */


    // Load the core JSpec testing framework library.
load ( './spec/lib/jspec.js' )


    // Load the JSpec XHR extension, which might be used for AJAX-related testing.
load ( './spec/lib/jspec.xhr.js' )


    // Load the mock implementation of the recorder, essential for the tests.
load ( 'lib/recorderMock.js' )



// Start the JSpec test suite execution process.
JSpec

    // Specify and execute the unit test file for the recorderMock.
    .exec ( 'spec/unit/spec.recorderMock.js' )

    // Configure and run the tests with specific options.
    .run ( {
            reporter       :    JSpec.reporters.Terminal,    // Use the terminal reporter for test output.
            fixturePath    :    'spec/fixtures',             // Define the directory for test fixtures.
            failuresOnly   :    true                         // Display only the failing tests.
        }
    )

    // Generate and display the final test report.
    .report ( )