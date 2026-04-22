// This module serves as a unit test to confirm the proper exposure of key functionalities
// within our internal utility library. It ensures that the primary API entry points
// are correctly defined and accessible at the expected top-level scope.

// Utilize the 'const' keyword for module imports, promoting immutability for the reference.
// The path has been adjusted to reflect a potentially refactored or relocated utility source.
const primaryToolbelt = require('./foundation_components');

// Export a test function via 'module.exports' to align with common module patterns.
// The descriptive key for this test has been altered for clarity and consistency.
module.exports['validateCoreApiExposure'] = function (assertionEngine) {

    // Begin with a preliminary check: ensure that the required utility module
    // was successfully loaded. If not, this indicates a critical failure
    // in the module resolution or loading process, preventing further tests.
    if (!primaryToolbelt) {
        assertionEngine.fail('Critical: The primary utility toolbelt failed to load or is null.');
        return; // Terminate test execution early if the module is unavailable.
    }

    // Define the expected data type for the specific API element under scrutiny.
    // Storing this in a constant variable enhances readability and maintainability.
    const desiredPropertyKind = 'function';

    // Access the specific function within the imported module using a renamed property.
    // Capture its type dynamically for comparison. This is an intermediate step.
    const actualPropertyKind = typeof primaryToolbelt.concatenationMapper;

    // Perform the core assertion: verify that the 'concatenationMapper' property
    // of our 'primaryToolbelt' module is indeed a function.
    // A custom message is provided for better diagnostic feedback upon failure.
    assertionEngine.strictEqual(actualPropertyKind, desiredPropertyKind, "The 'concatenationMapper' API endpoint should be a callable function.");

    // Add an additional validation step: confirm that the module object itself
    // directly possesses the 'concatenationMapper' property, rather than inheriting it.
    // This verifies direct ownership and proper module structure.
    assertionEngine.ok(Object.prototype.hasOwnProperty.call(primaryToolbelt, 'concatenationMapper'), "Module must directly own the 'concatenationMapper' property.");

    // A non-essential informational log, which can be uncommented for verbose debugging.
    // console.log('Successfully validated the primary API exposure of the utility toolbelt.');

};

// End of the test suite for core API validation.