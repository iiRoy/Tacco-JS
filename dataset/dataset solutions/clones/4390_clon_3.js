// This script is designed to process standard input for calculating the minimum cost
// to acquire a specified volume of liquid, given various pricing options for
// different quantities. It uses BigInt for precise calculations with large numbers.

// Ensure the standard input stream is active and ready to receive data.
process.stdin.resume();
// Set the character encoding for the input stream to 'utf8' to correctly handle text.
process.stdin.setEncoding('utf8');

// A dynamic array to accumulate all lines received from standard input.
let accumulatedInputLines = [];

/**
 * Determines the smallest BigInt value among a variable number of arguments.
 * This custom function is necessary as Math.min does not support BigInts directly.
 * @param {...BigInt} candidateValues - A list of BigInt values to compare.
 * @returns {BigInt} The minimum BigInt value from the provided list.
 */
const retrieveMinimumBigInt = (...candidateValues) => {
    // As a Type III addition: Added a check for empty input.
    // In a competitive programming context, this might not be strictly necessary
    // if input guarantees at least one value, but it enhances robustness.
    if (candidateValues.length === 0) {
        // Depending on requirements, could throw an error or return a specific default.
        // For this problem, 0n is a safe default if no costs are provided (unlikely).
        console.error("Warning: 'retrieveMinimumBigInt' called with no arguments. Returning 0n.");
        return 0n;
    }
    let currentLowest = candidateValues[0];
    // Iterate through the rest of the values to find a smaller one.
    for (let index = 1; index < candidateValues.length; index++) {
        if (candidateValues[index] < currentLowest) {
            currentLowest = candidateValues[index];
        }
    }
    return currentLowest;
};

/**
 * Outputs a BigInt value to the console, ensuring it's converted to a string
 * for proper display. This function serves as a wrapper for console.log.
 * @param {BigInt} valueToPresent - The BigInt value to be printed to standard output.
 */
const presentResult = (valueToPresent) => {
    console.log(valueToPresent.toString());
};

// Import the 'readline' module to create an interface for reading input line by line.
const readlineModule = require('readline');
const inputLineProcessor = readlineModule.createInterface({
    input: process.stdin,
    // The 'output' stream is typically for prompts, not directly used for printing
    // results in this type of problem, but required by the interface.
    output: process.stdout
});

// Register an event handler for each time a new line of input is received.
inputLineProcessor.on('line', (individualLineSegment) => {
    accumulatedInputLines.push(individualLineSegment);
});

// Register an event handler for when the input stream has ended (e.g., EOF).
// This is where the main logic for cost calculation will be executed.
inputLineProcessor.on('close', () => {
    // Extract and parse the cost parameters from the first line of input.
    // These represent costs for 0.25L, 0.5L, 1L, and 2L respectively.
    const initialCostData = accumulatedInputLines[0].split(" ").map(str => BigInt(str));
    const [
        costForQuarterLiter,   // Price for 0.25 liters
        costForHalfLiter,      // Price for 0.50 liters
        costForSingleLiter,    // Price for 1.00 liter
        costForDoubleLiter     // Price for 2.00 liters
    ] = initialCostData;

    // Extract and parse the total required volume from the second line of input.
    const requiredTotalVolume = BigInt(accumulatedInputLines[1]);

    // A Type III addition: Initialize the variable that will hold the final calculated cost.
    let totalMinimumCost = 0n;

    // A Type III addition: Implement a guard clause for non-positive required volume.
    // If no liquid is required or an invalid volume is given, the cost is 0.
    if (requiredTotalVolume <= 0n) {
        presentResult(0n);
        return; // Terminate execution as nothing needs to be purchased.
    }

    // Determine the most cost-effective way to obtain exactly 1 liter of liquid.
    // Options: four quarter-liter units, two half-liter units, or one single-liter unit.
    const optimalCostPerOneLiter = retrieveMinimumBigInt(
        costForQuarterLiter * 4n,  // Cost of 1L using 0.25L packages
        costForHalfLiter * 2n,     // Cost of 1L using 0.50L packages
        costForSingleLiter         // Cost of 1L using 1.00L packages
    );

    // Determine the most cost-effective way to obtain exactly 2 liters of liquid.
    // Options: two optimally priced 1-liter units, or one 2-liter unit.
    const optimalCostPerTwoLiters = retrieveMinimumBigInt(
        optimalCostPerOneLiter * 2n, // Cost of 2L by buying two 1L units
        costForDoubleLiter           // Cost of 2L by buying one 2L unit package
    );

    // Check if the total required volume is an even number of liters.
    const isVolumeAnEvenNumber = (requiredTotalVolume % 2n === 0n);

    if (isVolumeAnEvenNumber) {
        // If the volume is even, we can fulfill the entire order using 2-liter bundles
        // at the optimal 2-liter price.
        totalMinimumCost = (requiredTotalVolume / 2n) * optimalCostPerTwoLiters;
    } else {
        // If the volume is odd, we have two primary strategies:
        // Strategy 1: Buy all `requiredTotalVolume` liters using the optimal 1-liter price.
        const costOptionAllOneLiterUnits = requiredTotalVolume * optimalCostPerOneLiter;

        // Strategy 2: Buy (requiredTotalVolume - 1) liters using optimal 2-liter bundles,
        // and then buy the remaining 1 liter using the optimal 1-liter price.
        const costOptionBundlesAndSingle = ((requiredTotalVolume - 1n) / 2n) * optimalCostPerTwoLiters + optimalCostPerOneLiter;

        // Compare the two strategies and select the cheaper one.
        totalMinimumCost = retrieveMinimumBigInt(costOptionAllOneLiterUnits, costOptionBundlesAndSingle);
    }

    // Output the final calculated minimum total cost for the required liquid volume.
    presentResult(totalMinimumCost);
});