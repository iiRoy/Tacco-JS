// This module provides a robust utility for computing a specific derived numerical metric.
// It processes input from standard input, performs data validation,
// and breaks down calculations into distinct, readable steps.

/**
 * Calculates a complex metric based on a string of space-separated numeric inputs.
 * The function involves several transformation stages, including parsing,
 * parameter adjustment, conditional scaling, and a final fractional computation.
 * It includes robust error handling and detailed logging.
 *
 * @param {string} rawInputPayload - A string expected to contain at least three numerical values,
 *                                   separated by one or more whitespace characters.
 * @returns {number} The final computed metric value, or Number.NaN if any
 *                   critical processing errors or invalid conditions occur (e.g., division by zero).
 */
const calculateDerivedMetric = (rawInputPayload) => {
    // --- Phase 1: Input Parsing and Initial Validation ---

    // Split the raw input string by any sequence of whitespace characters.
    // The .filter(Boolean) step ensures that any empty strings resulting from
    // multiple consecutive spaces are removed, leading to a clean array of stringified numbers.
    const inputSegments = rawInputPayload.split(/\s+/).filter(Boolean);

    // Essential validation: Check if we have enough input components.
    // The original logic requires at least three numbers (n, m, d).
    const MINIMUM_EXPECTED_PARAMETERS = 3;
    if (inputSegments.length < MINIMUM_EXPECTED_PARAMETERS) {
        console.error(`ERROR: Insufficient input parameters. Expected at least ${MINIMUM_EXPECTED_PARAMETERS}, but received ${inputSegments.length}.`);
        return Number.NaN; // Return Not-a-Number to signify an invalid calculation result.
    }

    // Convert the string segments into floating-point numbers.
    // Using parseFloat is generally safer for varied number formats than unary plus.
    const numericalParameters = inputSegments.map(segment => parseFloat(segment));

    // --- Phase 2: Parameter Extraction and Transformation ---

    // Extract the primary parameters from the parsed numerical array.
    // Renaming for clarity and to avoid single-letter variable names.
    const systemSizeParameter = numericalParameters[0];      // Corresponds to 'n' in the original code.
    let baseOffsetValue = numericalParameters[1];            // Corresponds to 's[1]' before decrement.
    const criticalDeviationFactor = numericalParameters[2];  // Corresponds to 'd' in the original code.

    // Apply the required adjustment to the base offset value.
    // This step explicitly performs the 'm = s[1] - 1;' operation.
    const adjustedOffsetValue = baseOffsetValue - 1.0; // Using 1.0 for explicit float arithmetic.

    // Determine the dynamic scaling coefficient based on the critical deviation factor.
    // This replaces the compact ternary operator 'var a = d ? 2 : 1;' with an explicit if-else block.
    let dynamicScalingCoefficient;
    if (criticalDeviationFactor !== 0) { // Check if the deviation factor is non-zero (truthy).
        dynamicScalingCoefficient = 2.0; // If 'd' is non-zero, the multiplier is 2.
    } else {
        dynamicScalingCoefficient = 1.0; // Otherwise, the multiplier is 1.
    }

    // --- Phase 3: Metric Calculation ---

    // Break down the numerator calculation into distinct, understandable terms.
    // Original numerator structure: m * (n - d) * a
    const numeratorTermOne = adjustedOffsetValue;
    const numeratorTermTwo = systemSizeParameter - criticalDeviationFactor;
    const numeratorTermThree = dynamicScalingCoefficient;

    const computedNumerator = numeratorTermOne * numeratorTermTwo * numeratorTermThree;

    // Calculate the denominator.
    // Original denominator structure: n * n
    const squaredSystemSize = systemSizeParameter * systemSizeParameter;

    // Critical validation: Prevent division by zero.
    if (squaredSystemSize === 0) {
        console.error("ERROR: Division by zero detected. The system size squared is zero, making the metric undefined.");
        return Number.NaN; // Return NaN to indicate an invalid mathematical operation.
    }

    // Perform the final division to obtain the metric.
    const finalCalculatedMetric = computedNumerator / squaredSystemSize;

    // --- Phase 4: Detailed Output and Return ---

    // Provide a more verbose output to the console, detailing intermediate steps and final result.
    console.log("\n--- Metric Computation Summary ---");
    console.log(` Raw Input: "${rawInputPayload}"`);
    console.log(` Parsed Numerical Values: [${numericalParameters.join(', ')}]`);
    console.log(` System Size (n): ${systemSizeParameter}`);
    console.log(` Adjusted Offset (m-1): ${adjustedOffsetValue}`);
    console.log(` Deviation Factor (d): ${criticalDeviationFactor}`);
    console.log(` Dynamic Scaling Coefficient (a): ${dynamicScalingCoefficient}`);
    console.log(` Intermediate Numerator Value: ${computedNumerator}`);
    console.log(` Intermediate Denominator Value: ${squaredSystemSize}`);
    console.log(` FINAL DERIVED METRIC: ${finalCalculatedMetric}`);
    console.log("----------------------------------\n");

    return finalCalculatedMetric;
};

// --- Execution Entry Point ---
// This immediately invoked function expression (IIFE) handles reading input
// from stdin and orchestrates the metric calculation process.
(function initializeAndExecute() {
    // Dynamically import the Node.js file system module for input operations.
    const fileSystemManager = require("fs");

    // Define the standard input file path, common in Unix-like systems for stdin.
    const standardInputFile = "/dev/stdin";

    // Specify the character encoding for reading the file content.
    const textDataEncoding = "utf8";

    try {
        // Attempt to synchronously read the content from standard input.
        // .trim() is added to remove any leading/trailing whitespace, especially newlines.
        const rawInputContent = fileSystemManager.readFileSync(standardInputFile, textDataEncoding).toString().trim();

        // Call the main metric calculation function with the retrieved content.
        calculateDerivedMetric(rawInputContent);

    } catch (executionError) {
        // Catch and log any errors that occur during file reading or initial processing.
        console.error(`FATAL ERROR: An unhandled exception occurred during program execution: ${executionError.message}`);
        // In a real application, you might also want to exit the process with a non-zero status code.
        // process.exit(1);
    }
})();