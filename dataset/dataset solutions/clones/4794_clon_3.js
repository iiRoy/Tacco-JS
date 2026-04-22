// This section handles the program's input/output operations.
// It's designed to read lines from standard input and manage a data stream.
const streamReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputDataProcessor; // Manages the parsed input stream
const rawInputBuffer = []; // Stores all lines read from stdin

// Event listener for each line of input received
streamReader.on('line', function(singleLineInput) {
  rawInputBuffer.push(singleLineInput);
});

// Event listener for when the input stream closes
streamReader.on('close', function() {
  inputDataProcessor = createInputHandler(rawInputBuffer); // Initialize the input processing object
  console.error('\n--- Input Processed, Output Below ---'); // Visual separator for debug output
  executeMainLogic(); // Call the primary function of the application
});

// Utility function to print results to standard output
function displayOutput(resultContent) {
  console.log(resultContent);
}

// Utility function for debugging purposes, prints detailed object info to stderr
function logDiagnostic(debugInfo) {
  console.error('DEBUG INFO: ' + require('util').inspect(debugInfo, false, null));
}

// Function to create an object that manages reading through the input lines
// It provides methods to check for more input and retrieve the next line.
function createInputHandler(allInputLines) {
  const inputLineCount = allInputLines.length;
  let currentLineIndex = 0;

  return {
    sourceLines: allInputLines,
    currentPosition: currentLineIndex,
    totalLines: inputLineCount,

    // Checks if there are more lines available in the input stream
    hasMoreElements: function() {
      return (this.currentPosition < this.totalLines);
    },

    // Retrieves the next line from the input stream
    retrieveNextToken: function() {
      if (this.hasMoreElements()) {
        return this.sourceLines[this.currentPosition++];
      } else {
        // Custom error for out-of-bounds access
        throw new Error('InputEndOfStreamError: No more input lines available.');
      }
    }
  };
}

// Helper to retrieve the next available token from the input stream
function pullNextElement() {
  return inputDataProcessor.retrieveNextToken();
}

// Helper to check if more elements are available in the input stream
function canReadNext() {
  return inputDataProcessor.hasMoreElements();
}

// Helper function to parse a string token into an integer
function getParsedInteger() {
  return transformData(pullNextElement(), 1);
}

// Helper function to get an array of strings by splitting the next token by space
function getStringArray() {
  return transformData(pullNextElement(), 2);
}

// Helper function to get an array of integers by splitting the next token by space
function getIntArray() {
  return transformData(pullNextElement(), 4);
}

// Helper function to get an array of characters by splitting the next token
function getCharArray() {
  return transformData(pullNextElement(), 6);
}

// Helper for joining arrays into strings
function joinWithSpaces(arr) { return transformData(arr, 8); }
function joinWithNewlines(arr) { return transformData(arr, 9); }
function joinWithoutSeparator(arr) { return transformData(arr, 0); }

// Core data transformation utility based on a specified type
// This function handles various parsing and formatting operations.
// The `conversionType` parameter dictates the desired transformation.
// Possible `conversionType` values:
// 1: Parse as integer.
// 2: Split string by spaces into an array of strings.
// 4: Split string by spaces and map to an array of numbers.
// 6: Split string into an array of characters.
// 7: Split string into an array of characters and map to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
function transformData(tokenValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(tokenValue, 10);
      case 2:
        return tokenValue.split(' ');
      case 4:
        // Using `map(Number)` is robust for converting string elements to numbers
        return tokenValue.split(' ').map(Number);
      case 6:
        return tokenValue.split('');
      case 7:
        return tokenValue.split('').map(Number);
      case 8:
        return tokenValue.join(' ');
      case 9:
        return tokenValue.join('\n');
      case 0:
        return tokenValue.join('');
      default:
        // Log a warning for unknown conversion types, but return original value
        logDiagnostic(`Warning: Unknown conversion type '${conversionType}'. Returning original value.`);
        return tokenValue;
    }
  } catch (operationError) {
    // If an error occurs during conversion, log it and return the original value
    logDiagnostic(`Error during data transformation (type ${conversionType}): ${operationError.message}`);
    return tokenValue;
  }
}

// Helper function to calculate the largest even number less than or equal to `num`
function getLargestEven(num) {
    // This effectively calculates `Math.floor(num / 2) * 2`
    return num - (num % 2);
}

// The main application logic resides here.
function executeMainLogic() {
  // Read the first line of input, which is expected to be a space-separated list of integers
  const rawCounts = getIntArray();

  // Assign input values to descriptive variables, representing counts of different block types
  const countI = rawCounts[0]; // Count of 'I' blocks
  const countO = rawCounts[1]; // Count of 'O' blocks
  const countT = rawCounts[2]; // Count of 'T' blocks (unused in calculation, but read)
  const countJ = rawCounts[3]; // Count of 'J' blocks
  const countL = rawCounts[4]; // Count of 'L' blocks
  const countS = rawCounts[5]; // Count of 'S' blocks (unused in calculation, but read)
  const countZ = rawCounts[6]; // Count of 'Z' blocks (unused in calculation, but read)

  // Calculate `totalEvenPairs`: Sum of even parts of I, J, and L blocks
  // This represents the maximum score achievable by pairing I, J, and L blocks.
  const totalEvenPairs = getLargestEven(countI) + getLargestEven(countJ) + getLargestEven(countL);

  let adjustedTripleScore = 0; // Initialize score for the 'triple' combination strategy

  // Check if it's possible to form a 'triple' combination (I, J, L) at least once
  const canFormInitialTriple = (countI >= 1 && countJ >= 1 && countL >= 1);

  if (canFormInitialTriple) {
    // If a triple can be formed, calculate the score:
    // 3 points for the initial triple, plus even pairs from remaining blocks (I-1, J-1, L-1)
    const remainingI = countI - 1;
    const remainingJ = countJ - 1;
    const remainingL = countL - 1;

    adjustedTripleScore = getLargestEven(remainingI) + getLargestEven(remainingJ) + getLargestEven(remainingL) + 3;
  }
  // If `canFormInitialTriple` is false, `adjustedTripleScore` remains 0 as initialized.

  // Determine the maximum score from the two strategies:
  // 1. Just summing even pairs (`totalEvenPairs`)
  // 2. Forming one triple and then summing even pairs from remaining blocks (`adjustedTripleScore`)
  const bestCombinationScore = Math.max(totalEvenPairs, adjustedTripleScore);

  // The final result is the best combination score plus the count of 'O' blocks
  // 'O' blocks always contribute directly to the score without complex pairing logic.
  const finalCalculatedResult = bestCombinationScore + countO;

  // Display the final result to the user
  displayOutput(finalCalculatedResult);
}