// This function processes raw input data to calculate a specific count based on a numerical limit.
function processInput(rawData) {
    // Extract the primary numerical limit from the first line of the input string.
    // The base 10 is explicitly specified for parsing.
    const limitValue = parseInt(rawData.split('\n')[0], 10);

    // Initialize a counter for pairs that satisfy the given condition.
    let countOfPairs = 0;

    // Begin iterating through possible first factors, starting from the limit value
    // and decrementing down to 1 (inclusive).
    for (let firstFactor = limitValue; firstFactor > 0; firstFactor--) {
        // For each first factor, iterate through possible second factors,
        // also descending from the limit value down to 1 (inclusive).
        for (let secondFactor = limitValue; secondFactor > 0; secondFactor--) {
            // Check if the product of the current firstFactor and secondFactor
            // is strictly less than the overall limitValue.
            if (firstFactor * secondFactor < limitValue) {
                // If the condition is met, increment our pair counter.
                countOfPairs++;
            }
        }
    }

    // Output the final calculated count of pairs to the standard console.
    console.log(countOfPairs);
}

// Read the entire content from standard input as a UTF-8 string
// and then pass it to our processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
