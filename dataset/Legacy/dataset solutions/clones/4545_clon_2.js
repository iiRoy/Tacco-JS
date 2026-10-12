// This script processes a list of numbers to calculate a specific sum based on their properties.
function ProcessInput(rawData) {
    // Split the entire input string into individual lines.
    let processedLines = rawData.split("\n");

    // Extract the first line, which contains the count of subsequent numbers.
    let firstLineParts = processedLines[0].split(" ");
    let itemCount = parseInt(firstLineParts[0], 10); // Parse the number of items.

    // Initialize an array of arrays to group numbers based on a specific criterion.
    let groupedItems = new Array(10);
    // Initialize variables for calculations.
    let currentValue = 0;
    let totalSum = 0;
    let smallestNonZeroUnit = 1000; // A sufficiently large initial value for finding minimum.

    // Populate the groupedItems array with empty sub-arrays.
    for (let idx = 0; idx < groupedItems.length; idx++) {
        groupedItems[idx] = [];
    }

    // Iterate through the input numbers, starting from the second line.
    for (let idx = 0; idx < itemCount; idx++) {
        currentValue = parseInt(processedLines[idx + 1], 10); // Convert line to integer.
        totalSum += currentValue; // Add to the running total.

        // Find the smallest number that does not end in zero.
        if (currentValue < smallestNonZeroUnit && currentValue % 10 !== 0) {
            smallestNonZeroUnit = currentValue;
        }

        // The original code's logic for grouping: it uses the second character of the string representation.
        // This is a direct replication of the original behavior, even if it seems unusual.
        for (let digitIndex = 0; digitIndex < 10; digitIndex++) {
            // Compare the second character of the input string with the current digit index.
            // Note: This will only match if the character is '0' and digitIndex is 0, due to type coercion rules (char '0' == num 0 is true).
            // For other digits, '1' == 1 is false, '2' == 2 is false, etc.
            if (processedLines[idx + 1][1] == digitIndex) {
                groupedItems[digitIndex].push(currentValue);
            }
        }
    }

    // Determine the final output based on the total sum.
    if (totalSum % 10 !== 0) {
        console.log(totalSum); // If sum doesn't end in 0, print it directly.
    } else {
        // If the sum ends in 0, check a specific condition related to grouped items.
        // This condition checks if all numbers had '0' as their second character (due to the peculiar grouping logic).
        if (groupedItems[0].length === itemCount) {
            console.log(0); // If all items were grouped into '0', print 0.
        } else {
            // Otherwise, subtract the smallest non-zero-ending number from the total sum.
            console.log(totalSum - smallestNonZeroUnit);
        }
    }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
