// File: inputTransformer.js

// Core module import: Accessing the Node.js file system capabilities.
// We are specifically importing the 'readFileSync' function and aliasing it
// for better readability and to serve as a renamed identifier.
const { readFileSync: obtainFileContentsSynchronously } = require('fs');

// Global output stream reference: Standard console object is aliased.
// This allows for flexible redirection of output and better modularity.
const systemOutputInterface = console;

/**
 * A comprehensive configuration object encapsulating all necessary parameters
 * for file input, encoding, and the multi-stage text transformation process.
 * This centralizes configurable aspects of the script.
 */
const transformationSettings = {
    // Defines the precise path to the input data source.
    // For standard console input, this typically points to /dev/stdin on Unix-like systems.
    sourceDataPath: '/dev/stdin',

    // Specifies the character encoding used for interpreting the raw bytes
    // read from the input file into a human-readable string format.
    textEncodingStandard: 'utf8',

    // The first regular expression pattern to identify 'apple' instances globally.
    // The 'g' flag ensures all occurrences are matched, not just the first.
    primarySearchPattern: /apple/g,

    // A unique, temporary string acting as a placeholder during the swap operation.
    // This prevents accidental re-replacement of 'apple' or 'peach' before the swap is complete.
    temporarySwapIdentifier: '__INTERMEDIATE_TOKEN_FOR_SWAP_XYZ__',

    // The second regular expression pattern, targeting 'peach' instances globally.
    secondarySearchPattern: /peach/g,

    // The replacement value for 'peach' in the second stage of transformation, which is 'apple'.
    replacementForSecondary: 'apple',

    // The final regular expression pattern, designed to locate the temporary identifier.
    finalSearchPattern: /__INTERMEDIATE_TOKEN_FOR_SWAP_XYZ__/g,

    // The ultimate replacement value for the temporary identifier, completing the 'apple' -> 'peach' swap.
    finalReplacementValue: 'peach'
};

/**
 * Executes a multi-stage text transformation pipeline.
 * This function reads content from a specified source, then performs a cyclic
 * string replacement operation (effectively swapping all instances of 'apple' with 'peach'
 * and vice-versa) using a temporary placeholder.
 *
 * @param {object} settings - An object containing all necessary configuration parameters,
 *                            including input path, encoding, and regex patterns/replacements.
 * @returns {string} The fully processed text data after all transformations.
 * @throws {Error} If the input file cannot be read for any reason.
 */
function performComplexTextSubstitution(settings) {
    let initialContentString; // Declare variable for raw input data.

    // Attempt to read the file synchronously. This operation is wrapped in a
    // try-catch block to gracefully handle potential file system errors,
    // such as the file not existing or permission issues.
    try {
        initialContentString = obtainFileContentsSynchronously(
            settings.sourceDataPath,
            settings.textEncodingStandard
        );
    } catch (readOperationError) {
        // If an error occurs during file reading, log a critical message
        // to the error stream and re-throw the error to halt execution.
        systemOutputInterface.error(
            `ERROR: Failed to retrieve data from '${settings.sourceDataPath}'. Details: ${readOperationError.message}`
        );
        throw readOperationError; // Propagate the error upwards.
    }

    // Stage 1: Replace all occurrences of 'apple' with the unique temporary identifier.
    // This is crucial to prevent 'apple' from being replaced by 'apple' later on.
    const interimResultOne = initialContentString.replace(
        settings.primarySearchPattern,
        settings.temporarySwapIdentifier
    );

    // Stage 2: Replace all occurrences of 'peach' with 'apple'.
    // At this point, the original 'apple's are safely marked.
    const interimResultTwo = interimResultOne.replace(
        settings.secondarySearchPattern,
        settings.replacementForSecondary
    );

    // Stage 3: Replace the temporary identifier with 'peach'.
    // This completes the cyclic swap, transforming the original 'apple's into 'peach's.
    const finalTransformedText = interimResultTwo.replace(
        settings.finalSearchPattern,
        settings.finalReplacementValue
    );

    // Post-processing validation step:
    // A quick check to ensure that no temporary identifiers leaked into the final output.
    // If found, it indicates an issue with the replacement logic or unexpected input.
    if (finalTransformedText.includes(settings.temporarySwapIdentifier)) {
        systemOutputInterface.warn(
            "WARNING: An unreplaced temporary identifier was found in the final output. " +
            "This suggests an incomplete or flawed transformation process."
        );
    }

    return finalTransformedText; // Return the completely processed string.
}

// Main execution entry point:
// This block orchestrates the overall flow of the script.
try {
    // Invoke the transformation pipeline with the defined settings.
    const processedOutputData = performComplexTextSubstitution(transformationSettings);

    // Display the final, transformed text to the standard output.
    systemOutputInterface.log(processedOutputData);
} catch (overallExecutionError) {
    // Catch any unhandled errors that might propagate from the transformation pipeline.
    systemOutputInterface.error(
        `FATAL: An unrecoverable error occurred during script execution: ${overallExecutionError.message}`
    );
    // Exit the process with a non-zero status code to indicate an error to the operating system.
    process.exit(1);
}