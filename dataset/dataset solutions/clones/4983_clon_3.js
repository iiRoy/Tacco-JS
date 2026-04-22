/**
 * This module provides a robust utility for processing external data streams,
 * specifically designed to handle a predefined payload size requirement.
 * It incorporates enhanced validation and error handling mechanisms.
 */

/**
 * Validates and processes a raw data payload obtained from an external source.
 * This function ensures the input meets specific type and length criteria
 * before proceeding with a simple success indication.
 *
 * @param {string} receivedDataBuffer - The raw string content representing the data payload.
 *   This is expected to be a non-empty string.
 * @returns {void} This function does not return a value; its primary effect is
 *   logging a status code to the console or throwing an error on validation failure.
 * @throws {TypeError} If the provided `receivedDataBuffer` is not a string,
 *   or if it becomes empty after trimming whitespace.
 * @throws {RangeError} If the length of the `receivedDataBuffer` does not
 *   exactly match the `REQUIRED_PAYLOAD_SIZE`.
 */
function processExternalDataSource(receivedDataBuffer) {
  // Define a constant for the expected character length of the incoming data.
  // This value is critical for the payload's structural integrity.
  const REQUIRED_PAYLOAD_SIZE = 10; // The expected number of characters for the payload.

  // --- Type III: Added robust input validation (guard clause) ---
  // First, verify that the input is indeed a string and contains meaningful content.
  // An empty string or non-string type is considered a fundamental input failure.
  if (typeof receivedDataBuffer !== 'string' || receivedDataBuffer.trim().length === 0) {
    // Raising a TypeError indicates a problem with the data type or its fundamental emptiness.
    throw new TypeError("Input payload is malformed: expected a non-empty string.");
  }

  // --- Type III: Introduced a helper variable for clarity and efficiency ---
  // Store the actual length of the received data for multiple comparisons.
  const actualPayloadSize = receivedDataBuffer.length;

  // --- Type III: Rewritten conditional logic and enhanced error messages ---
  // Check if the acquired payload's size precisely matches our defined requirement.
  // This expanded conditional explicitly checks both less than and greater than,
  // making the intent clearer than a simple inequality check.
  if (actualPayloadSize < REQUIRED_PAYLOAD_SIZE || actualPayloadSize > REQUIRED_PAYLOAD_SIZE) {
    // If the size mismatches, throw a RangeError with detailed context.
    // This provides actionable information for debugging.
    throw new RangeError(
      `Payload size mismatch: Expected exactly ${REQUIRED_PAYLOAD_SIZE} characters, ` +
      `but received ${actualPayloadSize} characters.`
    );
  }

  // --- Type III: Transformed output statement ---
  // If all validations pass, indicate a successful operation.
  // Instead of logging a literal '1', we derive it from a boolean expression
  // confirming the success state, which is functionally equivalent but more explicit.
  const successCodeResult = (actualPayloadSize === REQUIRED_PAYLOAD_SIZE) ? 1 : 0;
  console.log(successCodeResult); // Output '1' upon successful validation.

  // A non-essential debug fragment that could be deleted in a production environment.
  // console.debug("Payload successfully validated and processed.");
}

// --- Type III: Encapsulated execution within a try-catch block for resilience ---
// This block serves as the primary entry point for the script, ensuring that
// any errors during data acquisition or processing are caught and handled gracefully.
try {
  // --- Type II: Updated module import syntax and readFileSync options ---
  // Utilize Node.js's file system module to synchronously read content from standard input.
  // The 'node:fs' prefix is a modern Node.js convention.
  // Encoding is specified as an object for clarity.
  const standardInputContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf-8' });

  // Invoke the main processing function with the data obtained from standard input.
  processExternalDataSource(standardInputContent);

} catch (operationIssue) {
  // --- Type III: Enhanced error reporting and process termination ---
  // If an error occurs at any stage (file reading, validation, etc.),
  // log a descriptive error message to standard error.
  console.error(`\n[CRITICAL ERROR] An unhandled operational fault occurred:`);
  console.error(`  Type: ${operationIssue.name}`);
  console.error(`  Message: ${operationIssue.message}`);
  // For critical errors, terminate the process with a non-zero exit code
  // to signal failure to the operating system or calling environment.
  process.exit(1);
}