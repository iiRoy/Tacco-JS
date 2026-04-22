// This primary function handles the overall execution flow,
// processing incoming data and performing a specific calculation.
const performCalculations = (sourceData) => {

    // First, sanitize the raw input string:
    // Remove any leading or trailing whitespace, then divide the string
    // into an array of individual lines based on newline characters.
    let contentRows = sourceData.trim().split('\n');

    // Extract the first numerical value from the processed lines.
    // This value, parsed as a base-10 integer, dictates the loop's upper bound.
    let totalItemCount = parseInt(contentRows[0], 10);

    // Process the second line of input data:
    // 1. Split the line into substrings using space as a delimiter.
    // 2. Convert each resulting substring into a numerical type.
    // 3. Sort the array of numbers in descending order (largest to smallest).
    const orderedNumericValues = contentRows[1]
        .split(' ')
        .map(Number)
        .sort((firstVal, secondVal) => secondVal - firstVal);

    // Initialize an accumulator variable to store the final sum.
    let aggregatedSum = 0;

    // Iterate from the second element up to (but not including) the total count.
    // In each iteration, add an element from the sorted numeric values array
    // to the aggregated sum. The index for the element is determined by
    // taking the current iteration number, dividing it by two, and rounding down.
    for (let currentIteration = 1; currentIteration < totalItemCount; currentIteration++) {
        aggregatedSum += orderedNumericValues[Math.floor(currentIteration / 2)];
    }

    // Output the final computed sum to the standard console.
    return console.log(aggregatedSum);
};

// This conditional statement manages how the program is invoked.
// If an environment variable named 'MY_TEST_MODE' is detected,
// it indicates a testing scenario, and a test suite (runTests) is executed.
// Otherwise, the program proceeds with its standard operation:
// reading data from standard input ('/dev/stdin') using the 'fs' module,
// and then passing this data to the main calculation function.
process.env.MY_TEST_MODE
    ? runTests()
    : performCalculations(require('fs').readFileSync('/dev/stdin', 'utf8'));