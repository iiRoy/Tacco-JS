// Function responsible for processing raw input data and performing the area calculation.
// This routine expects three numerical values, each provided on a new line,
// representing the lengths of the two parallel bases and the height of the trapezoid.
function computeTrapezoidArea(inputContentString) {
    // Internal helper function to safely convert string values to integers.
    // It returns `null` if the conversion fails (e.g., non-numeric input),
    // allowing for explicit error checking in the main logic.
    const convertToIntegerSafely = (valueString, radixValue = 10) => {
        const parsedResult = parseInt(valueString, radixValue);
        return isNaN(parsedResult) ? null : parsedResult;
    };

    // Pre-validation: Ensure the input is a non-empty string.
    // If not, log an error and terminate the execution of this function.
    if (typeof inputContentString !== 'string' || inputContentString.trim().length === 0) {
        console.error("Input processing error: Provided content is either not a string or is entirely empty.");
        return; // Exit early.
    }

    // Step 1: Normalize the input by splitting it into lines, trimming whitespace,
    // and filtering out any lines that become empty after trimming.
    const processedLines = inputContentString.split('\n')
                                            .map(individualLine => individualLine.trim())
                                            .filter(trimmedLine => trimmedLine.length > 0);

    // Define the minimum number of parameters expected for the calculation.
    const requiredParametersCount = 3;

    // Step 2: Validate that we have received the expected number of input lines.
    if (processedLines.length < requiredParametersCount) {
        console.error(`Input processing error: Insufficient data provided. Expected ${requiredParametersCount} parameters, but received ${processedLines.length}.`);
        return; // Exit early due to missing data.
    }

    // Step 3: Extract and attempt to parse the dimensions using the helper function.
    // Each dimension is retrieved from its expected line in the input array.
    const firstParallelBase = convertToIntegerSafely(processedLines[0]);
    const secondParallelBase = convertToIntegerSafely(processedLines[1]);
    const perpendicularHeight = convertToIntegerSafely(processedLines[2]);

    // Step 4: Validate that all extracted dimensions were successfully parsed as numbers.
    if (firstParallelBase === null || secondParallelBase === null || perpendicularHeight === null) {
        console.error("Input parsing error: One or more provided dimensions could not be converted into valid integers.");
        // Provide details about the problematic inputs for debugging.
        console.error(`Raw inputs: Base 1='${processedLines[0]}', Base 2='${processedLines[1]}', Height='${processedLines[2]}'`);
        return; // Exit early due to parsing failures.
    }

    // Step 5: Implement a custom handling for negative dimensions.
    // While mathematically possible, in geometric contexts, dimensions are usually non-negative.
    // This adds a warning and uses absolute values for calculation.
    if (firstParallelBase < 0 || secondParallelBase < 0 || perpendicularHeight < 0) {
        console.warn("Warning: Negative values detected for one or more trapezoid dimensions. Calculating area using absolute values.");
        // Apply Math.abs to ensure positive values for calculation,
        // effectively updating the values for this specific scenario.
        const effectiveBaseA = Math.abs(firstParallelBase);
        const effectiveBaseB = Math.abs(secondParallelBase);
        const effectiveHeight = Math.abs(perpendicularHeight);

        // Perform the area calculation with the adjusted (absolute) values.
        const sumOfBasesAdjusted = effectiveBaseA + effectiveBaseB;
        const areaResultAdjusted = (sumOfBasesAdjusted * effectiveHeight) / 2;

        console.log(`Calculated Area (adjusted for negative inputs): ${areaResultAdjusted}`);
        return; // Conclude processing after adjusted calculation.
    }

    // Step 6: Proceed with the standard area calculation using validated positive dimensions.
    // Break down the formula into intermediate steps for improved readability and clarity.
    const sumOfParallelSides = firstParallelBase + secondParallelBase; // Intermediate step 1.
    const productOfSumAndHeight = sumOfParallelSides * perpendicularHeight; // Intermediate step 2.
    const finalAreaValue = productOfSumAndHeight / 2; // Final calculation.

    // Step 7: Output the computed area using a descriptive template literal.
    console.log(`The total calculated area of the trapezoid is: ${finalAreaValue}`);
}

// Main execution entry point: Handles file system interactions and error management.
try {
    // Dynamically import the Node.js file system module.
    const fileSystemUtility = require("fs");
    // Define the standard input file path and character encoding.
    const standardInputFile = "/dev/stdin";
    const contentEncoding = "utf8";

    // Read the entire content from the standard input synchronously.
    const rawInputData = fileSystemUtility.readFileSync(standardInputFile, contentEncoding);

    // Invoke our primary function with the data obtained from standard input.
    computeTrapezoidArea(rawInputData);
} catch (runtimeError) {
    // Catch and report any exceptions that occur during file reading or initial setup.
    console.error("A critical error occurred during program execution:", runtimeError.message);
    // Provide additional context for common errors, like file not found.
    if (runtimeError.code === 'ENOENT') {
        console.error("Troubleshooting tip: Verify that the standard input file ('/dev/stdin') exists and is accessible.");
    }
}