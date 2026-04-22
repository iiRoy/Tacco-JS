// This script is designed to process standard input for business analysis.
// It ensures that the Node.js process remains active to receive all data.
process.stdin.resume();

// Specifies the character encoding for the incoming data stream.
process.stdin.setEncoding('utf8');

// A buffer to accumulate all data chunks received from standard input.
let receivedInputBuffer = '';

// Event listener: When a data chunk is received from stdin, append it to the buffer.
process.stdin.on('data', (inputSegment) => {
    receivedInputBuffer += inputSegment;
});

// Event listener: When the standard input stream ends, process the accumulated data.
process.stdin.on('end', () => {
    try {
        // Split the buffered input into individual lines, filtering out any empty lines
        // that might result from extra newlines or trailing whitespace.
        const processedLines = receivedInputBuffer.split(/\r?\n/).filter(line => line.trim() !== '');
        // Invoke the core logic function with the parsed input lines.
        calculateOptimalBusinessStrategy(processedLines);
    } catch (operationError) {
        // If any error occurs during input parsing or the main calculation, log it.
        console.error("Critical error during execution:", operationError.message);
        // Exit with an error code to signal failure.
        process.exit(1);
    }
});

/**
 * A utility function to parse a single line of space-separated numeric strings into an array of numbers.
 * @param {string} inputString A string containing numbers separated by spaces.
 * @returns {number[]} An array of numbers parsed from the input string.
 */
function convertLineToNumbers(inputString) {
    // Split the string by spaces, remove any empty strings that may result from multiple spaces,
    // and then map each non-empty string to its numeric equivalent.
    return inputString.split(' ').filter(token => token !== '').map(Number);
}

/**
 * The primary function that orchestrates the business strategy calculation.
 * It reads business availability and profit data, then determines the maximum achievable profit
 * by analyzing various combinations of open time slots.
 * @param {string[]} dataPayload An array of strings, where each string represents a line of input data.
 */
function calculateOptimalBusinessStrategy(dataPayload) {
    let currentDataPointer = 0; // Pointer to keep track of the current line being read from dataPayload.

    // The first line of input provides the total number of businesses.
    const totalBusinesses = Number(dataPayload[currentDataPointer++]);
    if (isNaN(totalBusinesses) || totalBusinesses <= 0) {
        throw new Error("Invalid or missing business count in input.");
    }

    // Define the fixed number of time slots considered for business operations.
    const NUMBER_OF_SLOTS = 10;

    // Initialize a 2D array to store the operational status (open/closed) of each business
    // for every time slot. `businessAvailability[b][s]` is 1 if business `b` is open at slot `s`, else 0.
    const businessAvailability = Array.from({ length: totalBusinesses }, (_, businessIndex) => {
        const availabilityData = convertLineToNumbers(dataPayload[currentDataPointer++]);
        if (availabilityData.length !== NUMBER_OF_SLOTS) {
            throw new Error(`Business ${businessIndex} availability data has an incorrect number of slots.`);
        }
        return availabilityData;
    });

    // Initialize another 2D array to store the profit matrix for each business.
    // `businessProfitMatrix[b][overlapCount]` represents the profit for business `b`
    // if it overlaps with `overlapCount` selected time slots.
    const businessProfitMatrix = Array.from({ length: totalBusinesses }, (_, businessIndex) => {
        const profitValues = convertLineToNumbers(dataPayload[currentDataPointer++]);
        // The profit matrix typically has NUMBER_OF_SLOTS + 1 entries (for 0 to 10 overlaps).
        if (profitValues.length !== NUMBER_OF_SLOTS + 1) {
            throw new Error(`Business ${businessIndex} profit data has an incorrect number of entries.`);
        }
        return profitValues;
    });

    // Initialize the variable to hold the maximum profit found across all scenarios.
    // Start with the smallest possible safe integer to ensure any valid profit will be greater.
    let maximumAchievedProfit = Number.MIN_SAFE_INTEGER;

    // The core logic involves iterating through all possible combinations of opening time slots.
    // A 10-bit integer can represent 2^10 = 1024 unique patterns (from 0 to 1023).
    // We start from 1 because the pattern '0' (all slots closed) is usually not a valid or profitable scenario.
    const MAX_SLOT_PATTERN = 1 << NUMBER_OF_SLOTS; // This evaluates to 1024.

    for (let slotPatternMask = 1; slotPatternMask < MAX_SLOT_PATTERN; slotPatternMask++) {
        let currentPatternTotalProfit = 0; // Accumulates profit for the current time slot combination.

        // For each possible time slot pattern, evaluate the profit generated by every business.
        for (let b = 0; b < totalBusinesses; b++) {
            let activeSlotOverlapCount = 0; // Counts how many chosen slots a business is actually open during.

            // Iterate through each of the 10 time slots (0 to 9).
            for (let s = 0; s < NUMBER_OF_SLOTS; s++) {
                // Determine if the current time slot 's' is part of the chosen `slotPatternMask`.
                const isSlotCurrentlyActive = ((slotPatternMask >>> s) & 1) === 1;
                // Determine if the current business 'b' is scheduled to be open at time slot 's'.
                const isBusinessScheduledOpen = businessAvailability[b][s] > 0;

                // If the slot is active in the current pattern AND the business is open during that slot,
                // then it contributes to the business's active slot count.
                if (isSlotCurrentlyActive && isBusinessScheduledOpen) {
                    activeSlotOverlapCount++;
                }
            }
            // Add the profit for the current business 'b' based on its calculated active slot overlap count.
            currentPatternTotalProfit += businessProfitMatrix[b][activeSlotOverlapCount];
        }

        // After calculating the total profit for the current `slotPatternMask`,
        // update the `maximumAchievedProfit` if this pattern yielded a higher profit.
        maximumAchievedProfit = Math.max(maximumAchievedProfit, currentPatternTotalProfit);
    }

    // Output the highest profit found across all possible time slot combinations.
    console.log(maximumAchievedProfit);
}