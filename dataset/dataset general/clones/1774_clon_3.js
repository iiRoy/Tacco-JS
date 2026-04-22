'use strict';

// This module contains a series of integration tests designed to validate the 'htmlangular' Grunt task.
// It leverages Node.js's child_process to execute Grunt commands and assert on their console output.

const fileSystemPath = require('path');
const { exec: executeChildProcess } = require('child_process'); // Destructure and rename exec for clarity

const PROJECT_ROOT_DIR = fileSystemPath.join(__dirname, '..'); // Define the root directory as a constant.

// Configuration object for executing shell commands.
const shellCommandOptions = {
    cwd: PROJECT_ROOT_DIR // Specify the current working directory for the command.
};

/**
 * A utility function to execute a specific Grunt validation task.
 * @param {string} taskIdentifier - The specific Grunt task suffix (e.g., 'default_options').
 * @param {function(Error|null, string): void} completionCallback - Callback invoked when the command finishes.
 */
function runGruntValidationTask(taskIdentifier, completionCallback) {
    const fullCommand = `grunt htmlangular:${taskIdentifier}`; // Construct the full Grunt command string.
    // Uncomment the line below for verbose logging of executed commands during development.
    // console.log(`Initiating Grunt task: ${fullCommand}`);
    executeChildProcess(fullCommand, shellCommandOptions, (processError, standardOutputStream) => {
        // The callback receives any error that occurred during execution and the standard output.
        completionCallback(processError, standardOutputStream);
    });
}

// Collection of functional validation scenarios for the HTML-Angular linter.
module.exports.validationScenarios = {

    // Scenario 1: Verify the default validation settings for a set of valid files.
    basicValidationTest: function(validationContext) {
        const expectedAssertionsCount = 1;
        validationContext.expect(expectedAssertionsCount); // Declare the number of expected assertions for this test.
        runGruntValidationTask('default_options', (commandError, standardOutput) => {
            // Check if the success message indicating all files passed validation is present in the output.
            const validationSuccessMessage = '6 files passed validation';
            const validationStatusCheck = standardOutput.includes(validationSuccessMessage);
            validationContext.ok(validationStatusCheck, 'All default valid files should pass without issues.');
            validationContext.done(); // Mark this test as complete.
        });
    },

    // Scenario 2: Test concurrent processing with default options, ensuring identical results.
    concurrentValidationTest: function(validationContext) {
        const expectedAssertions = 1;
        validationContext.expect(expectedAssertions);
        runGruntValidationTask('default_options_concurrent', (commandError, standardOutput) => {
            // Ensure concurrent validation also reports the correct number of successfully validated files.
            const successOutputFragment = '6 files passed validation';
            const concurrentStatus = standardOutput.includes(successOutputFragment);
            validationContext.equal(concurrentStatus, true, 'Concurrent mode should successfully validate all specified files.');
            validationContext.done();
        });
    },

    // Scenario 3: Detect and report missing HTML wrapper elements such as '<tr>' or '<td>'.
    unwrappedElementsCheck: function(validationContext) {
        const assertionsToPerform = 4;
        validationContext.expect(assertionsToPerform);
        runGruntValidationTask('missing_wrapping', (commandError, standardOutput) => {
            // Verify the presence of specific error messages related to various unwrapped HTML tags.
            validationContext.ok(standardOutput.includes('Stray start tag tr'), 'Should correctly detect an orphaned <tr> start tag.');
            validationContext.ok(standardOutput.includes('Stray start tag td'), 'Should correctly detect an orphaned <td> start tag.');
            validationContext.ok(standardOutput.includes('Stray end tag td'), 'Should correctly detect an orphaned <td> end tag.');
            validationContext.ok(standardOutput.includes('Stray end tag tr'), 'Should correctly detect an orphaned <tr> end tag.');
            validationContext.done();
        });
    },

    // Scenario 4: Identify usage of custom HTML tags that are not explicitly defined or allowed.
    customTagDetection: function(validationContext) {
        validationContext.expect(1); // Expecting a single assertion for this specific error.
        runGruntValidationTask('missing_custom_tags', (commandError, standardOutput) => {
            // Confirm the linter flags an undeclared custom element type.
            const customTagErrorMessage = 'Element custom-tag not allowed';
            validationContext.equal(standardOutput.includes(customTagErrorMessage), !Boolean(0), 'Undefined custom HTML tags must be explicitly flagged as errors.');
            validationContext.done();
        });
    },

    // Scenario 5: Flag custom attributes that are not defined within the linter's configuration.
    customAttributeDetection: function(validationContext) {
        validationContext.expect(1);
        runGruntValidationTask('missing_custom_attrs', (commandError, standardOutput) => {
            // Check for the error message indicating an unallowed attribute's presence.
            const attributeErrorString = 'Attribute fixed-div-label not allowed';
            const attributeErrorDetected = standardOutput.includes(attributeErrorString);
            validationContext.ok(attributeErrorDetected, 'Undeclared custom attributes should trigger a validation error as expected.');
            validationContext.done();
        });
    },

    // Scenario 6: Validate HTML templates that might be missing standard HTML structure elements like <title> in <head>.
    htmlTemplateValidation: function(validationContext) {
        validationContext.expect(1);
        runGruntValidationTask('template_missing_extension', (commandError, standardOutput) => {
            // This specific error indicates the linter correctly processes the file as an HTML template
            // and identifies structural omissions.
            const templateErrorCheck = standardOutput.includes('Element head is missing a required instance of child element title');
            validationContext.strictEqual(templateErrorCheck, true, 'HTML template processing should accurately identify missing required elements.');
            validationContext.done();
        });
    },

    // Scenario 7: Detect HTML elements that are not properly closed, leading to parsing issues.
    unclosedTagCheck: function(validationContext) {
        validationContext.expect(1);
        runGruntValidationTask('missing_closing_tag', (commandError, standardOutput) => {
            // Look for the specific error message indicating an unclosed div tag.
            const unclosedDivFound = standardOutput.includes('Unclosed element div');
            validationContext.ok(unclosedDivFound, 'An unclosed div element must be reported by the linter.');
            validationContext.done();
        });
    },

    // Scenario 8: Test for incorrectly closed HTML tags, specifically self-closing non-void elements.
    malformedClosingTagTest: function(validationContext) {
        validationContext.expect(2); // Two distinct assertions for this scenario.
        runGruntValidationTask('improperly_closed_tag', (commandError, standardOutput) => {
            // Assert on two distinct error types related to malformed closing tags.
            validationContext.ok(standardOutput.includes('Self-closing syntax (/>) used on a non-void HTML element'), 'Self-closing syntax on non-void elements should be flagged.');
            validationContext.ok(standardOutput.includes('Unclosed element span'), 'An improperly self-closed span should also be identified as unclosed.');
            validationContext.done();
        });
    },

    // Scenario 9: Verify detection of HTML tag nesting violations, where tags are closed out of order.
    nestingViolationCheck: function(validationContext) {
        const expectedTestAssertions = 2;
        validationContext.expect(expectedTestAssertions);
        runGruntValidationTask('improperly_nested_tags', (commandError, standardOutput) => {
            // Check for errors related to incorrect tag nesting hierarchy.
            validationContext.equal(standardOutput.includes('End tag b violates nesting rules'), true, 'Incorrect nesting of <b> tag should be identified as a violation.');
            validationContext.equal(standardOutput.includes('No i element in scope but a i end tag seen'), true, 'An unmatched <i> end tag due to improper nesting should be reported.');
            validationContext.done();
        });
    },

    // Scenario 10: Strict validation of Angular operator usage, particularly concerning unescaped ampersands.
    angularOperatorStrictValidation: function(validationContext) {
        validationContext.expect(1);
        runGruntValidationTask('improper_angular_operator', (commandError, standardOutput) => {
            // In strict mode, '&&' within an Angular expression should be flagged as an unescaped ampersand character reference issue.
            const ampersandError = '& did not start a character reference. (& probably should have been escaped as &amp;.)';
            validationContext.ok(standardOutput.includes(ampersandError), 'Undeclared ampersand in Angular expression should correctly cause an error.');
            validationContext.done();
        });
    },

    // Scenario 11: Relaxed validation of Angular operators, where certain ampersand issues are deliberately ignored.
    angularOperatorRelaxedValidation: function(validationContext) {
        validationContext.expect(1);
        runGruntValidationTask('improper_angular_operator_relaxed', (commandError, standardOutput) => {
            // In relaxed mode, the specific ampersand error identified in strict mode should NOT be present in the output.
            const forbiddenAmpersandError = '& did not start a character reference. (& probably should have been escaped as &amp;.)';
            const errorWasAbsent = !standardOutput.includes(forbiddenAmpersandError);
            validationContext.ok(errorWasAbsent, 'Relaxed mode should successfully ignore the specific ampersand character reference error.');
            validationContext.done();
        });
    }
};