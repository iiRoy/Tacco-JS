function* inputGenerator() {
    // Reads the entire content from standard input, decodes it as UTF-8,
    // trims leading/trailing whitespace, and splits it into tokens
    // based on newlines or spaces.
    const inputData = require("fs").readFileSync("/dev/stdin", "utf-8").trim().split(/\n|\s/);
    // Yields each token from the processed input data.
    yield* inputData;
}

// Utility function to retrieve a specified number of items from an iterator.
function fetchMultiple(numItems, iteratorInstance) {
    // Determines which iterator to use:
    // 1. The one explicitly passed as 'iteratorInstance'.
    // 2. The 'iter' property of the current 'this' context.
    // 3. A newly created 'inputGenerator' instance, which is then stored on 'this.iter'.
    const currentIterator = iteratorInstance || this.iter || (this.iter = inputGenerator());
    const resultArray = []; // An array to store the collected items.

    // Loop to fetch 'numItems' values from the iterator.
    for (let idx = 0; idx < numItems; idx += 1) {
        resultArray.push(currentIterator.next().value); // Retrieves the next value and adds it to the array.
    }
    return resultArray; // Returns the array containing the fetched items.
}

// Main execution block wrapped in an Immediately Invoked Function Expression (IIFE).
(function() {
    // Reads the first input value, parses it as an integer, and destructures it into 'upperBound'.
    const [ upperBound ] = fetchMultiple(1).map(itemStr => parseInt(itemStr));

    // Outputs a starting message to the console.
    console.log('start');

    let totalSum = 0; // Initializes a variable to accumulate the final sum.

    // Outer loop iterates from 1 up to 'upperBound' (inclusive).
    for (let currentNum = 1; currentNum <= upperBound; currentNum += 1) {
        let divisorCount = 0; // Counter for the number of divisors of 'currentNum'.

        // Inner loop iterates from 1 up to the square root of 'currentNum'
        // to find its divisors efficiently.
        for (let divisorCandidate = 1; divisorCandidate ** 2 <= currentNum; divisorCandidate += 1) {
            // If 'divisorCandidate' divides 'currentNum' evenly, it's a divisor.
            if (currentNum % divisorCandidate == 0) {
                divisorCount += 1;
            }
        }

        // Each divisor 'd' less than sqrt(currentNum) has a corresponding divisor 'currentNum / d'.
        // So, we multiply the count by 2.
        divisorCount *= 2;

        // If 'currentNum' is a perfect square, its square root was counted only once
        // in the inner loop (e.g., for 9, 3 is counted once).
        // Since 'currentNum / sqrt(currentNum)' is also sqrt(currentNum), it's effectively
        // counted twice by the `divisorCount *= 2` step. We subtract 1 to correct this.
        if (Number.isInteger(Math.sqrt(currentNum))) {
            divisorCount -= 1;
        }

        // Special case for the number 1: it has only one divisor (itself).
        // The general logic might yield 2 (1*2 - 0 or 1*2 - 1 depending on exact sqrt(1) handling).
        // Explicitly set to 1 for 'currentNum' equal to 1.
        if (currentNum == 1) {
            divisorCount = 1;
        }

        // Adds the product of 'currentNum' and its 'divisorCount' to the 'totalSum'.
        totalSum += currentNum * divisorCount;
    }

    // Outputs the final calculated sum to the console.
    console.log(totalSum);
})();
