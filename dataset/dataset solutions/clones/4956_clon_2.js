/*
 * This script processes input from standard input to find a specific pattern.
 * It reads a total number of elements and a sequence of values, then applies a unique
 * mapping logic to count specific matching conditions.
 */
var rawDataLines = require('fs')  // Obtain the Node.js file system module.
  .readFileSync('/dev/stdin', 'utf8') // Synchronously read content from the standard input path with UTF-8 encoding.
  .trim()                             // Remove any leading or trailing whitespace from the entire input.
  .split('\n');                       // Divide the processed input string into an array of strings, splitting by newline characters.

// Extract the first line, convert it to an integer (base 10), and store it as the total count of items.
const totalItems = parseInt(rawDataLines.shift(), 10);

// Extract the second line, split it by space characters to get an array of string values for the items.
let itemValues = rawDataLines.shift().split(' ');

// Initialize an empty hash map (JavaScript object) to serve as a registry for item relationships.
const itemRegistry = {};

// Initialize a counter variable to track the number of times a specific matching condition is met.
let matchingOccurrences = 0;

// Begin a loop that iterates through the 'itemValues' array.
// The loop runs from the first element (index 0) up to, but not including, 'totalItems'.
for (let currentIdx = 0; currentIdx < totalItems; currentIdx++) {

  // Convert the current element from the 'itemValues' array to an integer for numerical operations.
  let activeValue = parseInt(itemValues[currentIdx], 10);

  // Check if the 'activeValue' already exists as a key within our 'itemRegistry' map.
  if (itemRegistry[activeValue]) {
    // If 'activeValue' is found as a key, proceed to check its associated value.
    // Compare the stored value with the current loop index plus one using strict equality.
    if (itemRegistry[activeValue] === currentIdx + 1) {
      // If the stored value strictly matches 'currentIdx + 1', increment the counter.
      matchingOccurrences++;
    }
  } else {
    // If 'activeValue' is NOT found as a key in 'itemRegistry', then add a new entry.
    // The key for this new entry will be 'currentIdx + 1', and its value will be 'activeValue'.
    itemRegistry[currentIdx + 1] = activeValue;
  }
}

// After the loop completes, print the final calculated count of 'matchingOccurrences' to the console.
console.log(matchingOccurrences);