/**
 * @file This script processes a two-number input to calculate a specific ratio.
 * It serves as a Type III clone of an original piece of code, featuring
 * extensive modifications in structure, variable naming, control flow,
 * and the addition of validation and helper functionalities.
 *
 * The core logic remains equivalent: given two positive integers N and M,
 * it computes 1 if N equals M, otherwise it computes N / (M - 1).
 * Robustness enhancements have been added for input parsing and error conditions.
 */

// --- Primary Function: Orchestrates the calculation process ---
/**
 * Processes a raw input string containing two space-separated numbers
 * to compute a derived ratio. This function incorporates parsing,
 * validation, and conditional calculation logic.
 *
 * @param {string} sourceString - The raw input string, expected to contain two integers.
 */
function ProcessInputData(sourceString) {
    // Section 1: Data Extraction and Initial Validation
    // Instead of splitting and filtering, we use a regex match to directly
    // extract all sequences of digits, which implicitly handles whitespace
    // and non-numeric characters more robustly.
    const detectedNumericStrings = sourceString.match(/\d+/g);

    // Guard clause: Ensure exactly two numbers were found in the input.
    // This adds robustness compared to the original code's implicit assumption.
    if (!detectedNumericStrings || detectedNumericStrings.length !== 2) {
        console.error("Input Parsing Error: Expected exactly two numerical components. Found " + (detectedNumericStrings ? detectedNumericStrings.length : 0) + ".");
        // Exit early if input format is incorrect.
        return;
    }

    // Convert the extracted string components into actual numeric types.
    // Using Number() constructor is an alternative to parseInt(v, 10).
    const parsedNumericValues = detectedNumericStrings.map(strVal => Number(strVal));

    // Section 2: Assigning Semantic Names to Input Values
    // Assign descriptive names to the two primary input values for clarity.
    // Original: arrLength (inputs[0]), range (inputs[1])
    const primaryItemCount = parsedNumericValues[0];      // Corresponds to 'arrLength'
    const limitConstraintValue = parsedNumericValues[1];  // Corresponds to 'range'

    // Section 3: Core Calculation Logic
    // Introduce a variable to store the result of the computation.
    let finalCalculatedResult;

    // Check for the special condition where the two input values are identical.
    // This expands the original ternary operator into a more explicit if-else block.
    const areValuesIdentical = (limitConstraintValue === primaryItemCount);

    if (areValuesIdentical) {
        // If the constraint matches the count, the ratio is simply 1.
        finalCalculatedResult = 1;
    } else {
        // Calculate the adjusted divisor for the general case.
        // This introduces an intermediate variable for (range - 1).
        const adjustedDivisor = limitConstraintValue - 1;

        // Guard clause: Prevent division by zero, which would lead to Infinity or NaN.
        // This is a significant addition for robustness.
        if (adjustedDivisor === 0) {
            console.error("Calculation Error: Attempted division by zero (limitConstraintValue - 1 resulted in 0).");
            finalCalculatedResult = NaN; // Indicate an invalid calculation.
        } else {
            // Perform the division to get the final ratio.
            finalCalculatedResult = primaryItemCount / adjustedDivisor;
        }
    }

    // Section 4: Outputting the Result
    // Delegate the display logic to a separate helper function for modularity.
    presentResultToUser(finalCalculatedResult);
}

// --- Helper Function: For displaying output ---
/**
 * Displays the computed value to the console.
 * This abstracts the console.log call, making it easier to change output methods.
 *
 * @param {number} computedValue - The numerical result to be presented.
 */
function presentResultToUser(computedValue) {
    // Provide a more informative message if the calculation failed.
    if (isNaN(computedValue)) {
        console.log("Calculation could not yield a valid number.");
    } else {
        console.log(computedValue);
    }
}

// --- Execution Entry Point: Handles file system interaction ---
// Using a different variable name for the 'fs' module.
const fileSystemUtility = require("fs");
const standardInputPath = "/dev/stdin"; // Standard path for input in competitive programming environments.

try {
    // Read the entire content of the standard input file synchronously.
    // Trimming the content removes any leading/trailing whitespace, including newlines.
    const rawFileData = fileSystemUtility.readFileSync(standardInputPath, "utf8").trim();

    // Invoke the main processing function with the obtained file content.
    ProcessInputData(rawFileData);
} catch (inputReadError) {
    // Catch and report any errors that occur during file reading.
    console.error("System Error: Failed to read input from " + standardInputPath + ". Details:", inputReadError.message);
}