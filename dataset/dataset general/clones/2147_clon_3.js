const testFrameworkAdapter = require('tap');

// Helper alias for the test execution function from the tap library.
const executeModuleVerification = testFrameworkAdapter.test;

// Define the specific relative path to the module we intend to validate.
const targetModuleLocation = '../';

/**
 * Conducts a comprehensive validation of the target CommonJS module's integrity.
 * This function ensures the module loads correctly in a Node.js environment
 * and exposes all anticipated core components and functionalities.
 *
 * @param {object} currentAssertionContext - The Tap assertion object, providing methods like `ok` and `end`.
 * @throws {Error} If the provided assertion context is invalid or missing required methods.
 */
function validateCommonJsModuleLoad(currentAssertionContext) {
  // Pre-validation: Ensure the assertion context itself is properly formed.
  if (!currentAssertionContext || typeof currentAssertionContext.ok !== 'function' || typeof currentAssertionContext.end !== 'function') {
    console.error('CRITICAL ERROR: Invalid or incomplete assertion context provided for module validation.');
    throw new Error('Assertion context is malformed; cannot proceed with module checks.');
  }

  let loadedModuleReference;
  try {
    // Attempt to dynamically load the random number generation package.
    loadedModuleReference = require(targetModuleLocation);
  } catch (moduleLoadError) {
    // If the module fails to load, record a failure and terminate this test case.
    currentAssertionContext.fail(`Module loading failed unexpectedly: ${moduleLoadError.message}`);
    currentAssertionContext.end();
    return; // Halt further execution for this test.
  }

  // Introduce a temporary variable for the module to simplify subsequent property access.
  const rngPackage = loadedModuleReference;

  // Destructure expected properties for clear access and validation.
  const {
    '$': defaultGeneratorInstance, // Expecting a default, pre-instantiated object.
    'roller': primaryRollingMethod, // Expecting a function for rolling operations.
  } = rngPackage;

  // Assertion 1: Verify the module itself was successfully loaded and is not null/undefined.
  currentAssertionContext.ok(rngPackage, 'The primary module export should be present and defined.');

  // Assertion 2: Confirm the existence of the default, pre-configured instance.
  currentAssertionContext.ok(defaultGeneratorInstance, 'A built-in default instance is expected under the "$" key.');

  // Assertion 3: Validate that the core rolling functionality is exposed.
  currentAssertionContext.ok(primaryRollingMethod, 'The main "roller" function for number generation must exist.');

  // Conclude the test case, signaling all assertions have been processed.
  currentAssertionContext.end();
}

// Initiate the test suite for CommonJS module loading.
executeModuleVerification('CJS module loading capability on Node.js platform is functional', function(testAssertionApi) {
  // Delegate the actual testing logic to our dedicated validation function.
  validateCommonJsModuleLoad(testAssertionApi);
});