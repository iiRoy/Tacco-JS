// Function to perform summation of very large numbers provided as string-like inputs
function largeSummation(firstOperand, secondOperand) {
    // Converts the initial numeric values into reversed arrays of individual digits.
    // Example: 123 becomes [3, 2, 1]
    const firstDigits = (firstOperand + "").split("").reverse().map(parseInt);
    const secondDigits = (secondOperand + "").split("").reverse().map(parseInt);

    // This array will hold the digits of our resulting sum.
    const resultDigits = [];
    // Determine the maximum length among the two number strings to ensure all digits are processed.
    const maxLength = Math.max(firstDigits.length, secondDigits.length);

    // Initialize the result array with zeros. An extra slot is added for potential carry-overs.
    for (let idx = 0; idx < maxLength + 1; idx++) {
        resultDigits[idx] = 0;
    }

    // Iterates through each digit position, performing the primary addition.
    for (let idx = 0; idx < maxLength; idx++) {
        let currentSum = 0; // Reset sum for the current digit position.
        // Add digit from the first number if it exists at this position.
        if (firstDigits.length > idx) {
            currentSum += firstDigits[idx];
        }
        // Add digit from the second number if it exists at this position.
        if (secondDigits.length > idx) {
            currentSum += secondDigits[idx];
        }
        // Accumulate the current sum into the corresponding result digit, accounting for prior carries.
        resultDigits[idx] += currentSum;
    }

    // Process carries: if any digit position sums to 10 or more, carry over to the next position.
    for (let idx = 0; idx < maxLength; idx++) {
        if (resultDigits[idx] >= 10) {
            resultDigits[idx] -= 10; // Reduce current digit by 10.
            resultDigits[idx + 1]++; // Increment the next digit (this is the carry).
        }
    }

    // If the last digit (most significant) is zero, it means there was no carry to that position,
    // so it's a leading zero that should be removed (e.g., 012 becomes 12).
    if (resultDigits[resultDigits.length - 1] === 0) {
        resultDigits.pop();
    }

    // Reverse the digits back to their correct order and join them into a single string.
    const finalString = resultDigits.reverse().join("");
    return finalString; // Return the string representation of the computed sum.
}


// --- Main Program Logic Starts Here ---

// Read all input data from the standard input stream, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
const lineData = rawData.trim().split("\n");

// Discard the first line, which often contains count information not directly used here.
lineData.shift();

// Extract the next line, split it by spaces, and convert each part into an integer.
const firstNumSet = lineData.shift().split(" ").map(parseInt);
// Sort the first set of numbers in ascending numerical order.
firstNumSet.sort(function(valA, valB) {
    return valA - valB;
});

// Discard another line, likely a separator or another count.
lineData.shift();

// Extract and parse the second set of numbers similarly.
const secondNumSet = lineData.shift().split(" ").map(parseInt);

// Extract the array of strings that will be used for comparison.
const comparisonStrings = lineData.shift().split(" ");

// Initialize a memoization array (or lookup table) to store cumulative sums.
// It's pre-filled with 'false' to indicate uncomputed or non-existent sums.
const memoizedSums = [];
for (let indexVar = 0; indexVar <= 1000000; indexVar++) {
    memoizedSums[indexVar] = false;
}
// The sum for zero is defined as "0".
memoizedSums[0] = "0";

// Calculate cumulative sums for numbers in the first set and store them.
let runningTotal = "0"; // Initialize a string to hold the cumulative sum.
firstNumSet.forEach(function(currentVal) {
    // Use the large summation function to add the current value to the running total.
    runningTotal = largeSummation(runningTotal, currentVal);
    // Store the computed running total at the index corresponding to the current value.
    memoizedSums[currentVal] = runningTotal;
});

// Process each number in the second set.
secondNumSet.forEach(function(currentVal, currentIdx) {
    // Find the largest value less than or equal to 'currentVal' for which a sum has been memoized.
    while (true) {
        if (memoizedSums[currentVal] !== false) {
            break; // A memoized sum is found, exit the loop.
        }
        currentVal--; // Decrement 'currentVal' to look for a smaller, memoized sum.
    }

    // Default result indicator is "No".
    let resultIndicator = "No";

    // Compare the found memoized sum with the corresponding string from the comparison set.
    const currentComparison = comparisonStrings[currentIdx];
    const currentMemoized = memoizedSums[currentVal];

    if (currentComparison === currentMemoized) {
        resultIndicator = "Yes"; // If strings are identical, they are equal.
    } else if (currentComparison.length < currentMemoized.length) {
        resultIndicator = "Yes"; // If the comparison string is shorter, it's numerically smaller.
    } else if (currentComparison.length === currentMemoized.length) {
        // If lengths are equal, perform digit-by-digit comparison.
        for (let charIndex = 0; charIndex < currentComparison.length; charIndex++) {
            const compChar = parseInt(currentComparison[charIndex]);
            const memoChar = parseInt(currentMemoized[charIndex]);

            if (compChar === memoChar) {
                continue; // Digits are the same, check the next digit.
            } else if (compChar > memoChar) {
                resultIndicator = "No"; // Comparison string digit is larger, so it's numerically larger.
                break;
            } else if (compChar < memoChar) {
                resultIndicator = "Yes"; // Comparison string digit is smaller, so it's numerically smaller.
                break;
            }
        }
    }
    // Output the final comparison result for the current item.
    console.log(resultIndicator);
});