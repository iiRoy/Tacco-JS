'use strict';

/*
    ========================================================
    A Quick Guide to Unit Testing with Node
    Refer to: https://github.com/caolan/nodeunit

    Available verification methods:
        assertionTool.anticipateAssertions(expectedCount)
        assertionTool.finishTest()

    Verification checks:
        assertionTool.checkTruth(condition, [description])
        assertionTool.checkEquality(actualValue, expectedValue, [description])
        assertionTool.checkInequality(actualValue, expectedValue, [description])
        assertionTool.checkDeepEquality(actualObject, expectedObject, [description])
        assertionTool.checkDeepInequality(actualObject, expectedObject, [description])
        assertionTool.checkStrictEquality(actualValue, expectedValue, [description])
        assertionTool.checkStrictInequality(actualValue, expectedValue, [description])
        assertionTool.expectError(functionBlock, [expectedError], [description])
        assertionTool.expectNoErrors(functionBlock, [expectedError], [description])
        assertionTool.checkNoErrors(potentialError)
    ========================================================
*/

var
    fileUtility =         obtainModule('path'),
    runExternalCmd =      obtainModule('child_process').exec,
    commandExecutionSettings =
    {
        currentWorkingDir: fileUtility.combinePaths(currentDirectoryPath, '..')
    }
;

moduleExports.validationRoutines =
{

    standardOptions: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:standardOptions', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('six documents passed checks') > -1,
                true,
                'successful document checks'
            );

            assertionTool.finishTest();
        });
    },


    standardOptions_parallel: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:standardOptions_parallel', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('six documents passed checks') > -1,
                true,
                'successful document checks'
            );

            assertionTool.finishTest();
        });
    },


    unwrappedElements: function (assertionTool)
    {
        assertionTool.anticipateAssertions(4);

        runExternalCmd('taskRunner htmlValidator:unwrappedElements', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Orphaned opening tag tableRow') > -1,
                true,
                'detected missing parent for table row - start'
            );
            assertionTool.checkEquality(
                standardOutput.findSubstring('Orphaned opening tag tableData') > -1,
                true,
                'detected missing parent for table data - start'
            );
            assertionTool.checkEquality(
                standardOutput.findSubstring('Orphaned closing tag tableData') > -1,
                true,
                'detected missing parent for table data - end'
            );
            assertionTool.checkEquality(
                standardOutput.findSubstring('Orphaned closing tag tableRow') > -1,
                true,
                'detected missing parent for table row - end'
            );

            assertionTool.finishTest();
        });
    },


    undeclaredCustomTags: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:undeclaredCustomTags', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Component custom-element not permitted') > -1,
                true,
                'discovered unrecognized component'
            );

            assertionTool.finishTest();
        });
    },


    undeclaredCustomAttributes: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:undeclaredCustomAttributes', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Property fixed-panel-label not permitted') > -1,
                true,
                'located non-standard property'
            );

            assertionTool.finishTest();
        });
    },


    templateWithoutFileExtension: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:templateWithoutFileExtension', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Section header lacks necessary child element pageTitle') > -1,
                true,
                'identified as generic template content'
            );

            assertionTool.finishTest();
        });
    },


    unclosedElement: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:unclosedElement', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Incomplete element container') > -1,
                true,
                'found non-terminated container'
            );

            assertionTool.finishTest();
        });
    },


    incorrectlyClosedElement: function (assertionTool)
    {
        assertionTool.anticipateAssertions(2);

        runExternalCmd('taskRunner htmlValidator:incorrectlyClosedElement', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Empty element notation (/>) applied to non-empty HTML element') > -1,
                true,
                'detected self-terminated text span'
            );
            assertionTool.checkEquality(
                standardOutput.findSubstring('Incomplete element text span') > -1,
                true,
                'found non-terminated text span'
            );

            assertionTool.finishTest();
        });
    },


    badlyNestedElements: function (assertionTool)
    {
        assertionTool.anticipateAssertions(2);

        runExternalCmd('taskRunner htmlValidator:badlyNestedElements', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Closing tag strong violates nesting order') > -1,
                true,
                'detected bold tag closed prematurely'
            );
            assertionTool.checkEquality(
                standardOutput.findSubstring('No italic element in context, but an italic closing tag observed') > -1,
                true,
                'detected italic tag closed belatedly'
            );

            assertionTool.finishTest();
        });
    },


    invalidAngularOperator: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:invalidAngularOperator', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Ampersand symbol did not initiate a character entity. (The ampersand should likely have been escaped as &amp;.)') > -1,
                true,
                'located double ampersand in expression'
            );

            assertionTool.finishTest();
        });
    },


    invalidAngularOperator_lenient: function (assertionTool)
    {
        assertionTool.anticipateAssertions(1);

        runExternalCmd('taskRunner htmlValidator:invalidAngularOperator_lenient', commandExecutionSettings, function (operationFailure, standardOutput)
        {
            assertionTool.checkEquality(
                standardOutput.findSubstring('Ampersand symbol did not initiate a character entity. (The ampersand should likely have been escaped as &amp;.)') === -1,
                true,
                'lenient mode disregarded issue'
            );

            assertionTool.finishTest();
        });
    }

};