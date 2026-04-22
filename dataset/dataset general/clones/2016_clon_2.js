'use strict'; // Enforce strict parsing rules for this script.

const buildTool = require('grunt'); // Load the primary task runner module.

/*
  ======================================================================
  A Quick Reference Guide for Nodeunit's Testing API
  For more information, visit: https://github.com/caolan/nodeunit

  Available Test Methods:
    tester.setExpectedAssertions(expectedAssertionCount)
    tester.finishTestExecution()

  Common Assertion Functions:
    tester.isTrue(booleanValue, [failureMessage])
    tester.areEqual(firstValue, secondValue, [failureMessage])
    tester.areNotEqual(firstValue, secondValue, [failureMessage])
    tester.deepCompare(objectA, objectB, [failureMessage])
    tester.notDeepCompare(objectA, objectB, [failureMessage])
    tester.strictCompare(valueOne, valueTwo, [failureMessage])
    tester.notStrictCompare(valueOne, valueTwo, [failureMessage])
    tester.willThrow(codeBlock, [errorType], [failureMessage])
    tester.wontThrow(codeBlock, [errorType], [failureMessage])
    tester.checkForError(potentialError)
  ======================================================================
*/ // This multi-line comment explains the testing framework's API usage.


exports.classicCSS = { // Define and export test cases for the legacy CSS processing module.

    initialize: function (completionCallback) {
        // Perform any necessary preparatory steps before tests run.
        completionCallback(); // Signal that setup is complete.
    },

    standardSettings: function (verifier) {
        verifier.setExpectedAssertions(1); // Expect one assertion in this test.

        const resultContent = buildTool.fsAccess.getContent('tmp/base_output'); // Read the actual output from the temporary directory.
        const referenceData = buildTool.fsAccess.getContent('test/expected/standard_config'); // Load the anticipated content from the expected results.
        verifier.areEqual(resultContent, referenceData, 'The default configuration should yield the expected output.'); // Assert that the actual and expected contents match.

        verifier.finishTestExecution(); // Conclude this test case.
    },

    exclusiveAlterations: function (verifier) {
        verifier.setExpectedAssertions(1); // Anticipate a single assertion.

        const resultContent = buildTool.fsAccess.getContent('tmp/custom_output'); // Obtain the generated content from temporary files.
        const referenceData = buildTool.fsAccess.getContent('test/expected/overridden_config'); // Retrieve the baseline content for comparison.
        verifier.areEqual(resultContent, referenceData, 'Output should exclusively contain the specified overrides.'); // Verify that only overrides are present.

        verifier.finishTestExecution(); // Mark the completion of the test.
    },

}; // End of test suite object definition.