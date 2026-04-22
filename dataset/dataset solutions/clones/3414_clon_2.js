let minRange = -1; // Initialize the variable to store the smallest difference found

// Acquire input from the standard input stream, interpret as UTF-8, and segment into lines
const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Extract the required subset length from the second component of the very first line
// The bitwise NOT operator '~~' is used here for efficient integer conversion
let subsetLength = ~~rawInputLines[0].split(' ')[1];

// Discard the initial line since it contains configuration data, not actual numeric entries
rawInputLines.shift();

// Convert the remaining string representations of numbers into actual numerical values
// and then arrange them in ascending order for easier processing
let numericDataPoints = rawInputLines.map(itemString => Number(itemString)).sort((valueA, valueB) => valueA - valueB);

// Traverse the sorted sequence to identify the minimal difference within any contiguous window of 'subsetLength' items
for (let windowStartIndex = 0; windowStartIndex <= numericDataPoints.length - subsetLength; windowStartIndex++) {
    // Compute the span (difference) between the largest and smallest elements within the current window
    const currentSpan = numericDataPoints[windowStartIndex + subsetLength - 1] - numericDataPoints[windowStartIndex];

    // If this is the inaugural span calculation, set it as the initial minimum range
    if (minRange === -1) {
        minRange = currentSpan;
    }
    // Otherwise, if the present span is smaller than the recorded minimum, update the minimum range
    else if (currentSpan < minRange) {
        minRange = currentSpan;
    }
}

// Display the ultimate minimum range determined
console.log(minRange);