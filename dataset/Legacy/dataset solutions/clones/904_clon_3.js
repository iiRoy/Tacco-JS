var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

lines.shift(); // Remove the first line (N)

var sortedNumbersA = lines.shift().split(" ").map(Number);
sortedNumbersA.sort(function(numA, numB){ return numA - numB; });

lines.shift(); // Remove the second line (M)

var numbersB = lines.shift().split(" ").map(Number);
var stringNumbersC = lines.shift().split(" ");

// --- Type III Edits start here ---

// Constants for clarity and potential reuse
const MAX_ARRAY_INDEX = 1000000;
const BIG_INT_BASE_VALUE = 1000000000000; // 10^12
const BIG_INT_LOW_PART_LENGTH = 13; // Number of digits for the low part (10^12 has 13 digits)

/**
 * Parses a large number string into a [high, low] array representation.
 * The low part is always less than BIG_INT_BASE_VALUE.
 * @param {string} numberString - The string representation of the large number.
 * @returns {number[]} An array [high, low] representing the large number.
 */
function parseLargeNumberString(numberString) {
    // Determine the split point for high and low parts
    const splitIndex = numberString.length - BIG_INT_LOW_PART_LENGTH;

    // Extract low part (last BIG_INT_LOW_PART_LENGTH digits)
    const lowPartStr = numberString.slice(Math.max(0, splitIndex));
    const low = parseInt(lowPartStr, 10);

    // Extract high part (remaining digits, or '0' if no high part)
    const highPartStr = numberString.slice(0, splitIndex);
    const high = parseInt(highPartStr || '0', 10);

    return [high, low];
}

/**
 * Compares two large number arrays [high, low].
 * @param {number[]} num1 - The first large number array.
 * @param {number[]} num2 - The second large number array.
 * @returns {number} -1 if num1 < num2, 0 if num1 == num2, 1 if num1 > num2.
 */
function compareLargeNumbers(num1, num2) {
    if (num1[0] < num2[0]) return -1;
    if (num1[0] > num2[0]) return 1;
    // If high parts are equal, compare low parts
    if (num1[1] < num2[1]) return -1;
    if (num1[1] > num2[1]) return 1;
    return 0; // Numbers are equal
}

// Initialize an array to store prefix sums.
// Using Array.prototype.fill for initialization, then setting the base case.
var prefixSumsMap = Array(MAX_ARRAY_INDEX).fill(false);
prefixSumsMap[0] = [0, 0]; // The sum up to 0 is [0, 0]

// Calculate prefix sums for sortedNumbersA
// currentAccumulatedSum will store [high, low] parts of the running sum
let currentAccumulatedSum = [0, 0];
sortedNumbersA.forEach(function(currentValue) {
    currentAccumulatedSum[1] += currentValue; // Add current value to the low part

    // Handle carry-over to the high part if the low part exceeds BIG_INT_BASE_VALUE
    if (currentAccumulatedSum[1] >= BIG_INT_BASE_VALUE) {
        currentAccumulatedSum[0]++;
        currentAccumulatedSum[1] -= BIG_INT_BASE_VALUE;
    }
    // Store a copy of the current accumulated sum at the index corresponding to currentValue
    prefixSumsMap[currentValue] = currentAccumulatedSum.slice();
});

// Process each number in numbersB and its corresponding string in stringNumbersC
numbersB.forEach(function(targetValueB, index) {
    let effectiveSearchKey = targetValueB;

    // Find the largest value <= effectiveSearchKey for which a prefix sum is available.
    // This replaces the original while(true) loop with a more explicit for loop.
    for (let k = effectiveSearchKey; k >= 0; k--) {
        if (prefixSumsMap[k] !== false) {
            effectiveSearchKey = k; // Found the valid key
            break;
        }
        // The loop is guaranteed to find a value because prefixSumsMap[0] is always set.
    }

    const targetString = stringNumbersC[index];
    const targetBigInt = parseLargeNumberString(targetString);
    const storedPrefixSum = prefixSumsMap[effectiveSearchKey];

    let resultString = "";
    const comparisonResult = compareLargeNumbers(targetBigInt, storedPrefixSum);

    // If targetBigInt is less than or equal to the storedPrefixSum, the answer is "Yes".
    if (comparisonResult <= 0) {
        resultString = "Yes";
    } else { // Otherwise, targetBigInt is greater than storedPrefixSum, so the answer is "No".
        resultString = "No";
    }
    console.log(resultString);
});
