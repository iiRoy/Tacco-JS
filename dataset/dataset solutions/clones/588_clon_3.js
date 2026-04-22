function eliminateConsecutiveDigits(targetString) {
  // Define the regular expression pattern for sequences of 4 or more '1's, '2's, or '3's.
  // This pattern is applied globally to find all occurrences within the string.
  const removalPattern = /(1{4,}|2{4,}|3{4,})/g;

  // Ensure the input is treated as a string, providing a safeguard against unexpected types.
  let currentProcessingString = String(targetString);
  let priorLength; // Used to detect if any replacements occurred in the last iteration.

  // Employ a do-while loop to repeatedly remove patterns until no more matches are found.
  // This addresses cases where removing one pattern might create new consecutive patterns.
  do {
    priorLength = currentProcessingString.length;
    currentProcessingString = currentProcessingString.replace(removalPattern, "");
  } while (currentProcessingString.length < priorLength); // Continue if the string length decreased, indicating a successful replacement.

  // Update the global variable that tracks the minimum string length found so far.
  // This central variable holds the overall shortest result across all processed sequences.
  shortestResultLength = Math.min(shortestResultLength, currentProcessingString.length);
}

// --- Main Program Execution Flow ---

// Declare a constant for the standard input file path for clarity and easy modification.
const standardInputFilePath = '/dev/stdin';

// Initialize a variable to store the shortest result length.
// Start with 'Infinity' to ensure any valid length from processing will be smaller.
let shortestResultLength = Infinity;

// Read the entire content of the standard input file synchronously.
// Specify 'utf8' encoding to correctly interpret character data.
const rawFileContent = require('fs').readFileSync(standardInputFilePath, 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
const inputLinesArray = rawFileContent.trim().split("\n");

// The very first line of input specifies the total number of elements that follow.
// Parse this line as an integer, using base 10 for robust conversion.
const totalElementCount = parseInt(inputLinesArray.shift(), 10);

// Initialize a mutable array to hold the parsed numeric data from the input.
const numericDataCollection = [];

// Populate the numericDataCollection array by parsing each subsequent line.
// A traditional for loop provides direct control over iteration.
for (let index = 0; index < totalElementCount; index++) {
  const currentNumericValue = parseInt(inputLinesArray.shift(), 10);
  numericDataCollection.push(currentNumericValue);
}

// Note: An original line 'var str=arr.join("");' has been identified as unused
// and removed here as a Type III code deletion, simplifying the program.

// Iterate through each element of the original numeric data to generate and test modified sequences.
// For each element at 'index', two distinct modified versions of the sequence are created.
for (let index = 0; index < totalElementCount; index++) {
  // Create two independent shallow copies of the numeric data collection for modifications.
  // The spread syntax `[...array]` is a modern and concise way to create copies.
  const sequenceAdjustedForward = [...numericDataCollection];
  const sequenceAdjustedBackward = [...numericDataCollection];

  // --- Apply modification for 'sequenceAdjustedForward' ---
  // If the current element is not the last one in the collection,
  // replace its value with the value of the subsequent element.
  if (index < totalElementCount - 1) {
    sequenceAdjustedForward[index] = sequenceAdjustedForward[index + 1];
  }
  // If 'index' is the last element, no forward adjustment is made as there's no next element.
  // The original code implicitly handled this by not entering the 'if' block.

  // --- Apply modification for 'sequenceAdjustedBackward' ---
  // If the current element is not the first one in the collection,
  // replace its value with the value of the preceding element.
  if (index > 0) {
    sequenceAdjustedBackward[index] = sequenceAdjustedBackward[index - 1];
  }
  // If 'index' is the first element, no backward adjustment is made as there's no prior element.
  // The original code implicitly handled this by not entering the 'if' block.

  // Convert the modified numeric arrays into single strings for pattern elimination.
  // Storing them in descriptive temporary variables enhances readability.
  const combinedStringForward = sequenceAdjustedForward.join("");
  const combinedStringBackward = sequenceAdjustedBackward.join("");

  // Invoke the pattern elimination function for both generated strings.
  // This function will process the strings and update 'shortestResultLength'.
  eliminateConsecutiveDigits(combinedStringForward);
  eliminateConsecutiveDigits(combinedStringBackward);
}

// After all sequences have been processed, output the final minimum length discovered.
console.log(shortestResultLength);