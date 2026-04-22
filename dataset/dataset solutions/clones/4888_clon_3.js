// This module contains a primary function for processing raw input data to determine
// specific market insights, focusing on potential profit maximization within a sequence.
const processMarketData = (rawInputText) => {

    /**
     * @function parseStringTokens
     * @description Breaks down a single line of text into an array of string tokens.
     *              Whitespace at the start/end of the line is trimmed.
     * @param {string} textLine The string to be tokenized.
     * @returns {string[]} An array containing the individual string tokens.
     */
    const parseStringTokens = (textLine) => {
        // Using trim() ensures leading/trailing whitespace is removed before splitting.
        const stringElements = textLine.trim().split(" ");
        // Note: The original code had a redundant loop here; it's omitted for efficiency.
        return stringElements;
    };

    /**
     * @function parseNumericTokens
     * @description Converts a line of space-separated numeric strings into an array of numbers.
     *              Each token is parsed as an integer.
     * @param {string} textLine The string containing space-separated numbers.
     * @returns {number[]} An array of numerical values.
     */
    const parseNumericTokens = (textLine) => {
        const stringElements = parseStringTokens(textLine);
        // Map each string token to its integer representation.
        const numericElements = stringElements.map(element => parseInt(element, 10));
        return numericElements;
    };

    // Divide the entire input block into separate lines for easier processing.
    const allInputLines = rawInputText.split("\n");

    // Extracting the initial configuration parameters from the first line.
    const initialParameters = parseNumericTokens(allInputLines[0]);
    const dataPointCount = initialParameters[0]; // Corresponds to 'n' in the original problem.
    const operationAllowance = initialParameters[1]; // Corresponds to 't' in the original problem.

    // Extracting the series of values (e.g., stock prices) from the second line.
    const valueSeries = parseNumericTokens(allInputLines[1]); // Corresponds to 'a' in the original problem.

    // --- Core Algorithm for Maximum Profit Calculation ---

    // Initialize variables to track the highest profit found and how many times it occurred.
    let maxObservedProfit = 0; // The largest profit margin identified.
    let maxProfitOccurrenceCount = 0; // Number of times maxObservedProfit was achieved.

    // Early exit condition: If there are fewer than two data points, no transaction is possible.
    // A single point implies no buy-then-sell sequence, and zero points means no data.
    if (dataPointCount < 2) {
        console.log(0); // Output 0 as no profit can be made.
        return; // Terminate execution for this input.
    }

    // Initialize the lowest price encountered so far.
    // We assume the first value is the initial minimum for comparison.
    let lowestPriceSoFar = valueSeries[0];

    // Iterate through the value series, starting from the second element.
    // The goal is to find the maximum difference (profit) between a current value
    // and any preceding lowest value.
    for (let currentIdx = 1; currentIdx < dataPointCount; ++currentIdx) {
        const currentValue = valueSeries[currentIdx]; // The value at the current position.

        // Calculate the profit if we were to buy at 'lowestPriceSoFar' and sell at 'currentValue'.
        const potentialCurrentProfit = currentValue - lowestPriceSoFar;

        // Check if this potential profit is a new record.
        if (potentialCurrentProfit > maxObservedProfit) {
            maxObservedProfit = potentialCurrentProfit; // Update the highest profit.
            maxProfitOccurrenceCount = 1; // Reset count as a new highest profit was found.
        } else if (potentialCurrentProfit === maxObservedProfit && maxObservedProfit > 0) {
            // If the current potential profit matches the existing maximum profit,
            // and this profit is positive (i.e., a real gain), increment the counter.
            maxProfitOccurrenceCount++;
        }

        // Update 'lowestPriceSoFar' if the 'currentValue' is lower.
        // This maintains the minimum buying point encountered up to the current index.
        lowestPriceSoFar = Math.min(lowestPriceSoFar, currentValue);
    }

    // The final output is the lesser of the maximum profit occurrences
    // and half of the allowed operations (rounded down).
    const finalCalculatedResult = Math.min(maxProfitOccurrenceCount, Math.floor(operationAllowance / 2));
    console.log(finalCalculatedResult);
};

// Standard competitive programming environment setup for reading input from stdin.
processMarketData(require("fs").readFileSync("/dev/stdin", "utf8"));