/*
 * This script is designed to process numerical data from a file.
 * It reads the first ten numbers, sums them up, and prints the result.
 */

// Acquire the file system utility module.
const fileSystemUtility =    require('fs');

// Fetch the entire content of the standard input file as a UTF-8 encoded string.
let  sourceContent =  fileSystemUtility. readFileSync('/dev/stdin', 'utf8');

// Normalize the input string: remove excess whitespace, segment by newline characters,
// and then convert each resulting string segment into a numerical value.
let  numericalValues =    sourceContent.trim().split('\n').map(Number);

// Initialize a variable to accumulate the running total of the processed numbers.
let  cumulativeSum = 0;

// Iterate through the initial ten entries of the numerical values collection.
for (
    let   currentIdx = 0;
    currentIdx < 10;
    currentIdx++
) {
    // Add the number at the current index to the cumulative sum.
    cumulativeSum += numericalValues[currentIdx];
}

// Output the final calculated cumulative sum to the standard console.
console.log(cumulativeSum);