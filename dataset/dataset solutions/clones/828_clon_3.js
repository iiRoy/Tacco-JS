const fs = require('fs'); // Import the file system module

// Function to compute a performance metric for a given record
// Parameters are renamed for clarity and represent distinct aspects of a record's data.
function derivePerformanceMetric(
    entityLabel,      // L: Label/Name of the entity
    initialCapital,   // P: Initial cost/capital
    componentAlpha,   // A: First time component
    componentBeta,    // B: Second time component
    componentGamma,   // C: Third time component
    factorDelta,      // D: First scaling factor
    factorEpsilon,    // E: Second scaling factor
    factorEta,        // F: Final scaling factor for revenue
    scaleSigma,       // S: Scale multiplier
    quantityMu        // M: Quantity/overall multiplier
) {
    // Calculate the total duration based on various components and scaled factors.
    const baseDurationElements = componentAlpha + componentBeta + componentGamma;
    const scaledDurationFactors = (factorDelta + factorEpsilon) * quantityMu;
    const totalOperationDuration = baseDurationElements + scaledDurationFactors;

    // Guard against division by zero for the performance metric.
    // If duration is zero, the metric is undefined, so return null or throw an error.
    if (totalOperationDuration === 0) {
        // console.warn(`Warning: Zero operation duration encountered for entity: ${entityLabel}. Skipping metric calculation.`);
        return null; // Indicate an invalid or uncalculable metric
    }

    // Calculate the net financial gain.
    const grossRevenuePotential = factorEta * scaleSigma * quantityMu;
    const netFinancialGain = grossRevenuePotential - initialCapital;

    // The performance metric is derived from the net gain per unit of duration.
    return {
        identifier: entityLabel,
        metricScore: netFinancialGain / totalOperationDuration
    };
}

// Read raw input data from standard input, treating it as UTF-8.
const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');

// Process input lines: split by newline and filter out any empty lines
// that might result from trailing newlines or multiple consecutive newlines.
let parsedInputLines = rawInputData.split('\n').filter(line => line.trim().length > 0);

let currentLineIndex = 0; // Keep track of the current position in the input lines array.

// Main processing loop: continues as long as there are lines to process
// and the 'number of entries' indicator is not zero.
while (currentLineIndex < parsedInputLines.length) {
    // The first value on a new block is the count of records for that block.
    const numberOfEntries = Number(parsedInputLines[currentLineIndex++]);

    // If the record count is zero, it signals the end of input blocks.
    if (numberOfEntries === 0) {
        break;
    }

    // Initialize an array to hold the processed results for the current block.
    const blockProcessedRecords = [];

    // Iterate through each entry within the current block.
    for (let recordIteration = 0; recordIteration < numberOfEntries; recordIteration++) {
        // Get the current record line and split it by spaces.
        const recordDataSegments = parsedInputLines[currentLineIndex++].split(' ');

        // Extract the entity identifier (first segment).
        const recordIdentifier = recordDataSegments.shift();

        // Convert the remaining segments to numbers.
        const numericalParameters = recordDataSegments.map(param => Number(param));

        // Validate that all numerical parameters were successfully converted.
        // If any parameter is NaN, it indicates malformed input for this record.
        if (numericalParameters.some(isNaN)) {
            // console.error(`Skipping malformed record: ${recordIdentifier}. Invalid numerical parameters.`);
            continue; // Move to the next record
        }

        // Destructure the numerical parameters for clarity when passing to the helper function.
        const [
            paramP, paramA, paramB, paramC,
            paramD, paramE, paramF, paramS, paramM
        ] = numericalParameters;

        // Calculate the performance metric using the helper function.
        const calculatedResult = derivePerformanceMetric(
            recordIdentifier,
            paramP, paramA, paramB, paramC,
            paramD, paramE, paramF, paramS, paramM
        );

        // Add the result to our list if it was successfully calculated.
        if (calculatedResult !== null) {
            blockProcessedRecords.push(calculatedResult);
        }
    }

    // Sort the records:
    // Primary sort: by metricScore in descending order (higher score first).
    // Secondary sort (tie-breaker): by identifier in ascending alphabetical order.
    blockProcessedRecords.sort((recordOne, recordTwo) => {
        // Compare metric scores first.
        const scoreDifference = recordTwo.metricScore - recordOne.metricScore;
        if (scoreDifference !== 0) {
            return scoreDifference;
        }
        // If scores are equal, sort by identifier alphabetically.
        return recordOne.identifier.localeCompare(recordTwo.identifier);
    });

    // Output the identifiers of the sorted records.
    for (const recordEntry of blockProcessedRecords) {
        console.log(recordEntry.identifier);
    }

    // Print a separator after each block of results.
    console.log("--- End of Block ---"); // Changed separator for variety
}