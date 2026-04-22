const programDataStream = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * Orchestrates the primary data processing logic for identifying numbers
 * that are not multiples of any other number in the provided sequence,
 * and appear exactly once.
 *
 * @param {object} executionEnvironment - An object containing utility functions and data sources.
 * @param {string} executionEnvironment.rawDataSource - The full raw input string.
 * @param {function} executionEnvironment.valueRetriever - A function to extract and parse values from the input.
 * @param {function} executionEnvironment.dataValidator - A placeholder validation utility.
 */
function processInputSequence({ rawDataSource, valueRetriever, dataValidator }) {
    // Initial validation of the input source itself.
    if (!rawDataSource || typeof rawDataSource !== 'string' || rawDataSource.trim().length === 0) {
        console.error("Error: Provided raw data source is empty or invalid.");
        return; // Exit if no meaningful input
    }

    // Retrieve the initial parameter, which specifies the count of numbers to follow.
    // We expect a single numerical value for this purpose.
    const totalInputNumbers = valueRetriever(1, 1, true)[0];

    // Validate the retrieved count to ensure it's a positive integer.
    if (typeof totalInputNumbers !== 'number' || !Number.isInteger(totalInputNumbers) || totalInputNumbers <= 0) {
        console.error("Error: Invalid or non-positive count of elements specified:", totalInputNumbers);
        return; // Abort if the count is invalid
    }

    // Fetch the main sequence of numbers based on the `totalInputNumbers` count.
    const mainNumericSequence = valueRetriever(totalInputNumbers);

    // Perform a integrity check on the fetched sequence.
    if (!Array.isArray(mainNumericSequence) || mainNumericSequence.length !== totalInputNumbers) {
        console.error("Error: Mismatch in fetched data length or type for the main sequence.");
        return; // Abort if data fetching failed or was incomplete
    }

    // If the sequence is empty (though `totalInputNumbers <= 0` should prevent this),
    // there are no numbers to process.
    if (mainNumericSequence.length === 0) {
        console.log(0);
        return;
    }

    // Determine the highest value present in the input sequence.
    // This is crucial for correctly sizing our frequency/sieve array.
    let maximumObservedValue = mainNumericSequence[0]; // Initialize with the first element
    let sequenceIndex = 1;
    while (sequenceIndex < mainNumericSequence.length) {
        const currentElement = mainNumericSequence[sequenceIndex];
        if (currentElement > maximumObservedValue) {
            maximumObservedValue = currentElement;
        }
        sequenceIndex++;
    }

    // Initialize an array to track frequencies and serve as the sieve.
    // The size is `maximumObservedValue + 1` to accommodate the highest index,
    // plus a small buffer for robustness.
    const sieveArrayCapacity = maximumObservedValue + 5; // A little extra buffer
    const numberOccurrenceTracker = new Array(sieveArrayCapacity).fill(0);

    // Populate the occurrence tracker with counts of each number from the input sequence.
    for (const numberValue of mainNumericSequence) {
        // Ensure the number is within the bounds of our tracking array before incrementing.
        if (numberValue >= 0 && numberValue < sieveArrayCapacity) {
            numberOccurrenceTracker[numberValue]++;
        } else {
            // Log a warning for numbers outside the expected range if necessary.
            // console.warn(`Skipping number ${numberValue} as it is out of bounds for the sieve array.`);
        }
    }

    // Apply the sieve mechanism: if a number `k` was present in the input,
    // mark all its multiples as 'sieved' (by setting their count to 0) in the tracker.
    // This process starts from `k=1` up to `maximumObservedValue`.
    let currentSieveDivisor = 1;
    while (currentSieveDivisor <= maximumObservedValue) {
        // Only proceed if `currentSieveDivisor` itself was found in the input.
        if (numberOccurrenceTracker[currentSieveDivisor] > 0) {
            // Iterate through multiples of `currentSieveDivisor`, starting from `2 * currentSieveDivisor`.
            let currentMultipleMarker = currentSieveDivisor * 2;
            while (currentMultipleMarker <= maximumObservedValue) {
                // Set the count of the multiple to zero, effectively removing it from consideration.
                numberOccurrenceTracker[currentMultipleMarker] = 0;
                currentMultipleMarker += currentSieveDivisor; // Move to the next multiple
            }
        }
        currentSieveDivisor++; // Advance to the next potential divisor
    }

    // Finally, count how many numbers in the tracker still have a count of 1.
    // These are the numbers that appeared exactly once AND were not sieved out
    // by any of their divisors that were also present in the input.
    let finalResultCount = 0;
    let countScanIndex = 1; // Start scanning from index 1.
    while (countScanIndex <= maximumObservedValue) {
        if (numberOccurrenceTracker[countScanIndex] === 1) {
            finalResultCount++;
        }
        countScanIndex++;
    }

    // Output the calculated result.
    console.log(finalResultCount);
}

// Prepare the input stream by splitting the raw data into individual tokens.
// Filters out any empty strings that might result from multiple delimiters.
let parsedInputTokens = programDataStream.split(/[\s\n]+/).filter(Boolean);

// Define the execution context object, bundling all necessary utilities.
const runtimeContext = {
    rawDataSource: programDataStream, // The original data string
    /**
     * Custom utility to extract and parse values from the token stream.
     * @param {number} requestedRows - Number of rows to retrieve.
     * @param {number} requestedColumns - Number of columns per row (default 1).
     * @param {boolean} convertToNumber - Whether to convert extracted tokens to numbers.
     * @returns {Array<number|string>} An array of extracted values.
     */
    valueRetriever: function(requestedRows = 1, requestedColumns = 1, convertToNumber = true) {
        // Guard against invalid fetch requests.
        if (requestedRows <= 0 || requestedColumns <= 0) {
            console.warn("Warning: Attempted to retrieve zero or negative rows/columns. Returning empty array.");
            return [];
        }

        const totalItemsToExtract = requestedRows * requestedColumns;

        // Ensure sufficient tokens are available.
        if (parsedInputTokens.length < totalItemsToExtract) {
            console.error(`Error: Insufficient input tokens. Expected ${totalItemsToExtract}, but only ${parsedInputTokens.length} available.`);
            // Return what's available to avoid crashing, but this indicates a problem.
            const partiallyExtracted = parsedInputTokens.splice(0, parsedInputTokens.length);
            return convertToNumber ? partiallyExtracted.map(val => Number(val) || 0) : partiallyExtracted;
        }

        // Extract the required number of tokens.
        let extractedValues = parsedInputTokens.splice(0, totalItemsToExtract);

        // Convert values to numbers if requested.
        if (convertToNumber) {
            extractedValues = extractedValues.map(token => {
                const numericValue = Number(token);
                // Basic validation for numeric conversion.
                if (isNaN(numericValue)) {
                    console.warn(`Warning: Non-numeric token '${token}' encountered during conversion. Defaulting to 0.`);
                    return 0; // Default to 0 or handle as an error
                }
                return numericValue;
            });
        }
        // For this specific problem, `valueRetriever` is always used to get a flat list,
        // so the complex `cols > 1` reshaping logic (present in the original `load` for general use)
        // is not essential and has been removed here to simplify and focus on the problem's requirements.
        return extractedValues;
    },
    // A generic data validation function (not strictly used by this problem's logic but good practice).
    dataValidator: function(data) {
        return data !== null && data !== undefined && data !== "";
    }
};

// Initiate the main processing flow using the prepared context.
processInputSequence(runtimeContext);