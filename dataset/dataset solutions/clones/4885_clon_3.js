// This module processes raw input data to determine optimal trading opportunities.
// It calculates the maximum profit achievable and the number of times this maximum profit occurs,
// subject to an external time constraint.
function processData(rawData) {

    /**
     * Helper function to parse a line of space-separated numeric values.
     * It trims leading/trailing whitespace, splits the string into segments,
     * filters out any empty segments (e.g., from multiple spaces),
     * and converts each valid segment to a number.
     * @param {string} lineContent - The string line to be parsed.
     * @returns {number[]} An array of numbers extracted from the line.
     */
    const extractNumericSequence = (lineContent) => {
        // Remove leading/trailing whitespace, split by single spaces,
        // then filter out any resultant empty strings and convert to numbers.
        return lineContent.trim()
                          .split(" ")
                          .filter(segment => segment !== '') // Remove empty strings due to multiple spaces
                          .map(Number); // Convert each non-empty segment to a number
    };

    /**
     * Utility function to determine the lesser of two given values.
     * This serves as a custom alternative to Math.min for demonstration.
     * @param {number} valueA - The first number.
     * @param {number} valueB - The second number.
     * @returns {number} The smaller of the two input numbers.
     */
    const determineLesserValue = (valueA, valueB) => {
        return (valueA <= valueB) ? valueA : valueB;
    };

    // Split the entire raw input string into individual lines.
    // The first line typically contains general parameters, and subsequent lines hold data series.
    const inputLines = rawData.split("\n");

    // Essential validation: ensure we have at least two lines for parameters and data.
    if (inputLines.length < 2) {
        // If input is malformed or incomplete, log an error and terminate execution.
        console.error("Input data is insufficient. Expected a minimum of two lines.");
        return;
    }

    // Parse the first line to extract the total number of elements and the time limit.
    const firstLineParameters = extractNumericSequence(inputLines[0]);
    // Using array destructuring to assign parsed values to descriptive constants.
    const [totalElements, timeConstraint] = firstLineParameters;

    // Parse the second line to obtain the array of price data points.
    const priceDataSeries = extractNumericSequence(inputLines[1]);

    // Initialize variables to keep track of the highest profit identified so far
    // and the number of distinct scenarios where this maximum profit was achieved.
    let maxObservedProfit = 0;
    let maxProfitOccurrenceCount = 0;

    // Handle edge case: if there are no elements to process, output 0 and exit.
    if (totalElements === 0 || priceDataSeries.length === 0) {
        console.log(0);
        return;
    }

    // Initialize the minimum price encountered up to the current point in the data series.
    // Assumes priceDataSeries is not empty based on the totalElements check.
    let currentLowestPrice = priceDataSeries[0];

    // Iterate through each price point in the data series.
    // The loop runs 'totalElements' times, covering all indices from 0 to 'totalElements - 1'.
    for (let dataIndex = 0; dataIndex < totalElements; ++dataIndex) {
        const currentPricePoint = priceDataSeries[dataIndex];

        // Calculate the potential profit if an item were bought at 'currentLowestPrice'
        // and sold at 'currentPricePoint'.
        const calculatedPotentialProfit = currentPricePoint - currentLowestPrice;

        // Compare the 'calculatedPotentialProfit' with the 'maxObservedProfit'.
        if (calculatedPotentialProfit > maxObservedProfit) {
            maxObservedProfit = calculatedPotentialProfit; // A new maximum profit is found.
            maxProfitOccurrenceCount = 1;                   // Reset count for the new maximum.
        } else if (calculatedPotentialProfit === maxObservedProfit) {
            maxProfitOccurrenceCount++;                     // Increment count if profit matches the current maximum.
        }

        // Update 'currentLowestPrice' if the 'currentPricePoint' is lower.
        // This ensures 'currentLowestPrice' always holds the minimum value encountered up to 'dataIndex'.
        currentLowestPrice = determineLesserValue(currentPricePoint, currentLowestPrice);
    }

    // Determine the effective upper limit for the number of scenarios based on the 'timeConstraint'.
    // Using a bitwise OR with 0 as an alternative to Math.floor for integer truncation.
    const constrainedScenarioLimit = (timeConstraint / 2) | 0;

    // The final result is the minimum of the actual profit occurrences and the imposed scenario limit.
    const finalResult = determineLesserValue(maxProfitOccurrenceCount, constrainedScenarioLimit);

    console.log(finalResult);
}

// The following line is standard boilerplate for competitive programming environments
// that read input from stdin and should typically remain untouched.
// It reads the entire standard input as a UTF-8 string and passes it to the main processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));