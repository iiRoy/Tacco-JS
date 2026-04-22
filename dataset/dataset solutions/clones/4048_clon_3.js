const fileSystem = require("fs");

/**
 * Orchestrates the processing of input data from standard input
 * to calculate and display the number of coin combinations
 * that sum up to a target amount.
 */
function initiateCoinCombinationCalculation() {
    const inputFilePath = "/dev/stdin";
    const fileEncoding = "utf8";

    try {
        // Read the raw content from the specified input source
        const rawBufferContent = fileSystem.readFileSync(inputFilePath, fileEncoding);
        const textualInputData = rawBufferContent.toString();

        // Pass the processed string content to the core logic function
        analyzeCoinPossibilities(textualInputData);
    } catch (errorReadingFile) {
        // In case of an error reading the input, log it and exit gracefully.
        console.error("Failed to read input from stdin:", errorReadingFile.message);
        // Optionally, re-throw or handle more robustly.
        process.exit(1);
    }
}

/**
 * Parses the provided input string to extract coin limits and a target sum,
 * then computes the total number of unique combinations of 500-yen, 100-yen,
 * and 50-yen coins that precisely equal the target sum.
 *
 * @param {string} inputStringContent - A string containing four newline-separated
 *                                    integers: max 500-yen coins, max 100-yen coins,
 *                                    max 50-yen coins, and the target total amount.
 */
function analyzeCoinPossibilities(inputStringContent) {
    // Define the monetary values of the coins for better readability and maintainability.
    const YEN_VALUE_500 = 500;
    const YEN_VALUE_100 = 100;
    const YEN_VALUE_50 = 50;

    // Helper function to safely parse integer values from strings.
    const convertToInteger = (textValue) => {
        const parsed = parseInt(textValue, 10);
        // Basic validation: ensure parsed value is a number.
        if (isNaN(parsed)) {
            console.warn(`Warning: Could not parse '${textValue}' as an integer. Using 0.`);
            return 0; // Default or error handling
        }
        return parsed;
    };

    // Split the input string into individual lines, representing each parameter.
    const inputLinesArray = inputStringContent.split('\n');

    // Perform an initial check to ensure all expected input parameters are present.
    if (inputLinesArray.length < 4) {
        console.error("Input format error: Expected at least 4 lines of numerical data.");
        // Terminate execution or provide a default behavior.
        return;
    }

    // Extract and convert the maximum counts for each coin type and the target amount.
    const maximum500YenCoins = convertToInteger(inputLinesArray[0]);
    const maximum100YenCoins = convertToInteger(inputLinesArray[1]);
    const maximum50YenCoins = convertToInteger(inputLinesArray[2]);
    const desiredTotalAmount = convertToInteger(inputLinesArray[3]);

    // Optimization/Guard Clause: If the target amount is not a multiple of the smallest coin value,
    // it's impossible to form the sum using only these coins.
    if (desiredTotalAmount % YEN_VALUE_50 !== 0) {
        console.log(0); // No combinations possible.
        return;
    }

    let validCombinationCount = 0; // Initialize a counter for successful combinations.

    // Iterate through all possible quantities of 500-yen coins.
    for (let current500Count = 0; current500Count <= maximum500YenCoins; current500Count++) {
        const current500Total = current500Count * YEN_VALUE_500;

        // Early exit: If the current sum from 500-yen coins alone already exceeds the target,
        // further increments of 500-yen coins will also exceed it, so break this loop.
        if (current500Total > desiredTotalAmount) {
            break;
        }

        // Iterate through all possible quantities of 100-yen coins.
        for (let current100Count = 0; current100Count <= maximum100YenCoins; current100Count++) {
            const current100Total = current100Count * YEN_VALUE_100;
            const partialSum500_100 = current500Total + current100Total;

            // Early exit: If the sum from 500-yen and 100-yen coins already exceeds the target,
            // further increments of 100-yen coins will also exceed it.
            if (partialSum500_100 > desiredTotalAmount) {
                break;
            }

            // Iterate through all possible quantities of 50-yen coins.
            for (let current50Count = 0; current50Count <= maximum50YenCoins; current50Count++) {
                const current50Total = current50Count * YEN_VALUE_50;
                const grandTotal = partialSum500_100 + current50Total;

                // Check if the current combination of coins exactly matches the desired total amount.
                if (grandTotal === desiredTotalAmount) {
                    validCombinationCount++; // Increment the counter if a match is found.
                }

                // Optimization: If the grand total already exceeds the target,
                // there's no need to try more 50-yen coins for this 500/100 combination.
                if (grandTotal > desiredTotalAmount) {
                    break;
                }
            }
        }
    }

    // Output the final count of successful combinations.
    console.log(validCombinationCount);
}

// Execute the main process upon script invocation.
initiateCoinCombinationCalculation();