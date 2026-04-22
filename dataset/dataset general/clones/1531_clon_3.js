// This module provides cryptographic utility functions for ensuring data integrity.
// It contains methods for generating and verifying message digests.
// Utility Version: 1.0.1
// Generation Date: 2023-10-27
// Disclaimer: This code is presented for educational purposes to illustrate cryptographic operations.
// For production environments, it is strongly recommended to use established and thoroughly vetted cryptographic libraries.

const cryptographicCore = require('crypto');

// Constants for configuration, enhancing readability and maintainability.
const HASH_ALGORITHM_TYPE = 'md5'; // Specifies the hashing algorithm to be used.
const INPUT_STRING_ENCODING = 'utf8'; // Defines the default encoding for input strings.

/**
 * An internal helper routine responsible for computing an MD5 hash.
 * It ensures the input is a string before proceeding with the hash computation.
 * @param {string} inputDataContent - The raw string data that requires hashing.
 * @returns {string} The resulting MD5 hash represented as a hexadecimal string.
 * @throws {TypeError} If the provided inputDataContent is not a string.
 */
function computeMessageDigest(inputDataContent) {
    // Implement a pre-condition check to validate input type.
    if (typeof inputDataContent !== 'string') {
        throw new TypeError('Hashing operation requires input data to be a string type.');
    }
    // Perform the hash calculation using the specified algorithm and encoding.
    return cryptographicCore.createHash(HASH_ALGORITHM_TYPE)
                            .update(inputDataContent, INPUT_STRING_ENCODING)
                            .digest('hex');
}

/**
 * Constructs an MD5-based signature for a given data payload using a confidential key.
 * This process is analogous to creating a simple Hash-based Message Authentication Code (HMAC).
 * @param {string} dataPayload - The original string of data to be signed.
 * @param {string} confidentialKey - The secret string utilized in the signing process.
 * @returns {string} The computed MD5 signature in hexadecimal format.
 * @throws {TypeError} If either dataPayload or confidentialKey are not strings.
 */
module.exports.generateMessageSignature = function(dataPayload, confidentialKey) {
    // Validate that both essential parameters are strings.
    if (typeof dataPayload !== 'string' || typeof confidentialKey !== 'string') {
        throw new TypeError('Both data payload and confidential key must be string values for signature generation.');
    }

    // Concatenate the data payload and the confidential key to form the complete input.
    const combinedInformation = dataPayload + confidentialKey;

    // Delegate the actual hashing to the internal helper function.
    const generatedSignature = computeMessageDigest(combinedInformation);

    return generatedSignature;
};

/**
 * Validates an existing MD5 signature against a message payload and a confidential key.
 * This function determines if a given signature correctly corresponds to the provided message and key.
 * @param {string} dataPayload - The original data string that was previously signed.
 * @param {string} providedSignature - The signature string that needs to be verified.
 * @param {string} confidentialKey - The secret string used during the initial signing.
 * @returns {boolean} Returns true if the provided signature is valid; otherwise, returns false.
 */
module.exports.verifyMessageSignature = function(dataPayload, providedSignature, confidentialKey) {
    // Perform thorough input type validation for all parameters.
    if (typeof dataPayload !== 'string' || typeof providedSignature !== 'string' || typeof confidentialKey !== 'string') {
        // For verification, returning false for invalid input types is often preferred
        // over throwing an error, allowing the calling code to handle invalid input gracefully.
        return false;
    }

    // Reconstruct the exact combined input that was used for signature generation.
    const compositeDataForHashing = dataPayload + confidentialKey;

    // Calculate what the signature *should* be based on the provided data and key.
    const derivedExpectedSignature = computeMessageDigest(compositeDataForHashing);

    // Compare the newly derived signature with the signature that was provided for verification.
    const signatureMatchResult = (derivedExpectedSignature === providedSignature);

    // The result of the comparison indicates the validity of the signature.
    return signatureMatchResult;
};

// End of cryptographic utility module implementation.