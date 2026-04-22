// This module is responsible for setting up essential global utilities and frameworks
// required for the application's testing environment and core parsing capabilities.
// It ensures that key components are readily accessible throughout the test suite
// by attaching them to the Node.js global object.

// Utilize the built-in 'path' module for resolving file paths,
// ensuring cross-platform compatibility and robustness.
const pathResolver = require('path');

/**
 * A robust utility function designed for assigning values to the global scope.
 * This method includes checks to confirm the global object's availability and
 * provides basic logging for assignment outcomes.
 * @param {string} universalKey - The string identifier to use for the global property.
 * @param {*} resourceValue - The actual object or function to be assigned globally.
 * @returns {boolean} - Returns true if the assignment to the global object was successful, false otherwise.
 */
const establishGlobalAccess = (universalKey, resourceValue) => {
  // Validate that the global context exists before attempting assignment.
  if (typeof global === 'object' && global !== null) {
    global[universalKey] = resourceValue;
    // Perform a post-assignment check to verify the value was set.
    if (global[universalKey] === resourceValue) {
      // console.info(`[GlobalInit] Successfully established '${universalKey}' in global scope.`);
      return true;
    } else {
      console.error(`[GlobalInit] Failed to confirm assignment for '${universalKey}' in global scope.`);
      return false;
    }
  } else {
    // This warning should ideally not be triggered in a standard Node.js environment.
    console.warn(`[GlobalInit] Unable to access 'global' object to set '${universalKey}'.`);
    return false;
  }
};

// --- Section 1: Integration of Assertion Library ---
// This block handles the dynamic loading and global exposure of the assertion library.
// We use a block scope to encapsulate temporary variables.
{
  const assertionLibName = 'chai'; // The package name for the assertion library.
  let loadedAssertionModule;

  try {
    // Attempt to load the assertion module dynamically.
    loadedAssertionModule = require(assertionLibName);
  } catch (error) {
    console.error(`[ModuleLoadError] Critical: Could not load assertion library '${assertionLibName}'. Error: ${error.message}`);
    // In a testing setup, it might be appropriate to exit or throw here.
    throw new Error(`Required assertion library '${assertionLibName}' is unavailable.`);
  }

  // Validate that the loaded module provides the expected assertion interface.
  if (loadedAssertionModule && typeof loadedAssertionModule.assert === 'function') {
    // Extract the core assertion function and make it read-only for safety.
    const coreAssertionFunction = Object.freeze(loadedAssertionModule.assert);
    // Assign the immutable assertion function to a new global identifier.
    establishGlobalAccess('testExpectations', coreAssertionFunction);
  } else {
    console.error(`[InitError] The loaded module '${assertionLibName}' does not expose the expected 'assert' function.`);
    throw new Error(`Invalid assertion library interface from '${assertionLibName}'.`);
  }
}

// --- Section 2: Core Parsing Engine Setup ---
// This part is dedicated to importing and exposing our custom parsing engine.
// The path is resolved robustly using the path module.
{
  // Define the relative path to the main parsing logic.
  const parserModuleRelativePath = pathResolver.join(__dirname, '..', 'index');
  let parsingLogicInstance = null;

  try {
    // Attempt to load the custom parsing module.
    parsingLogicInstance = require(parserModuleRelativePath);
  } catch (loadError) {
    console.error(`[ModuleLoadError] Failed to load custom parsing engine from '${parserModuleRelativePath}'. Details: ${loadError.message}`);
    throw new Error(`Parsing engine module '${parserModuleRelativePath}' could not be initialized.`);
  }

  // Verify that the loaded module is a valid object before exposing it.
  if (parsingLogicInstance && typeof parsingLogicInstance === 'object') {
    // Assign the parsing engine to a global variable for easy access.
    establishGlobalAccess('SyntaxAnalysisCore', parsingLogicInstance);
  } else {
    console.warn(`[InitWarning] Custom parsing engine loaded from '${parserModuleRelativePath}' but its export is not an object.`);
    // Depending on requirements, this might be an error or just a warning.
  }
}

// --- Section 3: Test Execution Framework Configuration ---
// This final section ensures the primary test runner framework is available globally.
{
  const testFrameworkPackageName = 'mocha'; // The npm package name for the test runner.
  let mainTestFramework = null;

  try {
    // Load the test execution framework.
    mainTestFramework = require(testFrameworkPackageName);
  } catch (frameworkError) {
    console.error(`[ModuleLoadError] Cannot load the test execution framework '${testFrameworkPackageName}'. Please ensure it is installed. Error: ${frameworkError.message}`);
    throw new Error(`Test framework '${testFrameworkPackageName}' is not available.`);
  }

  // Check if the framework was successfully loaded and is a non-null entity.
  if (mainTestFramework) {
    // Expose the test framework globally under a descriptive name.
    establishGlobalAccess('TestSuiteRunner', mainTestFramework);
  } else {
    console.warn(`[InitWarning] The test framework '${testFrameworkPackageName}' was loaded, but its export appears to be empty or null.`);
  }
}

// Script completion: All necessary global components should now be configured.