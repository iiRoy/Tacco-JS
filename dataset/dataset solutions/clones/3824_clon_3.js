// This module provides advanced numerical sequence analysis capabilities.

/**
 * Executes a specialized analytical process on a given string of numerical data.
 * It parses the input, extracts key values, and performs a conditional check
 * based on specific proximity rules, then outputs a determination.
 *
 * @param {string} rawDataInput - The raw string containing space-separated numerical values.
 */
const executeNumericalEvaluation = (rawDataInput) => {
    // --- Input Validation and Preprocessing ---

    // Ensure the input data is a valid string and not empty.
    if (typeof rawDataInput !== 'string' || rawDataInput.trim().length === 0) {
        console.error("Critical Error: Input data must be a non-empty string for analysis.");
        return; // Terminate execution due to invalid input.
    }

    // Split the input string into individual components based on whitespace.
    const componentStrings = rawDataInput.trim().split(' ');

    // Verify that a sufficient number of numerical components are provided.
    const MIN_REQUIRED_COMPONENTS = 4;
    if (componentStrings.length < MIN_REQUIRED_COMPONENTS) {
        console.error(`Data Error: Expected at least ${MIN_REQUIRED_COMPONENTS} numerical components, but received ${componentStrings.length}.`);
        return; // Terminate execution.
    }

    // --- Data Parsing and Assignment ---

    // Convert string components into their integer representations.
    const integerCollection = [];
    for (let currentIdx = 0; currentIdx < componentStrings.length; currentIdx++) {
        const stringVal = componentStrings[currentIdx];
        const numericVal = Number.parseInt(stringVal, 10); // Use Number.parseInt for explicit radix.

        // Validate each parsed numerical value.
        if (Number.isNaN(numericVal)) {
            console.error(`Parsing Error: Component '${stringVal}' at index ${currentIdx} is not a valid integer.`);
            return; // Terminate execution if a non-numeric value is found.
        }
        integerCollection.push(numericVal);
    }

    // Assign specific roles to the first four parsed integers for clarity.
    const referencePointA = integerCollection[0]; // Represents the initial 'a' value.
    const intermediatePointB = integerCollection[1]; // Represents the 'b' value for intermediate checks.
    const comparisonPointC = integerCollection[2]; // Represents the 'c' value for alternative comparisons.
    const maximumAllowedDifference = integerCollection[3]; // Represents the 'd' threshold.

    // --- Core Conditional Logic Helper ---

    /**
     * Evaluates a boolean condition and mimics the behavior of `Math.abs(boolean_value)`
     * when used in a truthy/falsy context.
     * `Math.abs(true)` evaluates to 1 (truthy).
     * `Math.abs(false)` evaluates to 0 (falsy).
     * This function returns a boolean reflecting that truthiness.
     * @param {boolean} rawCondition - The boolean result of a comparison (e.g., `x <= y`).
     * @returns {boolean} - True if `rawCondition` is true, false otherwise.
     */
    const translateBooleanToAbsEffect = (rawCondition) => {
        // Convert boolean to 1 or 0.
        const numericalState = rawCondition ? 1 : 0;
        // Apply Math.abs, which doesn't change 0 or 1.
        const absoluteNumericalState = Math.abs(numericalState);
        // Convert back to boolean based on truthiness (1 is true, 0 is false).
        return !!absoluteNumericalState;
    };

    /**
     * Determines if a specific set of proximity conditions are met.
     * This function's logic is structured to mirror the original's potentially
     * ambiguous conditional expression: `P || (P && Q)`, where P and Q
     * involve `Math.abs(boolean_expression)`.
     *
     * @param {number} valA - The first numerical reference point.
     * @param {number} valB - The second numerical reference point.
     * @param {number} valC - The third numerical reference point.
     * @param {number} limitD - The threshold for proximity.
     * @returns {boolean} True if the conditions are satisfied, false otherwise.
     */
    const assessProximityCriteria = (valA, valB, valC, limitD) => {
        // Evaluate the first primary condition: `(valA - valB <= limitD)`.
        // The `translateBooleanToAbsEffect` ensures we replicate the `Math.abs(boolean_expression)` behavior.
        const primaryProximityCheck = translateBooleanToAbsEffect((valA - valB) <= limitD);

        // Evaluate the secondary condition: `(valB - valC <= limitD)`.
        // This part is included to match the structure of the original expression `P || (P && Q)`,
        // even though for `P || (P && Q)` the overall result simplifies to `P`.
        const secondaryProximityCheck = translateBooleanToAbsEffect((valB - valC) <= limitD);

        // Combine the checks using the original logical structure `P || (P && Q)`.
        // This is equivalent to `primaryProximityCheck` due to boolean algebra simplification.
        const finalOutcome = primaryProximityCheck || (primaryProximityCheck && secondaryProximityCheck);

        return finalOutcome;
    };

    // --- Final Determination and Output ---

    // Execute the proximity assessment.
    const isCriteriaMet = assessProximityCriteria(
        referencePointA,
        intermediatePointB,
        comparisonPointC,
        maximumAllowedDifference
    );

    // Provide the result to the user using a dedicated output utility.
    if (isCriteriaMet) {
        outputFinalStatus("Affirmative"); // Custom phrasing for 'Yes'.
    } else {
        outputFinalStatus("Negative"); // Custom phrasing for 'No'.
    }
};

/**
 * A utility function to standardize the output message format.
 * @param {string} statusMessage - The message indicating the outcome (e.g., "Affirmative", "Negative").
 */
const outputFinalStatus = (statusMessage) => {
    // Display the structured result to the console.
    console.log(`Analysis Result: ${statusMessage}`);
};

// --- Execution Entry Point ---
// This block handles reading input from stdin and invoking the main analysis function.
try {
    // Dynamically import the 'fs' module for file system operations.
    const fileSystemModule = require("fs");

    // Read the entire standard input stream as a UTF-8 encoded string.
    const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Begin the numerical evaluation process with the obtained input.
    executeNumericalEvaluation(standardInputData);

} catch (runtimeError) {
    // Catch and report any exceptions that occur during file reading or script execution.
    console.error(`Runtime Exception: An unexpected error occurred: ${runtimeError.message}`);
    // Exit the process with an error code to signal failure to the operating system.
    process.exit(1);
}