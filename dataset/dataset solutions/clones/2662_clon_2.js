const processData = (numElements, stringArray) => {
    // Initialize a counter to keep track of the total number of matches found.
    let totalMatches = 0;

    // Transform the input array of character arrays into an array of sorted strings.
    // Each inner array (representing a string) is sorted alphabetically and then joined back.
    // This creates a canonical representation for anagram checking.
    const sortedStrings = stringArray.map( (currentStr) => {
        return currentStr.sort().join('');
    });

    // Iterate through the 'sortedStrings' array using an index 'idx'.
    // The loop runs from the first element (index 0) up to and including 'numElements'.
    for (let idx = 0; idx <= numElements; idx++) {
        // For each element at the current 'idx', count its occurrences in the
        // remaining part of the 'sortedStrings' array (from 'idx' to the end).
        // The 'slice(idx)' method creates a new array starting from the current index.
        // The 'filter' method then selects elements that are identical to 'sortedStrings[idx]'.
        // The 'length' of the filtered array gives the count of matches for the current element.
        totalMatches += sortedStrings.slice(idx).filter( (elementToCheck) => {
            return sortedStrings[idx] === elementToCheck;
        }).length;
    }

    // The function does not explicitly return a value, so it implicitly returns undefined.
};


// Read the entire content of standard input, decode it as UTF-8, and split it by newlines.
// The 'fs' module is a core Node.js module for file system operations.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");

// Convert the first line of the input (which is at index 0) to a number.
// This number represents the count of elements to process.
const numElements = Number(rawData[0]);

// Process the rest of the input lines (from index 1 onwards).
// Each line is mapped to an array of its individual characters.
const stringArray = rawData.slice(1).map( (lineContent) => Array.from(lineContent) );

// Call the main data processing function with the parsed number of elements and string array.
// Note: The original code contains a typo 'console.lof' which is preserved here
// to maintain strict behavioral equivalence, including potential runtime errors.
console.lof(processData(numElements, stringArray));
