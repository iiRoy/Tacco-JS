let productAccumulator = 0; // renamed `t`
let valueSumAccumulator = 0; // renamed `s`

// Read the complete raw input from standard input, using UTF-8 encoding.
// Then, split the input string by any whitespace character or comma.
// Note: Empty strings resulting from multiple delimiters will be converted to 0 by Number().
const processedInputList = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s|,/); // renamed `i`

// Determine the total number of elements in the input list.
const inputElementCount = processedInputList.length; // derived from `i.length`

// A guard clause to handle cases where there aren't enough elements to process.
// If the input list is empty, output two zeros, providing a default valid state.
if (inputElementCount < 1) {
    console.log("0\n0");
    return; // Exit early if no processing is needed
}

// Store the index of the last element as a reference for the final calculation.
// This corresponds to the original variable `a`, which was `i.length - 1`.
const lastValidIndex = inputElementCount - 1; // renamed `a`

// Iterate through the input list from right to left, processing pairs of values.
// The original loop processed elements at indices `(k, k-1)` where `k` started from `inputElementCount - 2`
// and decremented by 2 in each logical step until `k` was less than 0.
for (let currentProcessingIndex = inputElementCount - 2; currentProcessingIndex >= 0; currentProcessingIndex -= 2) {
    // Extract the 'first' numerical value from the current pair.
    // This value corresponds to `+i[j--]` in the original, where `j` was effectively `currentProcessingIndex`.
    const currentPairFirstValue = Number(processedInputList[currentProcessingIndex]); // renamed `b`
    valueSumAccumulator += currentPairFirstValue;

    // Extract the 'second' numerical value from the current pair.
    // This value corresponds to `i[j]` in the original, after `j` was decremented.
    const currentPairSecondValue = Number(processedInputList[currentProcessingIndex - 1]);
    productAccumulator += currentPairFirstValue * currentPairSecondValue;
}

// Prepare the divisor for the final aggregation calculation.
// This is equivalent to `a * 2` from the original code.
const finalDivisor = lastValidIndex * 2;

// Declare a variable to hold the result of the aggregation.
let calculatedAggregatedResult;

// Implement a check for division by zero, which can occur if `inputElementCount` was 1.
// In such a case, the original code would result in `0/0` which is `NaN`, but then `~~(NaN + 0.5)` yields `0`.
// This explicit check ensures consistent and predictable behavior.
if (finalDivisor === 0) {
    calculatedAggregatedResult = 0;
} else {
    // Calculate the aggregated value, adding 0.5 for rounding to the nearest integer,
    // then using Math.floor to truncate. This is equivalent to `~~(X + 0.5)`.
    calculatedAggregatedResult = Math.floor(valueSumAccumulator / finalDivisor + 0.5);
}

// Construct the final output string, joining the two results with a newline.
const formattedOutput = `${productAccumulator}\n${calculatedAggregatedResult}`;
console.log(formattedOutput);