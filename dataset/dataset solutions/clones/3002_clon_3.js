/*
 * This script processes input data to calculate a total production yield.
 * It's designed to read parameters from a single line of standard input.
 */

// Main processing function, renamed from 'Main' to reflect its purpose more clearly.
function processProductionParameters(rawInputLine) {
    // Ensure strict type checking and validation for robust operation.

    // 1. Input parsing and initial validation.
    // The raw input string is expected to contain three space-separated numeric values.
    if (typeof rawInputLine !== 'string' || rawInputLine.trim().length === 0) {
        // Log an error and exit if the input is empty or not a string.
        console.error("Input error: Provided data is not a valid string or is empty.");
        // In such error cases, we might return a default value or throw an exception.
        // For this clone, returning 0 is functionally similar to a silent failure for invalid input.
        return 0;
    }

    // Split the input string into individual components.
    // Using a regex for splitting handles multiple spaces robustly.
    const separatedValues = rawInputLine.trim().split(/\s+/);

    // Validate the number of components received.
    const expectedValueCount = 3;
    if (separatedValues.length < expectedValueCount) {
        console.error(`Input error: Insufficient parameters. Expected ${expectedValueCount}, received ${separatedValues.length}.`);
        return 0;
    }

    // Extract and convert string values to numbers.
    // Using Number() constructor for parsing, which handles various numeric formats.
    const productionIntervalString = separatedValues[0];
    const yieldPerCycleString = separatedValues[1];
    const availableTotalTimeString = separatedValues[2];

    const timeBetweenProducts = Number(productionIntervalString); // Represents 'a' from original problem.
    const productsPerBatch = Number(yieldPerCycleString);       // Represents 'b' from original problem.
    const totalOperationalTime = Number(availableTotalTimeString); // Represents 't' from original problem.

    // Validate that all parsed values are indeed numbers.
    if (isNaN(timeBetweenProducts) || isNaN(productsPerBatch) || isNaN(totalOperationalTime)) {
        console.error("Input error: One or more parameters could not be converted to a number.");
        return 0;
    }

    // 2. Business logic for calculating total yield.

    // Guard clause: If the time interval for production is zero or negative, no production can occur.
    if (timeBetweenProducts <= 0) {
        console.warn("Warning: Production interval is zero or negative. No items can be produced.");
        return 0;
    }

    // The original logic uses (totalTime + 0.5). This often implies a specific
    // rounding behavior or a small buffer to account for marginal time availability.
    // We maintain this specific calculation pattern.
    const bufferedOperationalTime = totalOperationalTime + 0.5;

    // Determine the number of full production cycles that can be completed.
    // Math.floor ensures we only count fully completed cycles.
    const completedProductionCycles = Math.floor(bufferedOperationalTime / timeBetweenProducts);

    // Calculate the total yield by multiplying completed cycles by products per batch.
    const cumulativeProductYield = completedProductionCycles * productsPerBatch;

    // 3. Output the final calculated result.
    console.log(cumulativeProductYield);

    // For potential programmatic use, the calculated yield is also returned.
    return cumulativeProductYield;
}

// --- STANDARD INPUT HANDLING SECTION ---
// This part is responsible for reading input from stdin and invoking the main processing function.
// It should typically not be modified for problem-solving purposes.
processProductionParameters(require("fs").readFileSync("/dev/stdin", "utf8"));