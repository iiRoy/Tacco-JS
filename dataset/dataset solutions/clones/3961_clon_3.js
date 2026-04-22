// This module provides core functionality for processing numerical input data.
// It aims to determine a specific relationship between three provided integer values.

/**
 * Parses a raw string input, extracts numerical components, and evaluates a condition.
 * The condition checks if the sum of the first two numbers is greater than or equal to the third number.
 *
 * @param {string} rawInputString The raw string data, expected to contain space-separated numbers.
 * @returns {void} This function prints "YES" or "NO" to the console based on the evaluation.
 */
function processInputData(rawInputString) {
    // Step 1: Sanitize the input string by removing leading/trailing whitespace.
    // This ensures consistency before splitting the string into components.
    const trimmedInput = rawInputString.trim();

    // Guard clause: Check if the trimmed string is empty.
    // An empty input cannot be processed meaningfully.
    if (trimmedInput.length === 0) {
        console.warn("Warning: Received empty input string. Cannot process.");
        console.log("No"); // Default outcome for invalid input
        return;
    }

    // Step 2: Split the cleaned string into an array of string tokens.
    // We're expecting space-separated values, which are then converted to numbers.
    const stringTokens = trimmedInput.split(" ");

    // Guard clause: Ensure we have at least three numerical components to compare.
    // The problem requires three numbers (a[0], a[1], a[2]).
    if (stringTokens.length < 3) {
        console.error("Error: Insufficient number of values provided. Expected at least 3.");
        console.log("No"); // Default outcome for invalid input structure
        return;
    }

    // Step 3: Convert string tokens into numerical values.
    // Using parseInt with radix 10 for explicit type conversion and robustness against non-decimal bases.
    const numericalComponents = stringTokens.map(token => {
        const parsedValue = parseInt(token, 10);
        // Validation: Check if parsing was successful.
        // If a token cannot be converted to a number, it indicates malformed input.
        if (isNaN(parsedValue)) {
            console.error(`Error: Invalid numerical value encountered: '${token}'.`);
            // For a Type III clone, we might add more sophisticated error handling,
            // but for now, throwing an error is a clear way to halt execution.
            throw new Error(`Failed to parse a number from token: ${token}`);
        }
        return parsedValue;
    });

    // Assigning values to descriptive variables for clarity.
    // This improves readability over direct array indexing.
    const firstOperand = numericalComponents[0];
    const secondOperand = numericalComponents[1];
    const comparisonThreshold = numericalComponents[2];

    // Step 4: Perform the core calculation.
    // Calculate the sum of the first two numerical components.
    const sumOfInitialValues = firstOperand + secondOperand;

    // Step 5: Evaluate the condition.
    // Determine if the sum meets or exceeds the third value.
    let isConditionSatisfied; // Using a boolean flag for readability and explicit state.
    if (sumOfInitialValues >= comparisonThreshold) {
        isConditionSatisfied = true;
    } else {
        isConditionSatisfied = false;
    }

    // Define output messages explicitly.
    // This allows for easy modification of the output strings if needed.
    const positiveOutcomeMessage = "Yes";
    const negativeOutcomeMessage = "No";

    // Step 6: Output the result based on the condition.
    // This is a direct print operation to standard output.
    if (isConditionSatisfied) {
        console.log(positiveOutcomeMessage);
    } else {
        console.log(negativeOutcomeMessage);
    }
}

// --- Input Reading and Execution Section ---

// This part handles reading the input from the standard input stream,
// which is a common pattern in competitive programming environments.

/**
 * Retrieves a specific Node.js module by its name.
 * This is a wrapper around the native 'require' function, introduced for Type III cloning purposes
 * to add an extra layer of abstraction and potential error handling.
 * @param {string} moduleName The name of the module to retrieve (e.g., 'fs').
 * @returns {object} The requested module object.
 * @throws {Error} If the module cannot be loaded, a descriptive error is thrown.
 */
function getSystemModule(moduleName) {
    try {
        // Attempt to load the module dynamically using Node.js's built-in require.
        return require(moduleName);
    } catch (loadError) {
        // Log the error and re-throw a more specific error for upstream handling.
        console.error(`Failed to load system module: '${moduleName}'.`, loadError.message);
        throw new Error(`Critical: Could not initialize required system component: ${moduleName}.`);
    }
}

// Access the file system operations module using our wrapper.
const fileSystemUtility = getSystemModule('fs');

// Define the standard input path, typically '/dev/stdin' on Unix-like systems.
const standardInputPath = '/dev/stdin';

let programInputContent = '';
try {
    // Read the entire content of the standard input file synchronously.
    // The 'utf8' encoding is specified to handle text data correctly.
    programInputContent = fileSystemUtility.readFileSync(standardInputPath, 'utf8');
} catch (readError) {
    // Handle potential errors during file reading (e.g., file not found, permissions issues).
    console.error(`Failed to read input from '${standardInputPath}'.`, readError.message);
    // In a real application, more robust error handling or fallback mechanisms might be implemented.
    // For this context, we'll proceed with an empty string, which will be caught by the function's guard clause.
    programInputContent = ''; // Ensure it's an empty string for subsequent checks
}

// Execute the main processing logic with the obtained input.
// Wrap the execution in a try-catch block to handle any potential errors
// that might propagate from within the processInputData function (e.g., parsing errors).
try {
    processInputData(programInputContent);
} catch (processingError) {
    // If an error occurred during data processing, log it and indicate failure.
    console.error("An unhandled error occurred during data processing:", processingError.message);
    console.log("No"); // Indicate a failure state to the user.
}