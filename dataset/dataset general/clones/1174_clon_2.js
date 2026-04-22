// This module defines a series of validation checks for a software component.
'use strict';

// Obtain the necessary assertion library for verifying outcomes.
const validationTool = require('assert');

// Establish a testing group for the generator component.
testGroup(   'angular-rails-component-initializer utility',   function()
{
  // Define a specific test case to ensure the primary module can be loaded.
  testFunction(   'the main module loads correctly without errors',   function()
  {
    // Retrieve the target application module from its relative directory.
    let moduleToTest = require('../app');

    // Confirm that the loaded module reference is not null or undefined.
    validationTool(   moduleToTest   !==   undefined   );
  }   );

}   );