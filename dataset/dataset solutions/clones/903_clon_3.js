function bigAdd(num1, num2) {
    const convertToReversedDigits = (val) => String(val).split('').reverse().map(Number);

    let digitsA = convertToReversedDigits(num1);
    let digitsB = convertToReversedDigits(num2);

    let resultArr = [];
    let maxLen = Math.max(digitsA.length, digitsB.length);

    // Initialize result array with zeros up to maxLen + 1 for potential carry
    for (let i = 0; i <= maxLen; i++) {
        resultArr[i] = 0;
    }

    // Sum digits from both numbers into the result array
    for (let i = 0; i < maxLen; i++) {
        let currentDigitSum = 0;
        if (digitsA.length > i) {
            currentDigitSum += digitsA[i];
        }
        if (digitsB.length > i) {
            currentDigitSum += digitsB[i];
        }
        resultArr[i] += currentDigitSum;
    }

    // Process carries through the result array
    for (let i = 0; i < maxLen; i++) {
        if (resultArr[i] >= 10) {
            resultArr[i + 1] += Math.floor(resultArr[i] / 10); // Add carry to the next position
            resultArr[i] %= 10; // Keep only the unit digit at the current position
        }
    }

    // Remove a leading zero if the highest place value digit is zero (e.g., for sum "0")
    if (resultArr[resultArr.length - 1] === 0) {
        resultArr.pop();
    }

    let finalResultString = resultArr.reverse().join('');
    return finalResultString;
}

// Helper function for comparing large numbers represented as strings
// Returns:
//   0 if str1 === str2
//   -1 if str1 < str2
//   1 if str1 > str2
function compareBigNumberStrings(str1, str2) {
    if (str1.length < str2.length) {
        return -1;
    }
    if (str1.length > str2.length) {
        return 1;
    }
    // Lengths are equal, compare lexicographically digit by digit
    for (let k = 0; k < str1.length; k++) {
        const digit1 = Number(str1[k]);
        const digit2 = Number(str2[k]);
        if (digit1 < digit2) {
            return -1;
        }
        if (digit1 > digit2) {
            return 1;
        }
    }
    return 0; // Numbers are identical
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

let inputLines = rawInputContent.trim().split('\n');

// Discard the first line (N, count of elements in A)
inputLines.shift();

// Parse and sort array A (numbers to sum)
const numbersA = inputLines.shift().split(' ').map(Number);
numbersA.sort((val1, val2) => val1 - val2);

// Discard the third line (M, count of elements in B)
inputLines.shift();

// Parse array B (query values)
const queryValuesB = inputLines.shift().split(' ').map(Number);

// Parse array C (expected comparison results, as strings)
const expectedResultsC = inputLines.shift().split(' ');

// Define the maximum possible index for the prefix sum cache
const MAX_CACHE_INDEX = 1000000;
const CACHE_ARRAY_SIZE = MAX_CACHE_INDEX + 1;

// Initialize prefix sum cache with 'false' to indicate uncomputed values
let prefixSumCache = new Array(CACHE_ARRAY_SIZE).fill(false);
prefixSumCache[0] = "0"; // The sum up to 0 is "0"

let currentCumulativeSum = "0"; // Initialize cumulative sum as a string

// Calculate prefix sums for numbersA and store them in the cache
numbersA.forEach(function(currentNum) {
    currentCumulativeSum = bigAdd(currentCumulativeSum, currentNum);
    prefixSumCache[currentNum] = currentCumulativeSum;
});

// Process each query from array B
queryValuesB.forEach(function(queryVal, queryIdx) {
    let searchKey = queryVal;
    // Find the largest value <= searchKey for which a prefix sum is cached
    while (searchKey >= 0 && prefixSumCache[searchKey] === false) {
        searchKey--;
    }

    const cachedSumForQuery = prefixSumCache[searchKey];
    const targetSumString = expectedResultsC[queryIdx];

    let finalAnswer = "No";

    // Compare the target sum with the cached sum
    const comparisonOutcome = compareBigNumberStrings(targetSumString, cachedSumForQuery);

    // If targetSumString is less than or equal to cachedSumForQuery
    if (comparisonOutcome === 0 || comparisonOutcome === -1) {
        finalAnswer = "Yes";
    }
    // Otherwise (targetSumString > cachedSumForQuery), finalAnswer remains "No"

    console.log(finalAnswer);
});
