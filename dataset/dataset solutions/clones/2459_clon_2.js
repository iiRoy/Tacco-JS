// Function to handle reading file content.
const fileSystemHandler = require('fs');

// Helper function to remove leading/trailing whitespace from a string.
function removeEdgeSpaces(textString) {
  return textString.trim();
}

// Define standard input path and encoding.
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

// Read the input data, decode it, and clean up whitespace.
let inputData = removeEdgeSpaces(
  fileSystemHandler.readFileSync(standardInputPath, textEncoding)
);

// Store the initial character of the input for potential future use (though not used in this logic).
const initialChar = inputData[0];

// Initialize counters and an accumulator for calculations.
let lessCount = 0;    // Counter for '<' symbols
let greaterCount = 0; // Counter for '>' symbols
let finalSummation = 0; // Accumulates the result

// Check if the input stream starts with a '>' symbol.
// If it does, prepend a '<' to ensure proper processing logic.
if (inputData[0] === '>') {
  inputData = '<' + inputData;
}

// Iterate through the input stream using a primary index.
// The loop continues until the end of the input string is reached.
for (let charIndex = 0; charIndex < inputData.length; )
{
  // First nested loop: Count consecutive occurrences of the '<' character.
  // This loop advances 'charIndex' and increments 'lessCount'.
  for (; charIndex < inputData.length; charIndex++) {
    if (inputData[charIndex] !== '<') {
      break; // Exit if the character is not '<'
    }
    lessCount++; // Increment the count for '<'
  }

  // Second nested loop: Count consecutive occurrences of the '>' character.
  // This loop continues from where the previous one stopped.
  for (; charIndex < inputData.length; charIndex++) {
    if (inputData[charIndex] !== '>') {
      break; // Exit if the character is not '>'
    }
    greaterCount++; // Increment the count for '>'
  }

  // Apply conditional logic based on the comparison of the two counts.
  if (lessCount > greaterCount) {
    // If 'lessCount' is larger, perform summation with inclusive upper bound for 'lessCount'.
    for (let currentVal = 0; currentVal <= lessCount; currentVal++) {
      finalSummation += currentVal;
    }
    // And exclusive upper bound for 'greaterCount'.
    for (let currentVal = 0; currentVal < greaterCount; currentVal++) {
      finalSummation += currentVal;
    }
  } else {
    // If 'greaterCount' is larger or equal, perform summation with exclusive upper bound for 'lessCount'.
    for (let currentVal = 0; currentVal < lessCount; currentVal++) {
      finalSummation += currentVal;
    }
    // And inclusive upper bound for 'greaterCount'.
    for (let currentVal = 0; currentVal <= greaterCount; currentVal++) {
      finalSummation += currentVal;
    }
  }

  // Reset the counters for the next segment of the input string.
  lessCount = 0;
  greaterCount = 0;
}

// Output the final computed summation to the console.
console.log(finalSummation);