'use strict'; // Enforce strict mode for better error handling and cleaner code.

// This file contains Nodeunit tests for the 'htmlangular' Grunt task.
//
// ======== A Handy Little Nodeunit Reference ========
// For more details, see: https://github.com/caolan/nodeunit
//
// Test methods available:
// - test.expect(numAssertions) // Specifies the number of assertions expected to run in a test.
// - test.done()                 // Marks the end of a test.
//
// Test assertions:
// - test.ok(value, [message])                     // Asserts that 'value' is truthy.
// - test.equal(actual, expected, [message])       // Asserts that 'actual' is strictly equal to 'expected'.
// - test.notEqual(actual, expected, [message])    // Asserts that 'actual' is not strictly equal to 'expected'.
// - test.deepEqual(actual, expected, [message])   // Asserts that 'actual' is deeply equal to 'expected'.
// - test.notDeepEqual(actual, expected, [message])// Asserts that 'actual' is not deeply equal to 'expected'.
// - test.strictEqual(actual, expected, [message]) // Asserts that 'actual' is strictly equal to 'expected' (===).
// - test.notStrictEqual(actual, expected, [message])// Asserts that 'actual' is not strictly equal to 'expected' (!==).
// - test.throws(block, [error], [message])        // Asserts that a function throws an error.
// - test.doesNotThrow(block, [error], [message])  // Asserts that a function does not throw an error.
// - test.ifError(value)                           // Asserts that 'value' is falsy.

var

    // Require the 'path' module for path manipulation.
    path = require('path'),

    // Require 'child_process' and extract the 'exec' method for running shell commands.
    exec = require('child_process').exec,

    // Define options for the 'exec' command, setting the current working directory.
    execOptions = {
        // Set the current working directory to the parent of the current file's directory.
        cwd: path.join(__dirname, '..')
    }

; // End of variable declarations.

// Export the 'tests' object, which contains all the Nodeunit test cases.
exports.tests = {

    // Test case for the default options of the 'htmlangular' Grunt task.
    default_options: function ( test ) {

        // Expect one assertion in this test.
        test.expect( 1 );

        // Execute the Grunt task with default options.
        exec( 'grunt htmlangular:default_options', execOptions, function ( error, stdout ) {

            // Assert that the stdout contains the success message for validation.
            test.equal(
                stdout.indexOf( '6 files passed validation' ) > -1, // Check if the success string is present.
                true,                                              // Expected result is true.
                'valid files pass'                                 // Message if the assertion fails.
            );

            // Mark the end of the test.
            test.done();

        } );
    },

    // Test case for default options with concurrent processing enabled.
    default_options_concurrent: function ( test ) {

        // Expect one assertion.
        test.expect( 1 );

        // Run the Grunt task with concurrent option.
        exec( 'grunt htmlangular:default_options_concurrent', execOptions, function ( error, stdout ) {

            // Verify that all files passed validation.
            test.equal(
                stdout.indexOf( '6 files passed validation' ) > -1,
                true,
                'valid files pass'
            );

            // Complete the test.
            test.done();

        } );
    },

    // Test case for HTML content with missing wrapping elements.
    missing_wrapping: function ( test ) {

        // Expect four assertions for this test.
        test.expect( 4 );

        // Execute the Grunt task for the 'missing_wrapping' scenario.
        exec( 'grunt htmlangular:missing_wrapping', execOptions, function ( error, stdout ) {

            // Check for unwrapped starting <tr> tag.
            test.equal(
                stdout.indexOf( 'Stray start tag tr' ) > -1,
                true,
                'found unwrapped starting <tr>'
            );

            // Check for unwrapped starting <td> tag.
            test.equal(
                stdout.indexOf( 'Stray start tag td' ) > -1,
                true,
                'found unwrapped starting <tr>' // This message seems to be a copy-paste error from the original.
            );

            // Check for unwrapped ending <td> tag.
            test.equal(
                stdout.indexOf( 'Stray end tag td' ) > -1,
                true,
                'found unwrapped starting <tr>' // Another copy-paste error in the original.
            );

            // Check for unwrapped ending <tr> tag.
            test.equal(
                stdout.indexOf( 'Stray end tag tr' ) > -1,
                true,
                'found unwrapped starting <tr>' // Yet another copy-paste error in the original.
            );

            // Finish the test execution.
            test.done();

        } );
    },

    // Test case for HTML content containing custom tags that are not defined.
    missing_custom_tags: function ( test ) {

        // Expect a single assertion.
        test.expect( 1 );

        // Run the Grunt task with custom tags.
        exec( 'grunt htmlangular:missing_custom_tags', execOptions, function ( error, stdout ) {

            // Assert that the custom tag error message is found.
            test.equal(
                stdout.indexOf( 'Element custom-tag not allowed' ) > -1,
                true,
                'found custom tag'
            );

            // Signal that the test is complete.
            test.done();

        } );
    },

    // Test case for HTML content containing custom attributes that are not defined.
    missing_custom_attrs: function ( test ) {

        // Expect one assertion here.
        test.expect( 1 );

        // Execute the task for custom attributes.
        exec( 'grunt htmlangular:missing_custom_attrs', execOptions, function ( error, stdout ) {

            // Check for the custom attribute error message.
            test.equal(
                stdout.indexOf( 'Attribute fixed-div-label not allowed' ) > -1,
                true,
                'found custom attribute'
            );

            // Conclude the test.
            test.done();

        } );
    },

    // Test case for a template file missing its expected file extension.
    template_missing_extension: function ( test ) {

        // Only one assertion is expected.
        test.expect( 1 );

        // Run the task for templates with missing extensions.
        exec( 'grunt htmlangular:template_missing_extension', execOptions, function ( error, stdout ) {

            // Assert that a specific HTML validation error related to 'head' and 'title' is found.
            test.equal(
                stdout.indexOf( 'Element head is missing a required instance of child element title' ) > -1,
                true,
                'figured out it is just template' // Message indicating that the linter correctly identified it as a template issue.
            );

            // End the current test.
            test.done();

        } );
    },

    // Test case for HTML content with a missing closing tag.
    missing_closing_tag: function ( test ) {

        // Expect just one assertion.
        test.expect( 1 );

        // Execute the Grunt task for missing closing tags.
        exec( 'grunt htmlangular:missing_closing_tag', execOptions, function ( error, stdout ) {

            // Verify that the "Unclosed element div" error message is present.
            test.equal(
                stdout.indexOf( 'Unclosed element div' ) > -1,
                true,
                'found unclosed div'
            );

            // Indicate the completion of the test.
            test.done();

        } );
    },

    // Test case for HTML content with an improperly closed tag (e.g., self-closing a non-void element).
    improperly_closed_tag: function ( test ) {

        // Two assertions are expected for this test.
        test.expect( 2 );

        // Run the Grunt task for improperly closed tags.
        exec( 'grunt htmlangular:improperly_closed_tag', execOptions, function ( error, stdout ) {

            // Check for the error related to self-closing a non-void HTML element.
            test.equal(
                stdout.indexOf( 'Self-closing syntax (/>) used on a non-void HTML element' ) > -1,
                true,
                'found self-closed span'
            );

            // Check for the resulting unclosed element error.
            test.equal(
                stdout.indexOf( 'Unclosed element span' ) > -1,
                true,
                'found unclosed span'
            );

            // Mark the test as done.
            test.done();

        } );
    },

    // Test case for HTML content with improperly nested tags.
    improperly_nested_tags: function ( test ) {

        // This test expects two assertions.
        test.expect( 2 );

        // Execute the Grunt task for improperly nested tags.
        exec( 'grunt htmlangular:improperly_nested_tags', execOptions, function ( error, stdout ) {

            // Check for the error where <b> tag is closed too early.
            test.equal(
                stdout.indexOf( 'End tag b violates nesting rules' ) > -1,
                true,
                'found <b> closed too early'
            );

            // Check for the error where <i> tag is closed too late or improperly.
            test.equal(
                stdout.indexOf( 'No i element in scope but a i end tag seen' ) > -1,
                true,
                'found <i> closed too late'
            );

            // Finish the test.
            test.done();

        } );
    },

    // Test case for Angular expressions with improper operators (e.g., unescaped '&').
    improper_angular_operator: function ( test ) {

        // Expect one assertion.
        test.expect( 1 );

        // Run the Grunt task for improper Angular operators.
        exec( 'grunt htmlangular:improper_angular_operator', execOptions, function ( error, stdout ) {

            // Verify that the error message about unescaped '&' is found.
            test.equal(
                stdout.indexOf( '& did not start a character reference. (& probably should have been escaped as &amp;.)' ) > -1,
                true,
                'found && in expression' // Message indicating that '&&' was found and flagged.
            );

            // Complete the test.
            test.done();

        } );
    },

    // Test case for Angular expressions with improper operators, but with relaxed validation.
    improper_angular_operator_relaxed: function ( test ) {

        // This test expects one assertion.
        test.expect( 1 );

        // Execute the Grunt task with relaxed settings for improper Angular operators.
        exec( 'grunt htmlangular:improper_angular_operator_relaxed', execOptions, function ( error, stdout ) {

            // Assert that the error message about unescaped '&' is *not* found due to relaxed settings.
            test.equal(
                stdout.indexOf( '& did not start a character reference. (& probably should have been escaped as &amp;.)' ) === -1,
                true,
                'relaxed ignored error' // Message indicating that the error was successfully ignored.
            );

            // Finalize the test.
            test.done();

        } );
    }

}; // End of exports.tests object.