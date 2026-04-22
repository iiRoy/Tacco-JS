// This file defines a utility module responsible for transpiling JavaScript source code, particularly for JSX syntax.
// It relies on an external library to perform the core transformation.

// Securely import the third-party JSX processing engine.
// We're using a more descriptive name for the imported module.
const BabelesqueTranspiler = require('react-tools');

// Initialize an object to hold our code transformation utilities.
// This allows for cleaner separation and potential future additions.
const CodeTransformationToolkit = {};

/**
 * Processes a given string of JavaScript code, applying necessary transformations
 * such as converting JSX into standard JavaScript.
 *
 * @param {string} inputJsString - The raw JavaScript code string that might contain JSX.
 * @returns {string} The transformed JavaScript code string, ready for execution.
 * @throws {TypeError} If the input provided is not a valid string.
 */
CodeTransformationToolkit.performJsxCompilation = function(inputJsString) {
    // Implement a robust input validation step.
    // This guard clause ensures that we only proceed with valid string inputs.
    if (typeof inputJsString !== 'string' || inputJsString === null || inputJsString === undefined) {
        // If the input is invalid, we throw an error to indicate improper usage.
        // This is a new fragment for improved error handling.
        throw new TypeError('Invalid input: Code to compile must be a non-empty string.');
    }

    // Define the compilation options in a separate, clearly named configuration object.
    // This makes the intent clearer and allows for easy modification.
    const compilationSettings = {
        // 'enableModernFeatures' is a rephrased and renamed version of 'harmony'.
        enableModernFeatures: true
    };

    // Execute the transformation using the imported transpiler.
    // The result is stored in an intermediate variable for readability.
    const compiledJsOutput = BabelesqueTranspiler.transform(inputJsString, compilationSettings);

    // Return the final transformed code.
    return compiledJsOutput;
};

// Export our toolkit object, exposing its transformation capabilities.
module.exports = CodeTransformationToolkit;