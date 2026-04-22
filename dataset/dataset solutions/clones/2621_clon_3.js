const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let dataStream;
const rawInputLines = [];

inputReader.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

inputReader.on('close', () => {
  dataStream = initializeStream(rawInputLines);
  executeSolution();
});

// Prepares an object for sequential token retrieval from an array of strings.
function initializeStream(sourceInput) {
  if (!Array.isArray(sourceInput) || sourceInput.length === 0) {
    // Return a dummy stream if no input is provided
    return {
      sourceLines: [],
      currentLineIndex: 0,
      totalLines: 0,
      hasMoreTokens: () => false,
      getNextToken: () => { throw new Error('No input available for processing.'); }
    };
  }

  return {
    sourceLines: sourceInput,
    currentLineIndex: 0,
    totalLines: sourceInput.length,
    hasMoreTokens: function() {
      return this.currentLineIndex < this.totalLines;
    },
    getNextToken: function() {
      if (this.hasMoreTokens()) {
        const nextToken = this.sourceLines[this.currentLineIndex];
        this.currentLineIndex++;
        return nextToken;
      } else {
        throw new Error('Input stream exhausted. No more tokens to read.');
      }
    }
  };
}

// Reads the next token from the stream and attempts to parse it as an integer.
function readInteger() {
  const token = dataStream.getNextToken();
  const parsedValue = Number(token); // More flexible than parseInt
  if (isNaN(parsedValue)) {
    throw new Error(`Failed to parse "${token}" as an integer. Input must be numeric.`);
  }
  return parsedValue;
}

// Prints the provided data to standard output.
function printOutput(dataToPrint) {
  console.log(dataToPrint);
}

// Centralized function for various input token processing and formatting tasks.
function processInputToken(tokenValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: // Convert to integer
        return Number(tokenValue);
      case 2: // Split string by space into an array of strings
        return String(tokenValue).split(' ');
      case 3: // Custom: Split string by comma into an array of strings
        return String(tokenValue).split(',');
      case 4: // Split string by space and convert elements to numbers
        return String(tokenValue).split(' ').map(Number);
      case 5: // Custom: Split string by comma and convert elements to numbers
        return String(tokenValue).split(',').map(Number);
      case 6: // Split string into an array of individual characters
        return String(tokenValue).split('');
      case 7: // Split string into characters and convert to numbers
        return String(tokenValue).split('').map(Number);
      case 8: // Join array elements with a single space
        return Array.isArray(tokenValue) ? tokenValue.join(' ') : String(tokenValue);
      case 9: // Join array elements with a newline character
        return Array.isArray(tokenValue) ? tokenValue.join('\n') : String(tokenValue);
      case 0: // Join array elements without any separator
        return Array.isArray(tokenValue) ? tokenValue.join('') : String(tokenValue);
      default: // Default case: return token as is, optionally log a warning
        // console.warn(`Warning: Unknown conversion type ${conversionType}. Returning token unchanged.`);
        return tokenValue;
    }
  } catch (error) {
    console.error(`Error during token conversion (type ${conversionType}): ${error.message}`);
    return tokenValue; // Return original token on conversion failure
  }
}

// Determines if a specific bit position has different values in two given numbers.
function areBitsDifferent(firstNumber, secondNumber, bitIndex) {
  const bitValueA = (firstNumber >>> bitIndex) & 1; // Unsigned right shift to get the bit
  const bitValueB = (secondNumber >>> bitIndex) & 1;
  return bitValueA !== bitValueB;
}

// The core logic of the program.
function executeSolution() {
  const inputSize = readInteger();

  // Guard clauses for edge or invalid input sizes
  if (inputSize < 0) {
    printOutput("Error: Input size cannot be negative.");
    return;
  }
  if (inputSize === 0) {
    printOutput(""); // No pairs to process, so no output
    return;
  }

  const generatedResults = []; // Stores the 1-indexed bit positions where differences are found.
  const MAX_BIT_CHECK = 10; // Defines the upper limit for bit position checks (0-9 for bits 1-10).

  // Iterate through all unique pairs (idx1, idx2) such that idx1 < idx2.
  for (let idx1 = 0; idx1 < inputSize - 1; idx1++) {
    for (let idx2 = idx1 + 1; idx2 < inputSize; idx2++) {
      // Check each bit position from 0 up to (but not including) MAX_BIT_CHECK.
      for (let bitPosition = 0; bitPosition < MAX_BIT_CHECK; bitPosition++) {
        // Utilize the helper function to compare bits.
        if (areBitsDifferent(idx1, idx2, bitPosition)) {
          const oneIndexedBit = bitPosition + 1; // Convert 0-indexed bit to 1-indexed for output.
          generatedResults.push(oneIndexedBit);
        }
      }
    }
  }

  // Format the collected results by joining them with newlines and print.
  const formattedOutput = processInputToken(generatedResults, 9);
  printOutput(formattedOutput);
}