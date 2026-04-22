const systemIO = require('fs'); // Module for file system operations, like reading input.

/**
 * Calculates a performance metric based on an entity's identifier and a set of numeric parameters.
 * This function encapsulates the core business logic for deriving a ratio.
 *
 * @param {string} entityIdentifier - A unique label for the entity.
 * @param {number[]} parameters - An array of 9 numeric values representing various costs, rates, and factors.
 *   - index 0: initialInvestment (P)
 *   - index 1: fixedTimeComponent1 (A)
 *   - index 2: fixedTimeComponent2 (B)
 *   - index 3: fixedTimeComponent3 (C)
 *   - index 4: rateFactorD (D)
 *   - index 5: rateFactorE (E)
 *   - index 6: revenueFactorF (F)
 *   - index 7: scaleFactorS (S)
 *   - index 8: iterationMultiplier (M)
 * @returns {{entityLabel: string, calculatedRatio: number}} An object containing the entity's label and its computed performance ratio.
 */
function derivePerformanceRatio(entityIdentifier, parameters) {
    // Destructure the input parameters for clarity and direct access.
    // This maps the original 'P, A, B, C, D, E, F, S, M' to descriptive names.
    const [
        initialInvestment,      // P: Base cost or initial outlay
        fixedTimeComponent1,    // A: First component of fixed time
        fixedTimeComponent2,    // B: Second component of fixed time
        fixedTimeComponent3,    // C: Third component of fixed time
        rateFactorD,            // D: First rate factor for variable time
        rateFactorE,            // E: Second rate factor for variable time
        revenueFactorF,         // F: Factor contributing to gross revenue
        scaleFactorS,           // S: Scaling factor for revenue
        iterationMultiplier     // M: Multiplier affecting both time and revenue
    ] = parameters;

    // --- Calculation of Total Operational Time ---
    // The fixed components (A, B, C) are summed up directly.
    const baseTimeCost = fixedTimeComponent1 + fixedTimeComponent2 + fixedTimeComponent3;
    // The variable time component is derived from (D + E) multiplied by M.
    const variableTimeCost = (rateFactorD + rateFactorE) * iterationMultiplier;
    // Summing fixed and variable components gives the total time.
    const totalOperationalTime = baseTimeCost + variableTimeCost;

    // --- Calculation of Net Financial Outcome ---
    // Gross revenue is calculated from F * S * M.
    const grossRevenuePotential = revenueFactorF * scaleFactorS * iterationMultiplier;
    // Net outcome is gross revenue minus the initial investment P.
    const netFinancialOutcome = grossRevenuePotential - initialInvestment;

    // --- Robustness Check: Prevent division by zero or non-positive time ---
    // If operational time is zero or negative, the ratio is undefined or nonsensical.
    // Returning NaN ensures it's handled gracefully in sorting (usually pushed to end).
    if (totalOperationalTime <= 0) {
        console.warn(`Warning: Non-positive operational time (${totalOperationalTime}) for entity '${entityIdentifier}'. Ratio will be NaN.`);
        return {
            entityLabel: entityIdentifier,
            calculatedRatio: NaN // Represents an undefined or invalid ratio.
        };
    }

    // --- Final Performance Metric Calculation ---
    // The performance metric is the ratio of net financial outcome to total operational time.
    const performanceMetric = netFinancialOutcome / totalOperationalTime;

    // Return a structured object containing the entity's label and its calculated metric.
    return {
        entityLabel: entityIdentifier,
        calculatedRatio: performanceMetric
    };
}

// Read the entire standard input stream, assuming UTF-8 encoding.
// The raw data is then trimmed of whitespace and split into an array of lines.
const rawInputString = systemIO.readFileSync('/dev/stdin', 'utf8');
let inputLineBuffer = rawInputString.trim().split('\n');

// A counter to keep track of how many blocks of data have been processed.
let processedBlockCount = 0;

// Main application loop: Processes data in blocks until a termination signal is received.
// The loop continues indefinitely until explicitly broken.
while (true) {
    // Extract the first line from the buffer, which should contain the count of records
    // for the current data block. Convert it to an integer.
    const recordsToProcessStr = inputLineBuffer.shift();

    // Check if the input buffer is empty prematurely or if the line is not a valid number.
    if (!recordsToProcessStr) {
        console.error("Error: Unexpected end of input or missing record count line.");
        break; // Exit if no more input.
    }

    const recordsToProcess = parseInt(recordsToProcessStr, 10);

    // The value 0 for recordsToProcess acts as a sentinel to terminate the program.
    if (recordsToProcess === 0) {
        // Termination condition met.
        break;
    }

    // Increment the block counter for logging or debugging purposes.
    processedBlockCount++;

    // Initialize an array to hold the performance data for all entities within this block.
    const currentBlockResults = [];

    // Iterate through each expected record within the current data block.
    for (let recordIndex = 0; recordIndex < recordsToProcess; recordIndex++) {
        const currentDataLine = inputLineBuffer.shift();

        // Defensive check: Ensure a line actually exists before attempting to process it.
        if (!currentDataLine) {
            console.error(`Error: Expected ${recordsToProcess} records in block ${processedBlockCount}, but input ended prematurely at record ${recordIndex + 1}.`);
            // Break from the inner loop to prevent further errors in this block.
            // The outer loop might still try to process another block if inputLineBuffer isn't exhausted.
            break;
        }

        // Split the current line into parts based on spaces.
        const segmentParts = currentDataLine.split(' ');

        // The first segment is the entity's label (a string).
        const entityLabel = segmentParts.shift();

        // Convert the remaining segments (which are numeric parameters) to floating-point numbers.
        const numericParameters = segmentParts.map(val => parseFloat(val));

        // Call the helper function to calculate the performance data for this specific entity.
        const entityPerformanceData = derivePerformanceRatio(entityLabel, numericParameters);

        // Add the calculated data object to the results array for the current block.
        currentBlockResults.push(entityPerformanceData);
    }

    // Sort the results collected for the current block based on specific criteria.
    // Primary sort: Descending order of `calculatedRatio`.
    // Secondary sort: Ascending alphabetical order of `entityLabel` if ratios are equal.
    currentBlockResults.sort((itemA, itemB) => {
        // Calculate the difference in ratios for primary sorting (descending).
        // A larger positive difference means itemB's ratio is higher, so itemB comes first.
        const ratioComparison = itemB.calculatedRatio - itemA.calculatedRatio;

        if (ratioComparison !== 0) {
            // If the ratios are different, use the ratio comparison result.
            return ratioComparison;
        } else {
            // If ratios are identical, use lexical comparison of entity labels (ascending).
            // localeCompare provides a robust way to compare strings alphabetically.
            return itemA.entityLabel.localeCompare(itemB.entityLabel);
        }
    });

    // Output the sorted entity labels to the console.
    // Each label is printed on a new line.
    currentBlockResults.forEach(resultEntry => {
        console.log(resultEntry.entityLabel);
    });

    // After printing all entities for a block, print the block separator.
    console.log("#");
}

// The program concludes once the main loop is exited by encountering a '0' record count.