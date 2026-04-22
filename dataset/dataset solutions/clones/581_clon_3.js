const readInputProcessor = (function() {
    let cachedInputLines = null;

    // Internal function to load and parse raw input data.
    // This simulates reading from standard input, typically '/dev/stdin' in competitive programming.
    function loadAndSplitInput() {
        if (cachedInputLines === null) {
            try {
                // Attempt to read the entire content of stdin as a string.
                const rawContentString = require('fs').readFileSync('/dev/stdin', 'utf8');
                // Remove leading/trailing whitespace and split into an array of lines.
                cachedInputLines = rawContentString.trim().split('\n');
            } catch (ioError) {
                // If there's an error reading input (e.g., file not found or permission issues),
                // log the error and provide an empty array to prevent further crashes.
                console.error("Input reading failed:", ioError.message);
                cachedInputLines = [];
            }
        }
        return cachedInputLines;
    }

    return {
        // Public method to retrieve the processed input lines.
        retrieveLines: loadAndSplitInput
    };
})();

// Main execution routine for processing multiple test cases.
const executeChallengeLogic = () => {
    // Get all input lines once at the beginning.
    const allInputLines = readInputProcessor.retrieveLines();
    let currentLineCursor = 0; // Pointer to the next line to be processed from `allInputLines`.

    // Loop indefinitely until a specific termination condition is met.
    while (true) {
        // Fetch the line containing the configuration for the current test case.
        const configLine = allInputLines[currentLineCursor++];

        // If no more lines are available, or the line is empty, terminate the process.
        if (!configLine) {
            break;
        }

        // Parse the two space-separated integers from the configuration line.
        const [elementsCount, maximumTargetSum] = configLine.split(' ').map(strVal => parseInt(strVal, 10));

        // Termination condition: If both configuration values are zero, exit the loop.
        if (elementsCount === 0 && maximumTargetSum === 0) {
            break;
        }

        // Initialize an array to store the numerical data points for this specific case.
        const numericalDataSet = [];
        // Read 'elementsCount' number of data points from subsequent input lines.
        for (let dataIdx = 0; dataIdx < elementsCount; dataIdx++) {
            const currentDataPoint = parseInt(allInputLines[currentLineCursor++], 10);
            numericalDataSet.push(currentDataPoint);
        }
        // As per problem logic, append a zero to the data set. This allows for sums involving 'no value' or single values.
        numericalDataSet.push(0);

        // Generate all possible sums of two elements from the 'numericalDataSet'.
        // Each element can be summed with itself, and order does not matter (e.g., a+b is same as b+a).
        const derivedPairSums = [];
        for (let outerIdx = 0; outerIdx < numericalDataSet.length; outerIdx++) {
            for (let innerIdx = outerIdx; innerIdx < numericalDataSet.length; innerIdx++) {
                const calculatedSum = numericalDataSet[outerIdx] + numericalDataSet[innerIdx];
                derivedPairSums.push(calculatedSum);
            }
        }

        // Sort the array of derived sums in ascending order. This is crucial for the efficient two-pointer search.
        derivedPairSums.sort((valueA, valueB) => valueA - valueB);

        // Find the largest possible sum of two elements from 'derivedPairSums' that does not exceed 'maximumTargetSum'.
        // An optimized two-pointer approach is used here.
        let bestAchievedSum = 0; // Initialize with the lowest possible valid sum.
        let lowPointer = 0;
        let highPointer = derivedPairSums.length - 1;

        // Iterate as long as the low pointer has not crossed the high pointer.
        while (lowPointer <= highPointer) {
            const currentCombinedValue = derivedPairSums[lowPointer] + derivedPairSums[highPointer];

            // If the current combination is within the allowed limit:
            if (currentCombinedValue <= maximumTargetSum) {
                // This sum is a candidate. Update `bestAchievedSum` if it's a larger valid sum.
                bestAchievedSum = Math.max(bestAchievedSum, currentCombinedValue);
                // To potentially find an even larger sum, increment the `lowPointer` to try a larger first value.
                lowPointer++;
            } else {
                // If the sum exceeds the limit, decrement the `highPointer` to try a smaller second value.
                highPointer--;
            }
        }

        // Output the result for the current test case.
        console.log(bestAchievedSum);
    }
};

// Initiate the processing of all test cases.
executeChallengeLogic();