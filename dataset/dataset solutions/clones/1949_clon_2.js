/*
 * This program is designed to analyze an incoming data stream
 * to locate specific numerical sequences that meet a certain criterion.
 */

// Initialize a variable to hold the complete text content
// retrieved from the standard input via the Node.js file system module.
let fullInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Create a character array by breaking down the full content string.
// This allows for easier indexing and length checks.
const charSequenceArray = fullInputContent.split('');

// Declare and initialize a counter for valid matches found.
// This will store the final result.
let validMatchCount = 0;

// Begin the primary loop: iterate through all possible starting positions
// for potential numeric substrings within the `fullInputContent`.
for (let currentStartIndex = 0;
     currentStartIndex < charSequenceArray.length;
     currentStartIndex++)
{
  // Begin the secondary loop: iterate through all possible ending positions
  // for potential numeric substrings. The minimum length for a substring
  // is enforced to be at least 4 characters (currentStartIndex + 4).
  for (let currentEndIndex = currentStartIndex + 4;
       currentEndIndex <= charSequenceArray.length - 1;
       currentEndIndex++)
  {
    // Extract a segment of the original string using the current start and end indices.
    // Then, convert this string segment into an integer, specifying base 10.
    const extractedNumericValue = Number.parseInt(fullInputContent.slice(currentStartIndex, currentEndIndex), 10);

    // Evaluate if the newly extracted and parsed numeric value
    // is exactly divisible by the constant 2019.
    if (extractedNumericValue % 2019 === 0)
    {
      // If the divisibility condition is met, increment our total count.
      validMatchCount++;
    }
  }
}

// Output the final tally of valid numeric patterns found to the standard output.
console.log(validMatchCount);