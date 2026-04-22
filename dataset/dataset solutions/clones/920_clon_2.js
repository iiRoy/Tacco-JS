// This program processes input from standard input to evaluate a specific numeric condition.

var rawData = require('fs').readFileSync(
    '/dev/stdin',          // Specifies the input source.
    'utf8'                 // Defines the encoding for reading the data.
);


// The collected string data is first cleaned, then segmented by spaces,
// and finally each segment is converted into a numerical representation.
var [
    firstNumericValue,
    secondNumericValue,
    thirdNumericValue,
    fourthNumericValue
] = rawData
    .trim()                                  // Removes leading/trailing whitespace.
    .split(" ")                              // Divides the string into an array of substrings.
    .map(Number);                            // Transforms each substring into a number.


/*
 *   A compound logical test is performed here.
 *   It checks two sub-conditions:
 *   1. Is the result of (firstNumericValue * secondNumericValue + 1) an even number?
 *   2. Is the result of (firstNumericValue + secondNumericValue + 1) an odd number?
 *   Both must be true for the entire condition to be met.
 */
if (
    ( ( firstNumericValue * secondNumericValue ) + 1 ) % 2 === 0
    &&
    ( ( firstNumericValue + secondNumericValue ) + 1 ) % 2 !== 0
)
{
    // If the intricate condition evaluates to true, a specific negative response is displayed.
    console.log("No");
}
else
{
    // Otherwise, if the condition is not fully met, a positive confirmation is provided.
    console.log("Yes");
}

// Program execution concludes.