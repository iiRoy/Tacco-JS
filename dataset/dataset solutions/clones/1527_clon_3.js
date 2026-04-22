// This module is designed to process a string of numerical data,
// calculate various products from these numbers, and then identify
// and display the single largest product among them.
// It's structured for environments where input is provided as a string,
// such as competitive programming platforms.

/**
 * A robust utility function to convert a string into an integer.
 * It handles potential parsing failures by returning zero and logging a warning,
 * ensuring that subsequent mathematical operations do not encounter `NaN`.
 *
 * @param {string} inputRepresentation - The string expected to contain an integer.
 * @returns {number} The successfully parsed integer, or 0 if parsing fails or input is invalid.
 */
const safeParseInteger = (inputRepresentation) => {
    // Validate that the input is indeed a string before attempting to parse.
    if (typeof inputRepresentation !== 'string' || inputRepresentation.trim() === '') {
        console.warn(`Warning: Invalid or empty string provided for parsing: "${inputRepresentation}". Defaulting to 0.`);
        return 0;
    }
    const numericalValue = Number.parseInt(inputRepresentation, 10);
    // Check if the result of parsing is 'Not a Number'.
    if (Number.isNaN(numericalValue)) {
        console.warn(`Warning: Failed to convert "${inputRepresentation}" into an integer. Assuming a value of 0.`);
        return 0;
    }
    return numericalValue;
};


/**
 * Orchestrates the entire process: taking raw input, parsing it, performing calculations,
 * and outputting the final result. This function serves as the primary entry point
 * for the application's core logic.
 *
 * @param {string} dataPayload - A single string containing four space-separated numerical values.
 */
function processAndDisplayMaxProduct(dataPayload) {
    // Initiate a check to ensure the incoming data is valid and usable.
    // An empty or non-string payload would prevent meaningful computation.
    if (!dataPayload || typeof dataPayload !== 'string' || dataPayload.trim().length === 0) {
        console.error("Error: Input data is either null, not a string, or contains no characters. Processing cannot continue.");
        return; // Terminate execution gracefully.
    }

    // Break down the monolithic input string into an array of smaller string parts,
    // using the space character as the delimiter.
    const stringComponents = dataPayload.split(" ");

    // Verify that the expected number of components (four) has been received.
    // Insufficient data would lead to errors in subsequent parsing steps.
    const expectedComponentCount = 4;
    if (stringComponents.length < expectedComponentCount) {
        console.error(`Error: Expected ${expectedComponentCount} numerical components, but only found ${stringComponents.length}.`);
        return;
    }

    // Use our custom safe parsing function to convert each string component into an integer.
    // This step ensures that even malformed input doesn't crash the program.
    const numericalOperandA = safeParseInteger(stringComponents[0]);
    const numericalOperandB = safeParseInteger(stringComponents[1]);
    const numericalOperandC = safeParseInteger(stringComponents[2]);
    const numericalOperandD = safeParseInteger(stringComponents[3]);

    // Calculate all four distinct product combinations from the four operands.
    // Storing these in named variables enhances readability and debugging.
    const productAC = numericalOperandA * numericalOperandC;
    const productAD = numericalOperandA * numericalOperandD;
    const productBC = numericalOperandB * numericalOperandC;
    const productBD = numericalOperandB * numericalOperandD;

    // Initialize a mutable variable to store the largest product found so far.
    // We begin by assuming the first product (AC) is the maximum.
    let currentHighestProduct = productAC;

    // Systematically compare 'currentHighestProduct' with each of the other products.
    // If any product is greater, 'currentHighestProduct' is updated.
    // This series of independent comparisons ensures the true maximum is identified,
    // regardless of the order or initial value.
    if (productAD > currentHighestProduct) {
        currentHighestProduct = productAD;
    }

    if (productBC > currentHighestProduct) {
        currentHighestProduct = productBC;
    }

    if (productBD > currentHighestProduct) {
        currentHighestProduct = productBD;
    }

    // Output the final determined maximum product to the standard console.
    // This is typically how results are returned in script-based environments.
    console.log(currentHighestProduct);
}

// --- Environmental Setup for Input Reading ---
// This section is a common pattern in JavaScript environments (like Node.js)
// for reading input from a file or standard input stream.

// The 'fs' (file system) module is required to perform file operations.
// `readFileSync` reads the entire content of a file synchronously.
// `/dev/stdin` is a standard path for reading from the console's input stream on Unix-like systems.
// 'utf8' specifies the character encoding for the text being read.
processAndDisplayMaxProduct(require("fs").readFileSync("/dev/stdin", "utf8"));