// This module processes input sequences, decoding them based on a simulated
// numeric keypad input method. It reads all data from standard input,
// then processes each line as a separate decoding task.

// Buffer to store all incoming data chunks from standard input.
let fullInputBufferAccumulator = '';

// Constant definition for the character that signifies a separation
// between sequences of the same digit.
const SEQUENCE_TERMINATOR_CHAR = '0';

// A lookup table representing the characters available on a standard
// numeric keypad. The index corresponds to the digit pressed.
// Note: Index 0 is reserved for the terminator; index 1 has special punctuation.
const keypadCharacterMap = [
  [],                                       // Digit 0: No character mapping, acts as a separator.
  ['.', ',', '!', '?', ' '],                // Digit 1: Punctuation and space.
  ['a', 'b', 'c'],                          // Digit 2: ABC.
  ['d', 'e', 'f'],                          // Digit 3: DEF.
  ['g', 'h', 'i'],                          // Digit 4: GHI.
  ['j', 'k', 'l'],                          // Digit 5: JKL.
  ['m', 'n', 'o'],                          // Digit 6: MNO.
  ['p', 'q', 'r', 's'],                     // Digit 7: PQRS.
  ['t', 'u', 'v'],                          // Digit 8: TUV.
  ['w', 'x', 'y', 'z']                      // Digit 9: WXYZ.
];

// Configure standard input: set encoding and resume reading.
process.stdin.setEncoding('utf8');
process.stdin.resume();

// Event handler for incoming data chunks from stdin.
process.stdin.on('data', (incomingDataChunk) => {
  fullInputBufferAccumulator += incomingDataChunk; // Append to the global buffer.
});

// Event handler for the end of standard input stream.
process.stdin.on('end', () => {
  // Split the accumulated input into individual lines, filtering out any empty strings
  // that might result from trailing newlines.
  const processedInputLines = fullInputBufferAccumulator
    .split('\n')
    .map(line => line.trim()) // Trim whitespace from each line.
    .filter(line => line.length > 0); // Exclude truly empty lines.

  executeBatchDecoding(processedInputLines); // Initiate the main processing logic.
});

/**
 * Decodes a single input string representing a sequence of keypad presses.
 * Digits are pressed consecutively, '0' acts as a separator to finalize a character.
 *
 * @param {string} pressInputString The string of digits to be decoded.
 * @returns {string} The resulting decoded message.
 */
function decodeKeypadInput(pressInputString) {
  // Basic validation: if input is not a string or is empty, return an empty result.
  if (typeof pressInputString !== 'string' || pressInputString.length === 0) {
    return '';
  }

  let finalDecodedMessage = ''; // Accumulator for the decoded characters.
  let currentActiveKey = '';    // Stores the digit currently being pressed.
  let consecutivePressCount = 0; // Counts how many times `currentActiveKey` has been pressed.

  // Helper function to process and append a character if a sequence is active.
  const appendCharacterIfActive = () => {
    if (consecutivePressCount > 0 && currentActiveKey !== '') {
      const digitAsNumber = parseInt(currentActiveKey, 10);

      // Ensure the digit is valid for character mapping (1-9).
      if (digitAsNumber >= 1 && digitAsNumber <= 9) {
        const availableCharacters = keypadCharacterMap[digitAsNumber];
        if (availableCharacters && availableCharacters.length > 0) {
          // Calculate the index based on consecutive presses, wrapping around if needed.
          const charIndexToSelect = (consecutivePressCount - 1) % availableCharacters.length;
          finalDecodedMessage += availableCharacters[charIndexToSelect];
        }
      }
    }
  };

  // Iterate through each character in the input sequence string.
  for (let charPosition = 0; charPosition < pressInputString.length; charPosition++) {
    const charFromInput = pressInputString[charPosition];

    if (charFromInput === SEQUENCE_TERMINATOR_CHAR) {
      // Encountered a '0': finalize any active digit sequence.
      appendCharacterIfActive();
      // Reset state for the next sequence.
      currentActiveKey = '';
      consecutivePressCount = 0;
    } else {
      // Encountered a non-zero digit.
      if (charFromInput === currentActiveKey) {
        // Same digit pressed again, increment count.
        consecutivePressCount++;
      } else {
        // A new digit has been pressed, or it's the start of the first sequence.
        // First, finalize any previously active digit sequence.
        appendCharacterIfActive();
        // Then, start a new sequence with the current digit.
        currentActiveKey = charFromInput;
        consecutivePressCount = 1; // This is the first press of the new digit.
      }
    }
  }

  // After the loop finishes, there might be an unfinished sequence at the end of the string.
  // Process it if it exists.
  appendCharacterIfActive();

  return finalDecodedMessage;
}

/**
 * Orchestrates the decoding process for multiple input lines.
 * The first line is expected to be the number of test cases.
 *
 * @param {string[]} allInputLines An array of strings, where each string is a line from input.
 */
function executeBatchDecoding(allInputLines) {
  // Validate if input lines are provided.
  if (!allInputLines || allInputLines.length === 0) {
    console.error("Critical Error: No input data received for processing.");
    return;
  }

  // Attempt to parse the number of test cases from the first line.
  const totalTestCases = parseInt(allInputLines[0], 10);

  // Validate the parsed number of test cases.
  if (isNaN(totalTestCases) || totalTestCases < 0) {
    console.error(`Input Error: First line "${allInputLines[0]}" is not a valid non-negative number of test cases.`);
    return;
  }

  // Iterate through the remaining lines, starting from the second line (index 1).
  // Each line corresponds to one test case's input sequence.
  for (let caseIterator = 0; caseIterator < totalTestCases; caseIterator++) {
    // The actual sequence for the current test case is at index `caseIterator + 1`.
    const currentSequenceToDecode = allInputLines[caseIterator + 1];

    if (typeof currentSequenceToDecode === 'string') {
      // Decode the sequence and print the result to standard output.
      const outputForThisCase = decodeKeypadInput(currentSequenceToDecode);
      console.log(outputForThisCase);
    } else {
      // Log a warning if an expected input line is missing.
      console.warn(`Data Warning: Input sequence missing for test case number ${caseIterator + 1}. Skipping.`);
      console.log(''); // Output an empty line for missing cases to maintain output structure.
    }
  }
}