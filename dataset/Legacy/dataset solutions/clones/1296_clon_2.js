let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input stream

const lineArray = rawData.trim().split('\n'); // Process raw data: remove leading/trailing whitespace and split into an array of lines

// Iterate over each line of processed input
for (let lineIndex = 0; lineIndex < lineArray.length; lineIndex++) {
    // Parse the current line into an array of numbers
    const numPair = lineArray[lineIndex].split(' ').map(Number);

    let upperBound = numPair[0]; // Extract the first number as the upper limit (n)
    let targetSum = numPair[1];  // Extract the second number as the desired sum (x)

    // Check for the termination condition (n=0 and x=0)
    if (upperBound === 0 && targetSum === 0) {
        break; // Exit the loop if the termination condition is met
    }

    let combinationCount = 0; // Initialize a counter for valid combinations of three distinct numbers

    // First loop: iterate for the first number (i) from 1 up to 'upperBound'
    for (let firstNum = 1; firstNum <= upperBound; firstNum++) {
        // Second loop: iterate for the second number (j) from 'firstNum + 1' up to 'upperBound'
        // This ensures j > i and all numbers are distinct
        for (let secondNum = firstNum + 1; secondNum <= upperBound; secondNum++) {
            // Optimization: If the sum of the first two numbers already equals or exceeds the target sum,
            // any larger 'secondNum' will also exceed it, so break this inner loop.
            if (firstNum + secondNum >= targetSum) {
                break;
            }

            // Calculate the required third number (k) to reach the 'targetSum'
            const thirdNum = targetSum - (firstNum + secondNum);

            // Check if the calculated 'thirdNum' is valid:
            // 1. It must be greater than 'secondNum' (to ensure distinctness and i < j < k)
            // 2. It must be within the allowed range (1 to 'upperBound')
            if (thirdNum > secondNum && thirdNum <= upperBound) {
                combinationCount++; // Increment the counter if a valid triplet (i, j, k) is found
            }
        }
    }
    console.log(combinationCount); // Output the total count of valid combinations for the current input line
}
