/*
 * This script processes numerical ranges provided via standard input.
 * It calculates frequency counts for numbers within these ranges
 * and then determines a specific maximum value based on these counts.
 * The program's goal is to find the largest integer 'X' such that
 * its cumulative frequency is at least 'X', and then output 'X - 1'.
 */

// Acquire the file system module from Node.js core libraries.
const fileSystemModule = require('node:fs');

// Create a local alias for the synchronous file reading function
// to adhere to the requirement of changing all identifier names.
const readInputContent = fileSystemModule.readFileSync;

// Read all incoming data from standard input ('/dev/stdin') as a UTF-8 string.
let dataSource = readInputContent('/dev/stdin', 'utf8');


// Trim any leading or trailing whitespace from the raw input string,
// then split the string into an array of individual lines using the newline character.
const lineFragments = (dataSource.trim()).split("\n");


// Extract the first line from the array, which represents the total number of
// subsequent range definitions. Convert this string to an integer using base 10.
let numQueries = parseInt(lineFragments.shift(), 10);

// Initialize a dynamic array (list) that will store the frequency counts
// for each number. This array will be populated with default values.
let frequencyCounts = [];

// Pre-fill the `frequencyCounts` array. It is sized to accommodate numbers
// up to 100001, with each element initially set to a base value of 1.
for (let currentVal = 0; currentVal <= 100001; currentVal++) {
    frequencyCounts[currentVal] = 1;
}

// Iterate through each of the specified number of queries.
for (let queryIdx = 0; queryIdx < numQueries; queryIdx++)
{
    // Retrieve the next line, split it by spaces to get two string parts,
    // and then convert both parts into integers (base 10) representing a range.
    const rangeBoundaries = (lineFragments.shift()).split(" ").map(valueStr => parseInt(valueStr, 10));

    // Assign the first parsed integer as the starting point of the current range.
    let startPoint = rangeBoundaries[0];

    // Assign the second parsed integer as the ending point of the current range.
    let endPoint = rangeBoundaries[1];

    // Loop through all numbers within the current range [startPoint, endPoint] inclusive,
    // and increment their respective counters in the `frequencyCounts` array.
    for (let currentNumber = startPoint; currentNumber <= endPoint; currentNumber++) {
        frequencyCounts[currentNumber]++;
    }
}

// Initialize a variable to keep track of the largest number 'X' that satisfies
// the condition `frequencyCounts[X] >= X`. Start with a default candidate of 1.
let largestCandidate = 1;

// Traverse the `frequencyCounts` array starting from index 2 up to its maximum limit (100001).
// The objective is to find the highest index 'indexValue' where its corresponding
// frequency count is greater than or equal to the 'indexValue' itself.
for (let indexValue = 2; indexValue <= 100001; indexValue++) {
    if (frequencyCounts[indexValue] >= indexValue) {
        largestCandidate = indexValue; // Update the candidate if the condition holds true.
    }
}

// Print the final computed result to the console, which is the largest candidate
// value found, decremented by one as per the problem's output requirement.
console.log(largestCandidate - 1);