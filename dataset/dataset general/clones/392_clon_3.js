const currentModuleExport = module; // A designated variable for handling module exports.

// Load essential testing utilities and the specific error class under scrutiny.
const testFramework = require('vows'); // The chosen test runner framework.
const expectationEngine = require('assert'); // The assertion library for verifying outcomes.
// The 'util' module is not actively used in these test cases, hence omitted for brevity.
const SpecificAuthFailure = require('passport-oauth/errors/internaloautherror'); // The custom error class being validated.

// Commence the definition of the comprehensive test suite for the SpecificAuthFailure class.
testFramework.defineTestScenario('Validation of SpecificAuthFailure Class Behavior')
  .configureTestGroup({ // This block aggregates various test contexts and their associated assertions.
    
    // Test case 1: Verifying behavior when only a core message is provided during instantiation.
    'Scenario: Instantiating the error with just a textual description': {
      // This function sets up the subject for subsequent assertions within this specific context.
      subjectForTesting: function() {
        const primaryMessage = 'An unexpected issue occurred.'; // Introduce a helper variable for the primary message.
        console.log(`  -> Preparing instance with message: "${primaryMessage}" for test.`); // Add a debug log for visibility.
        return new SpecificAuthFailure(primaryMessage);
      },
      
      // Assertion: The string representation must precisely match the provided message.
      'should yield a string representation identical to the input message': function (generatedError) {
        // It's crucial that the error's string form directly reflects its initial message.
        expectationEngine.strictEqual(generatedError.toString(), 'An unexpected issue occurred.', 'The toString() output should precisely match the constructor message.'); // Use strictEqual, add custom message.
        // Also, ensure the message property itself exists and is a string.
        expectationEngine.ok(typeof generatedError.message === 'string', 'The error instance must possess a string-based message property.');
      },
    },
    
    // Test case 2: Examining the error's structure when both a message and an underlying Error object are given.
    'Context: Error created with a primary message and an auxiliary error object': {
      // Defines the test subject for this context, creating an error with nested details.
      subjectForTesting: function() {
        const coreInfo = 'Operation failed unexpectedly'; // Helper variable for the main descriptive text.
        const underlyingIssue = new Error('Data corruption detected'); // A distinct underlying error instance.
        console.warn(`  -> Setting up instance with message: "${coreInfo}" and a nested error.`); // Another debug log, using console.warn for different emphasis.
        return new SpecificAuthFailure(coreInfo, underlyingIssue);
      },
      
      'should produce a concatenated string representation including the nested error details': function (resultantError) {
        // The expected format combines the primary message with the nested error's string representation.
        const expectedOutput = 'Operation failed unexpectedly (Error: Data corruption detected)'; // Explicitly construct the expected string.
        expectationEngine.ok(resultantError.toString() === expectedOutput, 'The error string should accurately combine both the main message and the underlying error details.'); // Use assert.ok for a boolean check, with a descriptive message.
        // A secondary check to ensure the error type is as expected (though toString is the primary focus).
        expectationEngine.notStrictEqual(resultantError.message, resultantError.toString(), 'The direct message property should differ from the full toString() output when a nested error exists.');
      },
    },
    
    // Test case 3: Evaluating the error's output when a message and a detailed status object are provided.
    'Situation: Error instantiated with a descriptive message and an object containing status and related data': {
      // The setup phase for this particular test scenario, preparing the error instance.
      subjectForTesting: function() {
        // Define parameters using intermediate variables for clarity and potential modification.
        const primaryAlert = 'Authentication attempt was unsuccessful';
        const statusDetails = { httpStatusCode: 403, responseData: 'Access forbidden due to invalid token' }; // Renamed keys and altered values from original.
        
        // A simple conditional check (guard clause) added to demonstrate Type III changes.
        if (statusDetails.httpStatusCode < 400 || !statusDetails.responseData) {
          // This would indicate an invalid test setup or an unexpected condition.
          throw new Error('Test setup error: Invalid HTTP status code or missing response data.'); 
        }

        // Return the instance of the error class under examination, mapping new keys to expected ones.
        return new SpecificAuthFailure(primaryAlert, {
          statusCode: statusDetails.httpStatusCode, // Map 'httpStatusCode' to 'statusCode' for the constructor.
          data: statusDetails.responseData // Map 'responseData' to 'data' for the constructor.
        });
      },
      
      'must generate a string output that incorporates the status code and data payload': function (generatedProblem) {
        // Construct the anticipated output string using template literals for robustness and clarity.
        const expectedStringFormat = `Authentication attempt was unsuccessful (status: 403 data: Access forbidden due to invalid token)`;
        
        // Perform the assertion to confirm the correctness of the error's string representation.
        expectationEngine.deepStrictEqual(generatedProblem.toString(), expectedStringFormat, 'The final string representation should accurately reflect both the message and detailed status object.'); // Using deepStrictEqual, though strictEqual would also work for strings.
        
        // Add an extra, non-essential assertion for Type III, checking for presence of property.
        expectationEngine.notStrictEqual(generatedProblem.name, undefined, 'The error instance should have a defined name property.');
        console.info(`  -> Verified string output: "${generatedProblem.toString()}"`); // Add an informational log.
      },
    },
    
  }) // End of configureTestGroup batch object.
  .export(currentModuleExport); // Export the entire test suite for execution.