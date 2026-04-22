let receivedInputLines = []; // A dynamic array to accumulate all input lines from the standard input.
const ioModule = require('readline'); // Import the 'readline' module for stream processing.

// Configure the interface for reading input line by line.
const ioInterface = ioModule.createInterface({
    input: process.stdin,  // Use standard input as the source.
    output: process.stdout // Standard output (primarily for internal use by readline, not for this problem's output).
});

// Attach an event listener for each line of data received.
ioInterface.on('line', (inputLineContent) => {
    receivedInputLines.push(inputLineContent); // Store the current line of text in our buffer.
});

// Attach an event listener for when the input stream is fully closed.
ioInterface.on('close', () => {
    // --- Input Validation and Parsing ---
    // If no input lines were received, there's nothing to process.
    if (receivedInputLines.length === 0) {
        console.log(0); // A sensible default or error condition for empty input.
        return;
    }

    // The first line contains two space-separated integers: N (total items) and K (window size).
    const firstLineData = receivedInputLines[0].split(" ").map(Number);
    const numTotalItems = firstLineData[0]; // Represents the count of actual data points.
    const windowSize = firstLineData[1];    // Represents the size of the contiguous sub-array to consider.

    // --- Early Exit Conditions for Window Size ---
    // If the window size is non-positive, the difference is conceptually zero or undefined.
    if (windowSize <= 0) {
        console.log(0);
        return;
    }
    // If the window size is 1, the difference between the largest and smallest in that window is always 0.
    if (windowSize === 1) {
        console.log(0);
        return;
    }

    // --- Data Extraction and Transformation ---
    // Extract the actual numeric data points, starting from the second line of input.
    // Use parseFloat to convert string representations to numbers.
    let numericDataPoints = receivedInputLines.slice(1).map(itemString => parseFloat(itemString));

    // A crucial guard: if there aren't enough data points to form even one window of the specified size.
    if (numericDataPoints.length < windowSize) {
        console.log(0); // No valid window can be formed, so the minimum difference is effectively 0.
        return;
    }

    // --- Core Logic: Sorting and Sliding Window ---
    // Sort the array of numeric data points in ascending order.
    // This allows us to find the min/max in any window simply by looking at its start and end.
    numericDataPoints.sort((valA, valB) => valA - valB);

    // Initialize a variable to store the smallest difference found so far.
    // We start with the largest possible safe integer value as an upper bound.
    let optimalGap = Number.MAX_SAFE_INTEGER;

    // Iterate through the sorted array using a sliding window.
    // The loop continues as long as a full window of 'windowSize' elements can be formed.
    for (let currentWindowStartIdx = 0; currentWindowStartIdx <= numericDataPoints.length - windowSize; ++currentWindowStartIdx) {
        // Determine the index of the last element within the current window.
        const currentWindowEndIdx = currentWindowStartIdx + windowSize - 1;

        // Calculate the difference between the largest and smallest elements in the current window.
        // Since the array is sorted, these correspond to the window's end and start elements.
        const currentWindowSpread = numericDataPoints[currentWindowEndIdx] - numericDataPoints[currentWindowStartIdx];

        // Update our 'optimalGap' if the current window's spread is smaller than the previously recorded minimum.
        optimalGap = Math.min(optimalGap, currentWindowSpread);
    }

    // --- Output Result ---
    // Display the final minimum difference found across all valid windows.
    console.log(optimalGap);
});