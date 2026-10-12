'use strict';

// This function processes the given input string to calculate a total expense.
const processInput = (rawData) => {
    // Split the raw input into individual lines.
    const lines = rawData.split('\n');

    // Parse the first line to get the number of items and the extra cost factor.
    const firstLineParts = lines[0].split(' ');
    const itemCount = parseInt(firstLineParts[0], 10);
    const extraCostFactor = parseInt(firstLineParts[1], 10);

    // Parse the second line for item values, taking only 'itemCount' elements.
    const itemValues = lines[1].split(' ').slice(0, itemCount);

    let totalExpense = 0; // Initialize the accumulated expense.
    let currentIndex = itemCount - 1; // Start processing from the last item.

    // Loop backwards through the items.
    while (currentIndex >= 0) {
        // Calculate the standard expense for the current individual item.
        totalExpense += 5 * itemValues[currentIndex] + 2 * extraCostFactor;

        let segmentLength = 1; // Initialize segment length for potential optimization.

        // Inner loop to check for optimized segment costs.
        while (currentIndex - segmentLength >= 0) {
            const currentSegmentValue = itemValues[currentIndex - segmentLength];
            const standardSegmentExpense = 5 * currentSegmentValue + 2 * extraCostFactor;

            // The original formula for testCost was simplified from (k+2)^2 * val - (k+1)^2 * val + X
            // which simplifies to (k^2 + 4k + 4 - (k^2 + 2k + 1)) * val + X
            // = (2k + 3) * val + X
            const optimizedSegmentExpense = (2 * segmentLength + 3) * currentSegmentValue + extraCostFactor;

            // If the standard cost is less than the optimized cost, stop extending the segment.
            if (standardSegmentExpense < optimizedSegmentExpense) {
                break;
            } else {
                // Otherwise, add the optimized cost and extend the segment.
                totalExpense += optimizedSegmentExpense;
                segmentLength++;
            }
        }
        // Move the current index back by the length of the processed segment.
        currentIndex -= segmentLength;
    }

    // Output the final calculated total expense.
    console.log(totalExpense);
};

// A flag to determine if the script is running in a test environment.
const isDevelopmentMode = false;

// Conditional execution based on the development mode flag.
if (isDevelopmentMode) {
    // Test cases for verification.
    processInput('2 100\n1 10');
    processInput('5 1\n1 999999997 999999998 999999999 1000000000');
    processInput('10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746');
    processInput('16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408');
} else {
    // In production, read input from standard input.
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
