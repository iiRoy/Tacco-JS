function processInputData(rawData) {
    // Initial validation: Ensure the input data is a non-empty string.
    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Error: Provided input data is empty or not a valid string. Cannot proceed.");
        return; // Terminate execution gracefully.
    }

    // --- Data Parsing Phase ---
    // Split the raw multi-line input string into individual lines.
    const inputLines = rawData.split("\n");

    // Define the minimum number of numeric values expected based on the problem's logic.
    // The calculation relies on numericValues[0] and numericValues[1] through numericValues[5].
    const MIN_REQUIRED_NUMERIC_ENTRIES = 6;

    // Validate if enough lines were provided in the input.
    if (inputLines.length < MIN_REQUIRED_NUMERIC_ENTRIES) {
        console.error(`Error: Insufficient input lines. Expected at least ${MIN_REQUIRED_NUMERIC_ENTRIES}, but received ${inputLines.length}.`);
        return;
    }

    // Convert each line into an integer. Error handling included for non-numeric lines.
    const numericValues = inputLines.map((lineContent, index) => {
        const parsedNumber = parseInt(lineContent.trim(), 10);
        if (isNaN(parsedNumber)) {
            // If a line cannot be parsed as a number, log an error and throw an exception.
            // This ensures robustness against malformed input.
            throw new Error(`Input parsing failed: Line ${index + 1} ("${lineContent}") is not a valid integer.`);
        }
        return parsedNumber;
    });

    // --- Core Logic: Finding the Minimum Value ---
    // The problem requires finding the minimum value among the elements from index 1 to 5 (inclusive).
    // Initialize the lowest cost with the value at index 1 as per the original algorithm's starting point.
    let lowestCost = numericValues[1];

    // Define a constant for the count of items that contribute to finding the minimum.
    // This corresponds to items at index 1 through 5.
    const ITEMS_FOR_MIN_CALC = 5;

    // Iterate through the relevant section of the numeric values array
    // (from index 1 up to and including index 5) to determine the true minimum.
    for (let currentIdx = 1; currentIdx <= ITEMS_FOR_MIN_CALC; currentIdx++) {
        // Basic bounds check, though 'MIN_REQUIRED_NUMERIC_ENTRIES' should prevent this for expected input.
        if (currentIdx >= numericValues.length) {
            console.warn(`Warning: Attempted to access array index ${currentIdx} which is out of bounds for min calculation. Skipping.`);
            continue;
        }
        if (numericValues[currentIdx] < lowestCost) {
            lowestCost = numericValues[currentIdx];
        }
    }

    // --- Validation for Calculated Minimum ---
    // Prevent division by zero or negative costs which would lead to illogical results.
    if (lowestCost <= 0) {
        console.error(`Error: The calculated lowest cost (${lowestCost}) is non-positive. Cannot perform division.`);
        return -1; // Indicate a failure or an uncomputable result.
    }

    // --- Final Calculation Phase ---
    // The first value (numericValues[0]) represents a primary quantity or budget.
    // As per the problem's logic, we subtract one from this value before further calculations.
    const adjustedPrimaryQuantity = numericValues[0] - 1;

    // Calculate how many additional units can be obtained by dividing the adjusted primary quantity
    // by the determined lowest cost. Math.floor ensures we only count whole units.
    const additionalUnitsObtained = Math.floor(adjustedPrimaryQuantity / lowestCost);

    // A base count of items (5) is added to the additional units.
    // This '5' likely represents a fixed set of initial items or a constant factor in the problem.
    const BASE_UNITS_CONSTANT = 5;
    let finalCalculatedResult = additionalUnitsObtained + BASE_UNITS_CONSTANT;

    // --- Output Phase ---
    // Display the final computed result to the console.
    console.log(finalCalculatedResult);
}

// --- Execution Entry Point ---
// Read input from standard input and pass it to the processing function.
// A try-catch block is used to gracefully handle potential file system errors
// or errors thrown during the data processing (e.g., parsing errors).
try {
    processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (executionError) {
    console.error("An unhandled error occurred during program execution:", executionError.message);
    // Optionally, exit with a non-zero status code to signal a failure to the operating system.
    // process.exit(1);
}