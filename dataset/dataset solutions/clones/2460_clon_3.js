const acquireInputData = () => { // Function to obtain raw input data from standard input
  const fileSystemModule = require("fs"); // Import the Node.js file system module
  const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin"); // Read input file as a buffer
  const decodedStringInput = rawInputBuffer.toString("utf8"); // Convert buffer to UTF-8 string
  return decodedStringInput.trim(); // Trim leading/trailing whitespace and return the processed string
};

const displayComputedResult = (finalOutputValue) => { // Arrow function for outputting the final calculated value
  process.stdout.write(String(finalOutputValue) + '\n'); // Use process.stdout.write for output, appending a newline
};

// This utility function converts an input string based on a specified transformation type.
// Transformation Key:
// 0: No change, return the input string as is.
// 1: Convert the input string to an integer.
// 2: Split the input string by single spaces into an array of strings.
// 3: Split the input string by newline characters into an array of strings.
// 4: Split by spaces, then convert each resulting string element to a number.
// 5: Split by newlines, then convert each resulting string element to a number.
// 6: Split the input string into an array of individual characters (each a string).
// 7: Split into individual characters, then convert each character string to a number.
function applyDataTransformation(sourceValue, conversionKey) {
  let transformedValue; // Variable to hold the result of the transformation
  switch(conversionKey) {
    case 0: transformedValue = sourceValue; break; // Return original value
    case 1: transformedValue = Number.parseInt(sourceValue, 10); break; // Parse as integer, base 10
    case 2: transformedValue = sourceValue.split(" "); break; // Split by space
    case 3: transformedValue = sourceValue.split("\n"); break; // Split by newline
    case 4: transformedValue = sourceValue.split(" ").map(element => Number(element)); break; // Split by space, map to numbers
    case 5: transformedValue = sourceValue.split("\n").map(element => Number(element)); break; // Split by newline, map to numbers
    case 6: transformedValue = sourceValue.split(""); break; // Split into character array
    case 7: transformedValue = sourceValue.split("").map(character => Number(character)); break; // Split into character array, map to numbers
    // If conversionKey is not recognized, transformedValue will remain undefined,
    // mimicking the original function's behavior for unhandled cases.
  }
  return transformedValue; // Return the transformed data
}

function processInputSequence(initialTextInput) {
  // Convert the raw input string into an array of individual characters.
  // This is equivalent to myconv(input, 6) from the original code.
  const characterArray = applyDataTransformation(initialTextInput, 6);

  // Initialize an array to store calculated numerical values for each position.
  // The length is one more than the character array to account for boundary points.
  // Using 'null' as an initial placeholder for clarity, enabling explicit '=== null' checks.
  const assignedNumericalScores = Array.from({ length: characterArray.length + 1 }, () => null);

  // Define a constant to represent the 'peak' pattern marker, replacing the magic string "x".
  const PEAK_INDICATION = "peak_point";

  // --- First Iteration: Identify and mark initial boundary conditions and special sequence points (valleys/peaks). ---

  // Examine the very first character of the sequence.
  // If it's an opening '<' symbol, the first position in the scores array gets a base value of 0.
  if (characterArray[0] === "<") {
    assignedNumericalScores[0] = 0;
  }

  // Examine the very last character of the sequence.
  // If it's a closing '>' symbol, the last position in the scores array gets a base value of 0.
  if (characterArray[characterArray.length - 1] === ">") {
    assignedNumericalScores[characterArray.length] = 0;
  }

  // Iterate through the character array to detect "valley" patterns ('> <') and "peak" patterns ('< >').
  // This loop processes pairs of adjacent characters from the input.
  for (let currentPos = 1; currentPos < characterArray.length; currentPos++) {
    const previousSymbol = characterArray[currentPos - 1];
    const currentSymbol = characterArray[currentPos];

    // If a "valley" pattern (previousSymbol is '>' and currentSymbol is '<') is discovered,
    // mark the current index in the scores array with 0.
    if (previousSymbol === ">" && currentSymbol === "<") {
      assignedNumericalScores[currentPos] = 0;
    }
    // If a "peak" pattern (previousSymbol is '<' and currentSymbol is '>') is discovered,
    // mark the current index in the scores array with the PEAK_INDICATION constant.
    else if (previousSymbol === "<" && currentSymbol === ">") {
      assignedNumericalScores[currentPos] = PEAK_INDICATION;
    }
  }

  // --- Second Iteration: Calculate and propagate numerical scores based on the initial marks. ---

  let totalCumulativeScore = 0; // Variable to accumulate the final total score.

  // Iterate through the `assignedNumericalScores` array to determine the final values for each position.
  for (let currentPos = 0; currentPos < assignedNumericalScores.length; currentPos++) {
    // Special handling for the very first element of the scores array.
    if (currentPos === 0) {
      // If the first element's score wasn't explicitly set during the first pass (i.e., not a '<' at the start),
      // default its value to 1. This ensures every position has a starting score.
      if (assignedNumericalScores[0] === null) {
        assignedNumericalScores[0] = 1;
      }
      continue; // Move immediately to the next element in the array.
    }

    // If the current position is explicitly marked as a "valley" (0),
    // its value is already finalized, so skip further processing for this element.
    if (assignedNumericalScores[currentPos] === 0) {
      continue;
    }

    // Check if the score of the previous position was a "valley" (0).
    // If it was, the current position's score is set to 1, effectively starting a new sequence.
    if (assignedNumericalScores[currentPos - 1] === 0) {
      assignedNumericalScores[currentPos] = 1;
    }
    // If the current position is marked as a "peak" (PEAK_INDICATION) AND the previous position
    // was NOT a valley (i.e., its score is not 0), apply specific peak handling logic.
    else if (assignedNumericalScores[currentPos] === PEAK_INDICATION) {
      // The peak position itself receives a score one greater than the score of the position to its left.
      assignedNumericalScores[currentPos] = assignedNumericalScores[currentPos - 1] + 1;

      // Implement a special rule for the element immediately to the right of this peak:
      // If this subsequent element exists within array bounds and is not already a valley (0),
      // its score is reset to 1. This handles the descending side of a peak, ensuring it begins a fresh count.
      if (currentPos + 1 < assignedNumericalScores.length && assignedNumericalScores[currentPos + 1] !== 0) {
        assignedNumericalScores[currentPos + 1] = 1;
      }
      currentPos++; // Increment the loop index to skip the next element, as it was just processed.
      continue; // Continue the loop from the element after the skipped one.
    }
    // For all other scenarios (e.g., an increasing sequence like '<<'),
    // the current position's score is simply one greater than the score of the previous position.
    else {
      assignedNumericalScores[currentPos] = assignedNumericalScores[currentPos - 1] + 1;
    }
  }

  // --- Third Iteration: Sum up all the finally calculated scores. ---
  // This loop aggregates the numerical scores from the `assignedNumericalScores` array into a single total.
  for (let currentPos = 0; currentPos < assignedNumericalScores.length; currentPos++) {
    totalCumulativeScore += assignedNumericalScores[currentPos];
  }

  // Output the final computed cumulative sum.
  displayComputedResult(totalCumulativeScore);
}

// Main execution block:
// 1. Acquire raw input data from standard input.
// 2. Perform the sequence processing and score calculation.
// 3. Display the final result.
processInputSequence(acquireInputData());