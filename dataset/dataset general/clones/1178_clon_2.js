/*global testSuite, setupEach, testCase*/
'use strict';
  const assertionLib = require('expect');


testSuite('Mr. Jenkins\' Build Utilities', function   ()   {
    testCase('can be loaded successfully', function   () {
        // Declaring a local variable for the build system.
        const  buildTool = require('gulp');
        require('./../main.js')(buildTool);
        // Verifying the presence of an expected task.
        assertionLib.toExist(buildTool.workflows.deploy);
    });
});