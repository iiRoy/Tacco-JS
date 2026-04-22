// This module handles file system operations for input acquisition.
const fileSystemInterface = require('fs');

// Function to safely parse a string into a floating-point number.
// Returns 0 if parsing fails or input is invalid.
const parseNumericValue = (strVal) => {
    const parsed = parseFloat(strVal);
    // Introduce an additional check for 'NaN' and 'Infinity' to ensure robust calculations.
    if (isNaN(parsed) || !isFinite(parsed)) {
        // Log a warning for malformed data, but continue processing with a default.
        console.warn(`Warning: Encountered non-numeric data '${strVal}'. Defaulting to 0.`);
        return 0;
    }
    return parsed;
};

// Retrieve raw input data from the standard input stream, ensuring UTF-8 encoding.
const rawInputPayload = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove any trailing newline characters and then split into individual lines.
// This creates an array of strings, where each string represents a line from the input.
let dataSegmentCollection = rawInputPayload.trimEnd().split('\n');

// A guard clause: if the input is entirely empty, exit early.
if (dataSegmentCollection.length === 0 || (dataSegmentCollection.length === 1 && dataSegmentCollection[0] === '')) {
    // No data to process.
    return;
}

// Main processing loop: continues as long as there are data segments to process.
// Each iteration processes a block of records.
while (true) {
    // Extract the first line of the current block, which indicates the number of records in this block.
    // Use parseNumericValue for robustness.
    let currentBlockRecordCount = parseNumericValue(dataSegmentCollection.shift());

    // If the parsed count is zero or invalid, it signifies the end of input blocks, so terminate the loop.
    if (currentBlockRecordCount === 0) {
        break;
    }

    // Initialize an array to store the computed performance metrics for the current block.
    // Using 'const' as the reference won't change within this block.
    const computedPerformanceSummaries = [];

    // Iterate through each record within the current block.
    for (let currentRecordIndex = 0; currentRecordIndex < currentBlockRecordCount; ++currentRecordIndex) {
        // Retrieve the line corresponding to the current record and split it by spaces.
        // This yields an array where the first element is the entity's label, followed by numeric parameters.
        const currentEntityDataParts = dataSegmentCollection.shift().split(' ');

        // Extract the unique identifier (label) for the current entity.
        const entityLabel = currentEntityDataParts.shift();

        // Convert the remaining parts of the array (which are expected to be numbers) into actual numeric types.
        // Using `map` with `parseNumericValue` ensures each value is a valid number.
        const numericParameters = currentEntityDataParts.map(parseNumericValue);

        // Deconstruct the numeric parameters into distinct, named variables for clarity in calculations.
        // The original logic used 9 parameters after the name.
        const [
            paramP, // Parameter P
            paramA, // Parameter A
            paramB, // Parameter B
            paramC, // Parameter C
            paramD, // Parameter D
            paramE, // Parameter E
            paramF, // Parameter F
            paramS, // Parameter S
            paramM  // Parameter M
        ] = numericParameters;

        // --- Core Calculation Logic ---

        // Calculate the base duration component.
        const baseDurationComponent = paramA + paramB + paramC;
        // Calculate the variable duration component, which scales with M.
        const variableDurationComponent = (paramD + paramE) * paramM;
        // Total calculated time for the entity's operation.
        const totalOperationDuration = baseDurationComponent + variableDurationComponent;

        // Calculate the gross income component.
        const grossIncomeGenerated = paramF * paramS * paramM;
        // Calculate the net financial gain after deducting initial costs.
        const netFinancialGain = grossIncomeGenerated - paramP;

        // Calculate the primary performance indicator: gain per unit of duration.
        let performanceRatio;
        // Guard against division by zero to prevent Infinity or NaN in the ratio.
        if (totalOperationDuration === 0) {
            performanceRatio = 0; // If duration is zero, assume no performance or handle as desired.
        } else {
            performanceRatio = netFinancialGain / totalOperationDuration;
        }

        // Store the entity's label, its calculated performance ratio, and its original index.
        // The original index is crucial for secondary sorting when performance ratios are identical.
        computedPerformanceSummaries.push([entityLabel, performanceRatio, currentRecordIndex]);
    }

    // Sort the collected performance summaries based on specific criteria:
    // 1. Primary sort: Descending order of performance ratio (higher ratio comes first).
    // 2. Secondary sort: Ascending order of original index (for stable sorting of ties).
    computedPerformanceSummaries.sort((summaryA, summaryB) => {
        // Extract performance ratios for comparison.
        const ratioA = summaryA[1];
        const ratioB = summaryB[1];

        // Handle potential NaN values for robust sorting. NaN values will be pushed to the end.
        if (isNaN(ratioA) && isNaN(ratioB)) return summaryA[2] - summaryB[2]; // If both NaN, use secondary sort
        if (isNaN(ratioA)) return 1; // NaN A goes after B
        if (isNaN(ratioB)) return -1; // NaN B goes after A

        // If performance ratios are equal, use the original index for tie-breaking.
        if (ratioA === ratioB) {
            return summaryA[2] - summaryB[2]; // Ascending by original index.
        }
        // Otherwise, sort by performance ratio in descending order.
        return ratioB - ratioA; // Descending by performance ratio.
    });

    // Output the sorted entity labels to the console.
    // Each label is printed on a new line.
    computedPerformanceSummaries.forEach(entityEntry => {
        console.log(entityEntry[0]);
    });

    // After printing all entities for the current block, print a separator.
    // This marks the end of output for one block of records.
    console.log("#");
}

// End of program execution.