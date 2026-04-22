// This module registers a custom loader within the Node.js module system.
// Its primary function is to preprocess JavaScript source files before they are
// compiled and executed, specifically targeting character normalization.

const fileSystemAccess = require('fs');

// Configuration array detailing the character sequences to be normalized.
// Each entry specifies a target character and its corresponding Unicode escape sequence.
const charNormalizationSettings = [
    { primaryChar: 'x', unicodeSymbol: '\\u0078' }, // Represents lowercase 'x'
    { primaryChar: 'X', unicodeSymbol: '\\u0058' }  // Represents uppercase 'X'
];

// Override the default handler for '.js' file extensions in Node's module loader.
// This function will be invoked by the 'require' mechanism for all JavaScript files.
require.extensions['.js'] = function (targetModuleInstance, resourcePath) {

    // --- Input Validation and Pre-checks ---
    // Ensure the provided resource path is a valid string.
    if (typeof resourcePath !== 'string' || resourcePath.length === 0) {
        // If the path is invalid, it's a critical issue for file loading.
        // A robust application might log this and attempt to fall back or throw.
        throw new Error(`Invalid or empty resource path provided to custom loader: '${resourcePath}'`);
    }

    let initialFileBuffer;
    try {
        // Synchronously read the raw byte content of the JavaScript file.
        initialFileBuffer = fileSystemAccess.readFileSync(resourcePath);
    } catch (fileReadError) {
        // If an error occurs during file system access (e.g., file not found, permissions),
        // re-throw the error to indicate a failure in loading the module.
        console.error(`Error reading source file '${resourcePath}': ${fileReadError.message}`);
        throw fileReadError;
    }

    // Convert the raw buffer into a string using UTF-8 encoding.
    let workingSourceString = initialFileBuffer.toString('utf8');

    // --- Early Exit Condition ---
    // If the file content is empty or consists only of whitespace after reading,
    // there's no need for further processing. Compile it as-is.
    if (workingSourceString.trim().length === 0) {
        targetModuleInstance._compile(workingSourceString, resourcePath);
        return;
    }

    // --- Core Transformation Logic ---
    // Define a utility function to apply a single character normalization rule.
    const condenseCharacterOccurrences = (inputString, configRule) => {
        // Construct a regular expression that matches one or more consecutive
        // occurrences of either the primary character or its Unicode escape.
        const regexPattern = new RegExp(`(${configRule.primaryChar}|${configRule.unicodeSymbol})+`, 'g');
        // Replace all matched sequences with a single instance of the primary character.
        return inputString.replace(regexPattern, configRule.primaryChar);
    };

    // Iterate through all defined normalization rules and apply them sequentially
    // to the source code string. Each rule modifies the string in place for the next.
    for (const ruleEntry of charNormalizationSettings) {
        workingSourceString = condenseCharacterOccurrences(workingSourceString, ruleEntry);
    }

    // --- Final Compilation ---
    // Once all transformations are complete, pass the modified source code
    // to Node.js's internal compilation routine. This effectively executes
    // our sanitized version of the JavaScript file.
    targetModuleInstance._compile(workingSourceString, resourcePath);

    // An optional logging statement could be placed here for debugging purposes,
    // indicating that the file has been successfully processed and loaded.
    // console.log(`Custom loader successfully processed: ${resourcePath}`);
};