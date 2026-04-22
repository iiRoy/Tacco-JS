// Function to add two very large numbers represented as strings.
// This handles arbitrary precision addition by processing digit by digit.
function stringNumericAddition(firstOperandStr, secondOperandStr) {
    // Ensure inputs are treated as strings for consistent processing.
    const numStrA = String(firstOperandStr);
    const numStrB = String(secondOperandStr);

    // Convert string representations of numbers into arrays of digits.
    // The digits are stored in reverse order (least significant first) for easier arithmetic.
    // Example: "123" becomes [3, 2, 1] after this transformation.
    const digitsArrayA = numStrA.split('').reverse().map(digitChar => parseInt(digitChar, 10));
    const digitsArrayB = numStrB.split('').reverse().map(digitChar => parseInt(digitChar, 10));

    // Determine the maximum length among the two digit arrays to ensure all digits are processed.
    const maxLength = Math.max(digitsArrayA.length, digitsArrayB.length);
    
    const sumResultDigits = []; // This array will store the digits of the final sum.
    let currentCarry = 0; // Initialize the carry-over value for addition.

    // Iterate through the digits, performing addition column by column, from right to left.
    // The loop continues as long as there are digits to process or a carry-over exists.
    for (let digitIndex = 0; digitIndex < maxLength || currentCarry > 0; digitIndex++) {
        // Retrieve the digit from each number at the current index. Default to 0 if no more digits.
        const digitValFromA = (digitIndex < digitsArrayA.length) ? digitsArrayA[digitIndex] : 0;
        const digitValFromB = (digitIndex < digitsArrayB.length) ? digitsArrayB[digitIndex] : 0;

        // Calculate the sum for the current column, including any carry from the previous column.
        let currentColumnSum = digitValFromA + digitValFromB + currentCarry;

        // The digit to be stored in the result is the remainder when divided by 10.
        sumResultDigits.push(currentColumnSum % 10);
        // The new carry-over is the quotient when divided by 10.
        currentCarry = Math.floor(currentColumnSum / 10);
    }

    // After all additions, remove any trailing zeros if the number is not just "0" itself.
    // This accounts for cases like 0 + 0 = 0, or if a carry resulted in an extra 0.
    // Since digits are reversed, the last element in sumResultDigits is the most significant digit.
    while (sumResultDigits.length > 1 && sumResultDigits[sumResultDigits.length - 1] === 0) {
        sumResultDigits.pop();
    }

    // Reverse the digits back to their correct order and join them into a single string.
    return sumResultDigits.reverse().join('');
}

// Helper function for comparing two large numbers represented as strings.
// Returns:
//   -1 if num1Str is numerically less than num2Str
//    0 if num1Str is numerically equal to num2Str
//    1 if num1Str is numerically greater than num2Str
function compareLargeNumberStrings(num1Str, num2Str) {
    // Ensure inputs are treated as strings for robust comparison.
    const s1 = String(num1Str);
    const s2 = String(num2Str);

    // First, compare by length. A longer number string (without leading zeros) is larger.
    if (s1.length < s2.length) return -1;
    if (s1.length > s2.length) return 1;

    // If lengths are equal, compare character by character from left to right (most significant digit first).
    for (let charIdx = 0; charIdx < s1.length; charIdx++) {
        // Convert character digits to numbers for direct comparison.
        const digitVal1 = parseInt(s1[charIdx], 10);
        const digitVal2 = parseInt(s2[charIdx], 10);

        if (digitVal1 < digitVal2) return -1;
        if (digitVal1 > digitVal2) return 1;
    }
    // If all digits are identical and lengths are equal, the numbers are equal.
    return 0;
}

// Main program execution block.
// This section reads input, processes data, and outputs results.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input content into an array of individual lines, trimming any extraneous whitespace.
const inputLinesArray = rawInputContent.trim().split('\n');

// The problem format usually includes metadata lines that need to be discarded.
// Discard the first line (often a count 'N', which is not explicitly used here).
inputLinesArray.shift(); 

// Parse the second line to get the primary set of numbers.
// These are space-separated, converted to actual Number types.
const primarySortedValues = inputLinesArray.shift().split(' ').map(Number);
// Sorting these values is critical for the prefix sum calculation that follows.
primarySortedValues.sort((valA, valB) => valA - valB);

// Discard the third line, another metadata line.
inputLinesArray.shift(); 

// Parse the fourth line for the query numbers.
const queryNumbers = inputLinesArray.shift().split(' ').map(Number);

// Parse the fifth line for the target comparison strings.
// These are kept as strings because they represent potentially large numbers.
const targetResultStrings = inputLinesArray.shift().split(' ');

// Initialize a cache (sparse array) to store memoized cumulative sums.
// The maximum possible index for a value is 1,000,000.
// Using `null` as a sentinel to indicate that a sum for a particular index has not yet been computed.
const MAXIMUM_INDEX_FOR_CACHE = 1000000;
const memoizedPrefixSumsCache = new Array(MAXIMUM_INDEX_FOR_CACHE + 1).fill(null);

// Initialize the cumulative sum for the 'zero' index.
// This is crucial because `stringNumericAddition` expects string operands.
memoizedPrefixSumsCache[0] = "0";

let currentRunningSum = "0"; // Initialize the running sum as a string for large number operations.

// Iterate through the sorted primary values to calculate and store their cumulative sums.
primarySortedValues.forEach(currentValueA => {
    // Add the current value to the running sum using the large number addition function.
    currentRunningSum = stringNumericAddition(currentRunningSum, currentValueA);
    // Store this updated cumulative sum in the cache, indexed by `currentValueA`.
    memoizedPrefixSumsCache[currentValueA] = currentRunningSum;
});

// Process each query number from the second set.
queryNumbers.forEach((currentQueryValue, originalQueryIndex) => {
    let searchIndex = currentQueryValue;
    // Search backward from `currentQueryValue` to find the largest index
    // for which a prefix sum has been computed and stored in the cache.
    while (searchIndex >= 0 && memoizedPrefixSumsCache[searchIndex] === null) {
        searchIndex--;
    }

    // Retrieve the found prefix sum string from the cache.
    // (Assuming `searchIndex` will always yield a valid entry >= 0 based on problem constraints.)
    const locatedPrefixSumString = memoizedPrefixSumsCache[searchIndex];
    // Get the corresponding target result string for comparison.
    const desiredResultString = targetResultStrings[originalQueryIndex];

    let queryOutcome = "No"; // Default assumption for the query outcome.

    // Use the helper function to compare the desired result string with the located prefix sum string.
    // The problem's logic implies "Yes" if the desired result is less than or equal to the prefix sum.
    const comparisonResult = compareLargeNumberStrings(desiredResultString, locatedPrefixSumString);

    // If the desired result is numerically less than or equal to the prefix sum, set the outcome to "Yes".
    if (comparisonResult <= 0) { 
        queryOutcome = "Yes";
    }

    // Output the determination for the current query.
    console.log(queryOutcome);
});