(function (rawData) {
    // This function processes input data to find the maximum sum of a contiguous sub-array.

    // Prepare input lines by removing carriage returns and splitting by newline.
    let processedLines = rawData.replace(/\r/g, '').split("\n");

    // Declare variables for loop indices, counts, temporary values, and results.
    let tempVal, idx, countElements, windowSize, numberSequence, currentTotal, windowTotals, greatestTotal;

    // Main processing loop: continues until a specific termination condition is met.
    while (true) {
        // Initialize arrays for each new test case.
        numberSequence = [];
        windowTotals = [];

        // Read the first line of the current test case, which contains N and K.
        tempVal = processedLines.shift().split(' ');
        countElements = parseInt(tempVal[0]); // N: total number of elements in the sequence.
        windowSize = parseInt(tempVal[1]);   // K: size of the sliding window.

        // Check for the termination condition (N=0 and K=0).
        if (countElements === 0 && windowSize === 0) {
            break; // Exit the loop if N and K are both zero.
        }

        // Read the N elements of the number sequence.
        for (idx = 0; idx < countElements; idx++) {
            tempVal = parseInt(processedLines.shift()); // Parse each element as an integer.
            numberSequence.push(tempVal);               // Add the element to the sequence array.
        }

        // Calculate the sum for each sliding window of size K.
        for (idx = 0; idx <= countElements - windowSize; idx++) {
            currentTotal = 0; // Reset sum for the current window.

            // Extract the sub-array for the current window and sum its elements.
            numberSequence.slice(idx, idx + windowSize).forEach(function (elementValue) {
                currentTotal += elementValue; // Accumulate the sum.
            });
            windowTotals.push(currentTotal); // Store the sum of the current window.
        }

        // Find the maximum sum among all calculated window totals.
        greatestTotal = windowTotals.shift(); // Initialize max with the first window total.

        // Iterate through the remaining window totals to find the largest.
        windowTotals.forEach(function (currentSum) {
            if (currentSum > greatestTotal) {
                greatestTotal = currentSum; // Update greatestTotal if a larger sum is found.
            }
        });

        // Output the maximum sum for the current test case.
        console.log(greatestTotal);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input using Node.js 'fs' module.
