'use strict';

/**
 * Analyzes facility configurations and associated profit/penalty data
 * to determine the highest possible total profit.
 * This process involves iterating through all potential combinations
 * of features/facilities being "active" and calculating a cumulative
 * profit for each combination based on overlapping attributes.
 *
 * @param {string} rawInputContent - The complete raw string content read from the input source.
 */
function evaluateOptimalConfiguration(rawInputContent) {
    // Pre-process the raw input: remove leading/trailing whitespace and split into individual lines.
    const inputDataLines = rawInputContent.trim().split('\n');

    // Extract the total number of facilities from the first line.
    // Perform basic validation to ensure it's a positive integer.
    const totalFacilities = Number(inputDataLines.shift());
    if (isNaN(totalFacilities) || totalFacilities <= 0) {
        console.error("Input Error: The first line must contain a valid positive integer for total facilities.");
        return;
    }

    // Initialize data structures for facility features and profit/penalty tables.
    const facilityAttributes = [];
    const profitLookupTables = [];

    // Populate the 'facilityAttributes' array from the subsequent 'totalFacilities' lines.
    // Each line describes the features (0s or 1s) present for a given facility.
    for (let facilityIndex = 0; facilityIndex < totalFacilities; facilityIndex++) {
        const attributes = inputDataLines[facilityIndex].split(' ').map(attributeStr => parseInt(attributeStr, 10));

        // Validate that all attributes are binary (0 or 1).
        if (attributes.some(attr => attr !== 0 && attr !== 1)) {
            console.error(`Input Error: Facility ${facilityIndex} contains non-binary attribute values. Expected 0 or 1.`);
            return;
        }
        facilityAttributes.push(attributes);
    }

    // Populate the 'profitLookupTables' array. These lines define the profit/penalty
    // for each facility based on the count of its active features in a given configuration.
    for (let facilityIndex = 0; facilityIndex < totalFacilities; facilityIndex++) {
        const profitsForOverlap = inputDataLines[facilityIndex + totalFacilities].split(' ').map(profitStr => Number(profitStr));

        // Validate that all profit values are valid numbers.
        if (profitsForOverlap.some(val => isNaN(val))) {
            console.error(`Input Error: Profit table for facility ${facilityIndex} contains invalid numeric values.`);
            return;
        }
        profitLookupTables.push(profitsForOverlap);
    }

    // Initialize the variable to store the highest profit discovered, setting a very low floor.
    let highestAchievableProfit = Number.MIN_SAFE_INTEGER;

    // Define the upper limit for the configuration mask. For 10 features,
    // this covers all combinations from 0000000001 (1) to 1111111111 (1023).
    const MAX_FEATURE_COMBINATIONS = 1 << 10; // Represents 1024 (2^10)

    // Iterate through all possible feature configurations.
    // Each 'currentConfigurationMask' is a bitmask representing which features are "active".
    for (let currentConfigurationMask = 1; currentConfigurationMask < MAX_FEATURE_COMBINATIONS; currentConfigurationMask++) {
        let currentTotalProfit = 0; // Accumulator for the profit of the current configuration.

        // For each facility, calculate its individual contribution to the 'currentTotalProfit'.
        for (let facilityIdx = 0; facilityIdx < totalFacilities; facilityIdx++) {
            const facilitySpecificAttributes = facilityAttributes[facilityIdx];

            // Convert the facility's binary attribute array (e.g., [1,0,1]) into an integer bitmask.
            const facilityAttributeBitmask = parseInt(facilitySpecificAttributes.join(''), 2);

            // Perform a bitwise AND operation to find features common to both
            // the facility and the overall 'currentConfigurationMask'.
            const commonActiveFeatures = facilityAttributeBitmask & currentConfigurationMask;

            // Count the number of set bits (1s) in 'commonActiveFeatures'.
            // This count determines which entry in the profit table to use for this facility.
            let numberOfOverlappingFeatures = 0;
            // Iterate through each bit position (assuming up to 10 features).
            for (let bitPos = 0; bitPos < 10; bitPos++) {
                // Check if the bit at 'bitPos' is set in 'commonActiveFeatures'.
                if ((commonActiveFeatures >> bitPos) & 1) {
                    numberOfOverlappingFeatures++;
                }
            }

            // Add the corresponding profit/penalty from the lookup table for the current facility.
            currentTotalProfit += profitLookupTables[facilityIdx][numberOfOverlappingFeatures];
        }

        // Update 'highestAchievableProfit' if the current configuration yielded a better result.
        highestAchievableProfit = Math.max(highestAchievableProfit, currentTotalProfit);
    }

    // Output the final maximum profit found across all configurations.
    console.log(highestAchievableProfit);
}

// Main execution block: Reads input from standard input and initiates the processing.
// This assumes a Node.js environment where 'fs' module is available for file system operations.
evaluateOptimalConfiguration(require('fs').readFileSync('/dev/stdin', 'utf8'));