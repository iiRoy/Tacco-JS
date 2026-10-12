function performLargeNumberAddition(firstNumStr, secondNumStr) {
    // Convert the input numbers (which can be strings or numbers) into arrays of digits.
    // The digits are reversed to facilitate addition from the least significant digit.
    let digitsOne = (firstNumStr + '').split('').reverse().map(Number);
    let digitsTwo = (secondNumStr + '').split('').reverse().map(Number);

    // This array will store the resulting digits of the sum.
    let resultDigits = [];
    // Determine the maximum length between the two numbers to ensure all digits are processed.
    let maximumLength = Math.max(digitsOne.length, digitsTwo.length);

    // Initialize the resultDigits array with zeros.
    // We add 1 to maximumLength to account for a potential carry-over to the highest place value.
    for (let k = 0; k < maximumLength + 1; k++) {
        resultDigits[k] = 0;
    }

    // Perform the initial digit-by-digit addition.
    // At this stage, carries are not yet handled, just the sum of corresponding digits.
    for (let k = 0; k < maximumLength; k++) {
        let currentDigitSum = 0;
        // Add digit from the first number if it exists at the current position.
        if (digitsOne.length > k) {
            currentDigitSum += digitsOne[k];
        }
        // Add digit from the second number if it exists at the current position.
        if (digitsTwo.length > k) {
            currentDigitSum += digitsTwo[k];
        }
        // Add the sum to the resultDigits array, potentially accumulating from previous carries.
        resultDigits[k] += currentDigitSum;
    }

    // Process carries from right to left (least significant to most significant).
    for (let k = 0; k < maximumLength; k++) {
        // If a digit position's value is 10 or more, a carry is needed.
        if (resultDigits[k] >= 10) {
            resultDigits[k] -= 10; // Keep only the unit digit.
            resultDigits[k + 1]++; // Increment the next digit position (carry over).
        }
    }

    // After all additions and carries, if the most significant digit is 0, it means there was no carry
    // to that position, so it should be removed (e.g., 0123 should be 123).
    if (resultDigits[resultDigits.length - 1] === 0) {
        resultDigits.pop();
    }

    // Reverse the digits back to their original order and join them to form the final sum string.
    let finalSumString = resultDigits.reverse().join('');
    return finalSumString;
}

// Read the entire input from standard input.
const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into an array of lines.
let dataLines = fileData.trim().split('\n');

// Remove the first line (often a count, not used in the core logic here).
dataLines.shift();

// Parse the first set of numbers from the next line, convert to numbers, and sort them ascending.
let firstSetOfNumbers = dataLines.shift().split(' ').map(Number);
firstSetOfNumbers.sort(function(valA, valB) {
    return valA - valB;
});

// Remove another line (likely a count, not used).
dataLines.shift();

// Parse the second set of numbers from the next line.
let secondSetOfNumbers = dataLines.shift().split(' ').map(Number);

// Parse the expected comparison results from the next line as strings.
let comparisonStrings = dataLines.shift().split(' ');

// Initialize a memoization table (or dynamic programming array) to store cumulative sums.
// The size is set to accommodate values up to 1,000,000 as per typical problem constraints.
let sumMemo = [];
for (let idx = 0; idx <= 1000000; idx++) {
    sumMemo[idx] = false; // 'false' indicates the sum for this index has not been computed yet.
}
sumMemo[0] = '0'; // Base case: the sum up to 0 is the string '0'.

// Initialize the running total for cumulative sums as a string.
let currentRunningSum = '0';

// Calculate cumulative sums for each number in the first set and store them in the memo table.
firstSetOfNumbers.forEach(function(currentNumber) {
    currentRunningSum = performLargeNumberAddition(currentRunningSum, currentNumber);
    sumMemo[currentNumber] = currentRunningSum;
});

// Process the second set of numbers, performing comparisons with the pre-calculated sums.
secondSetOfNumbers.forEach(function(currentValue, iterationIndex) {
    // Find the largest number less than or equal to 'currentValue' for which a sum has been memoized.
    while (true) {
        if (sumMemo[currentValue] !== false) {
            break; // A computed sum for 'currentValue' (or a smaller value) is found.
        }
        currentValue--; // Decrement 'currentValue' to look for a smaller pre-computed sum.
    }

    let resultVerdict = 'No'; // Default outcome for the comparison.

    // Compare the computed sum (sumMemo[currentValue]) with the expected string (comparisonStrings[iterationIndex]).
    // The comparison logic handles large numbers represented as strings.
    if (comparisonStrings[iterationIndex] === sumMemo[currentValue]) {
        // If the strings are exactly equal, the condition is met.
        resultVerdict = 'Yes';
    } else if (comparisonStrings[iterationIndex].length < sumMemo[currentValue].length) {
        // If the expected string is shorter than the computed sum string,
        // it implies the computed sum is numerically larger (assuming no leading zeros in the expected string).
        resultVerdict = 'Yes';
    } else if (comparisonStrings[iterationIndex].length === sumMemo[currentValue].length) {
        // If both strings have the same length, compare them digit by digit from left to right.
        for (let charPos = 0; charPos < comparisonStrings[iterationIndex].length; charPos++) {
            // Convert characters to numbers for proper numerical comparison.
            const expectedDigit = comparisonStrings[iterationIndex][charPos] - 0;
            const computedDigit = sumMemo[currentValue][charPos] - 0;

            if (expectedDigit === computedDigit) {
                continue; // Digits are the same, move to the next position.
            } else if (expectedDigit > computedDigit) {
                // If an expected digit is greater, the expected number is larger, so the condition is 'No'.
                resultVerdict = 'No';
                break;
            } else if (expectedDigit < computedDigit) {
                // If an expected digit is smaller, the computed sum is larger, so the condition is 'Yes'.
                resultVerdict = 'Yes';
                break;
            }
        }
    }
    // Output the final verdict for the current comparison.
    console.log(resultVerdict);
});
