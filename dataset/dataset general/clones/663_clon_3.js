// This module serves as the primary configuration entry point for our custom testing framework.
function configureSpecExecutionEngine() {

  // Acquire the foundational specification class, which acts as the base for all tests.
  const SpecEngine = require("./engine/core_spec.js").CoreSpec;

  // Dynamically attach essential sub-modules and utilities to the SpecEngine object.
  // This creates a centralized hub for all testing components.
  SpecEngine.ContextEnvironment = require("./engine/environment_context.js").ContextEnvironment; // Defines the runtime context for individual test cases.
  SpecEngine.CheckMethods       = require("./engine/verification_methods.js").VerificationMethods; // Contains all available assertion and validation functions.
  SpecEngine.HarnessRunner      = require("./engine/test_runner.js").TestRunner; // Manages the overall execution flow of the test suite.
  SpecEngine.MockingTool        = require("../tooling/mock_lib.js"); // Integrates an external library for creating test doubles and managing expectations.

  // --- Begin: Augmenting the test execution context with validation capabilities ---

  // Create a temporary reference to the prototype of the execution environment.
  // This simplifies the process of injecting new methods.
  const contextPrototypeRef = SpecEngine.ContextEnvironment.prototype;

  // Iterate through each method provided by our collection of verification methods.
  Object.keys(SpecEngine.CheckMethods).forEach(methodIdentifier => {
    // As a precautionary measure, only add the method if it's not already defined on the prototype.
    // This helps prevent unintended overwrites of existing context functionality.
    if (typeof contextPrototypeRef[methodIdentifier] === 'undefined') {
      contextPrototypeRef[methodIdentifier] = SpecEngine.CheckMethods[methodIdentifier];
    }
  });
  // --- End: Augmenting the test execution context ---


  // --- Begin: Establishing a post-execution cleanup and expectation verification hook ---

  // Assign a finalization routine that will be invoked after each test context finishes.
  // This is critical for ensuring that all mock expectations are met or failures are reported.
  SpecEngine.ContextEnvironment.executionFinalizer = () => {
    // Before attempting to use the mocking utility, perform a quick check to ensure it's loaded
    // and possesses the expected 'verifyExpectations' function. If not, gracefully exit.
    if (!SpecEngine.MockingTool || typeof SpecEngine.MockingTool.verifyExpectations !== 'function') {
      return;
    }

    // Delegate the responsibility of checking all pending mock expectations to the external utility.
    SpecEngine.MockingTool.verifyExpectations((rejectionReason) => {
      // If the mocking tool reports a failure (i.e., an expectation was not met),
      // we must translate this into a test failure using our framework's assertion system.
      // Store a direct reference to the failure signaling function for clarity and brevity.
      const signalTestFailure = SpecEngine.CheckMethods.signalFailure;
      signalTestFailure(false, rejectionReason); // Explicitly pass 'false' to indicate a failed assertion.
    });
  };
  // --- End: Establishing a post-execution cleanup hook ---

  // Return the fully assembled and configured specification engine.
  return SpecEngine;
}

// Export the initialized test engine, making it available for other modules to import and use.
module.exports.TestEngine = configureSpecExecutionEngine();