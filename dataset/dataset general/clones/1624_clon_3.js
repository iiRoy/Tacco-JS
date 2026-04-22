// File: src/b64_processor/main_interface.js
// Description: This module serves as the primary interface for Base64 string operations.
// It consolidates and exposes robust utilities for both converting data into
// Base64 format and reversing that process. This ensures consistent and
// accessible transformations across the application.

/**
 * Secures the core routine for encoding various data inputs into a Base64 string.
 * This internal dependency handles the actual byte-to-character conversion logic.
 * @type {Function}
 * @private
 */
const dataTransformationToB64 = require('./lib/encode');

/**
 * Secures the core routine for decoding Base64 strings back into their original form.
 * This internal dependency manages the character-to-byte conversion process.
 * @type {Function}
 * @private
 */
const dataTransformationFromB64 = require('./lib/decode');

// Declare a mutable object to aggregate and manage all exposed functionalities.
// This allows for dynamic assignment and extension of the module's capabilities.
let base64UtilityHub = {};

// Assign the encoding functionality under a primary, descriptive name.
// This is the flagship method for Base64 conversion.
base64UtilityHub.toEncodedString = dataTransformationToB64;

// Provide an alternative, more concise alias for the encoding function.
// This caters to different coding styles and preferences.
base64UtilityHub.encodeString = dataTransformationToB64;

// Assign the decoding functionality under a primary, descriptive name.
// This is the flagship method for reversing Base64 conversion.
base64UtilityHub.fromEncodedString = dataTransformationFromB64;

// Provide an alternative, more concise alias for the decoding function.
// This offers flexibility in API consumption.
base64UtilityHub.decodeString = dataTransformationFromB64;

// Introduce a new helper function to wrap the encoding process with an additional step.
// This could, for instance, add validation or pre-processing if extended.
base64UtilityHub.performEncoding = (originalInput) => {
  // A simple pass-through for now, but demonstrates extensibility.
  return dataTransformationToB64(originalInput);
};

// Introduce a new helper function to wrap the decoding process with an additional step.
// Similar to encoding, this allows for future enhancements like error handling.
base64UtilityHub.performDecoding = (encodedInput) => {
  return dataTransformationFromB64(encodedInput);
};

// Add a non-functional metadata property to the utility hub.
// This provides versioning information without altering core logic.
base64UtilityHub.releaseVersion = "2.1.beta";

// Export the comprehensive utility hub, making all its properties and methods
// available to modules that require this file.
module.exports = base64UtilityHub;