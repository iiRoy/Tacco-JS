// Global buffer for accumulating incoming data from standard input.
let receivedDataAccumulator = '';

// Configure standard input stream.
process.stdin.resume(); // Ensure the stdin stream is active.
process.stdin.setEncoding('utf8'); // Set character encoding for input.

// Event listener for incoming data chunks.
process.stdin.on('data', function (incomingSegment) {
    receivedDataAccumulator += incomingSegment; // Append the new data to the buffer.
});

// Event listener for the end of the input stream.
process.stdin.on('end', function () {
    // Trim whitespace, then split the accumulated data into an array of lines.
    const parsedInputLines = receivedDataAccumulator.trim().split('\n');
    // Initiate the primary processing logic with the prepared input.
    executeMainProcessing(parsedInputLines);
});

/**
 * Custom comparison function to sort numbers in descending order.
 * This ensures the largest number comes first.
 * @param {number} num1 - The first number for comparison.
 * @param {number} num2 - The second number for comparison.
 * @returns {number} A negative value if num1 > num2, positive if num1 < num2, zero if equal.
 */
const numericDescendingComparator = (num1, num2) => num2 - num1;

/**
 * Main function to process an array of input lines.
 * It expects the first line to be the count of test cases,
 * and subsequent lines to contain three space-separated numbers.
 * @param {string[]} dataLines - An array where each element is a line of input.
 */
function executeMainProcessing(dataLines) {
    // Guard clause for empty input.
    if (!dataLines || dataLines.length === 0) {
        console.error("No input data provided. Exiting.");
        return;
    }

    // Attempt to parse the first line as the total number of test cases.
    const totalCaseCountString = dataLines[0];
    const totalCasesExpected = parseInt(totalCaseCountString, 10);

    // Validate the parsed count.
    if (isNaN(totalCasesExpected) || totalCasesExpected <= 0 || totalCasesExpected > 1000) {
        console.error(`Invalid or out-of-range test case count: ${totalCaseCountString}. Must be between 1 and 1000.`);
        return; // Exit if the count is invalid.
    }

    // Iterate through the data lines, starting from the second line (index 1).
    // Each line represents a set of numbers to be checked.
    for (let currentLineIdx = 1; currentLineIdx < dataLines.length; currentLineIdx++) {
        const rawLineEntry = dataLines[currentLineIdx];

        // Skip empty lines that might appear due to extra newlines.
        if (!rawLineEntry.trim()) {
            continue;
        }

        // Split the line into string parts and convert them to numbers.
        const stringComponents = rawLineEntry.split(' ');
        const numericalSet = stringComponents.map(str => parseInt(str.trim(), 10));

        // Basic validation for the number of components and their numeric nature.
        if (numericalSet.length !== 3 || numericalSet.some(isNaN)) {
            console.error(`Skipping malformed line: "${rawLineEntry}". Expected 3 numbers.`);
            continue; // Move to the next line if this one is invalid.
        }

        // Validate individual number values.
        // All numbers must be within the range [0, 1000].
        if (numericalSet.some(val => val < 0 || val > 1000)) {
            console.error(`Skipping line with out-of-range values: "${rawLineEntry}". Numbers must be between 0 and 1000.`);
            continue; // Move to the next line.
        }

        // Sort the numbers in descending order to easily identify the largest.
        // The comparator function ensures a > b > c order.
        numericalSet.sort(numericDescendingComparator);

        // Assign sorted values to descriptive variables.
        const hypotenuseCandidate = numericalSet[0]; // Largest number
        const leg1 = numericalSet[1];
        const leg2 = numericalSet[2];

        // Calculate squares using multiplication instead of Math.pow for minor performance/style.
        const squareOfHypotenuse = hypotenuseCandidate * hypotenuseCandidate;
        const sumOfSquaresOfLegs = (leg1 * leg1) + (leg2 * leg2);

        // Check if the Pythagorean theorem holds true for the given set of numbers.
        // This determines if they form a right-angled triangle.
        if (squareOfHypotenuse === sumOfSquaresOfLegs) {
            console.log('YES'); // Indicate a Pythagorean triple.
        } else {
            console.log('NO');  // Indicate not a Pythagorean triple.
        }
    }
}