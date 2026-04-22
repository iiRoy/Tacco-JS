// This script processes numerical data from standard input to find specific subarray properties.
const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// An immediately invoked function expression (IIFE) to encapsulate the processing logic.
(function(rawInputString) {
    // Basic input validation: ensure the input string is not empty.
    if (!rawInputString || rawInputString.trim() === '') {
        console.error("Error: Empty input received.");
        return; // Exit if no data
    }

    // Split the raw input into individual textual rows.
    const textLines = rawInputString.trim().split('\n');

    // Extract the total number of elements from the first line.
    // Use parseInt with radix for robust conversion.
    const totalElements = parseInt(textLines[0], 10);

    // Validate the parsed number of elements.
    if (isNaN(totalElements) || totalElements <= 0) {
        console.error("Error: Invalid or non-positive element count provided.");
        return;
    }

    // Parse the second line into an array of numbers.
    // Ensure sufficient lines exist before attempting to access.
    if (textLines.length < 2) {
        console.error("Error: Missing data array in input.");
        return;
    }
    const valueList = textLines[1].split(' ').map(val => parseInt(val, 10));

    // Basic validation for the numeric array.
    if (valueList.some(isNaN) || valueList.length !== totalElements) {
        console.error("Error: Data array contains non-numeric values or its length does not match specified count.");
        return;
    }

    // Initialize a variable to accumulate the total count of matching subarrays.
    let cumulativeMatchCount = 0;

    // Iterate through all possible starting positions for subarrays.
    // This is the outer loop, determining the beginning of each window.
    for (let startPosition = 0; startPosition < totalElements; startPosition++) {
        let currentWindowSum = 0;  // Accumulator for the sum of elements in the current window.
        let currentWindowXor = 0;  // Accumulator for the XOR sum of elements in the current window.
        let validPrefixLength = 0; // Counts how many prefixes from 'startPosition' satisfy the condition.

        // Inner loop: extend the current window one element at a time from 'startPosition'.
        // 'windowOffset' represents the position relative to 'startPosition'.
        for (let windowOffset = 0; startPosition + windowOffset < totalElements; windowOffset++) {
            // Get the current element from the main array.
            const currentElementValue = valueList[startPosition + windowOffset];

            // Update the running sum and XOR sum for the current sub-array.
            currentWindowSum += currentElementValue;
            currentWindowXor ^= currentElementValue;

            // Check if the accumulated sum equals the accumulated XOR sum for the current prefix.
            if (currentWindowSum === currentWindowXor) {
                validPrefixLength++; // If they match, this prefix is valid.
            } else {
                // If they don't match, any further extension of *this specific prefix*
                // starting at 'startPosition' will also not satisfy the condition.
                // So, we can break out of this inner loop for the current 'startPosition'.
                break;
            }
        }
        // Add the count of valid prefixes found for the current 'startPosition' to the total.
        cumulativeMatchCount += validPrefixLength;
    }

    // Output the final computed result.
    console.log(cumulativeMatchCount);

})(dataSource); // Pass the raw data string to the IIFE.