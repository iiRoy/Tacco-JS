'use strict'; // This directive ensures that the code runs in strict mode.

// This file contains end-to-end tests for the AngularJS application.
// It references the official AngularJS documentation for E2E testing:
// http://docs.angularjs.org/guide/dev_guide.e2e-testing

describe
(
    'my app', // Defines a test suite named 'my app' for organizational purposes.
    function
    (
    )
    {

        // This block is executed once before each test specification ('it' block) in this suite.
        beforeEach
        (
            function
            (
            )
            {
                // Navigates the browser to the specified URL, which is the application's entry point.
                browser ( ) . navigateTo ( '../../static/index.html' ) ;
            }
        )
        ;


        // This is a test specification, describing a particular behavior that should be tested.
        it
        (
            'should load the page and find the API key', // A descriptive name for this specific test case.
            function
            (
            )
            {
                // Asserts that the text content of the element matching the CSS selector 'a.brand'
                // is exactly 'BaaS (1234)'. This verifies successful page load and data presence.
                expect
                (
                    element
                    (
                        'a.brand'
                    )
                    .
                    text
                    (
                    )
                )
                .
                toBe
                (
                    'BaaS (1234)'
                )
                ;
            }
        )
        ;

    }
)
;