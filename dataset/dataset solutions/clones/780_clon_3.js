// This JavaScript module implements an advanced text decoder for numeric keypad sequences,
// transforming sequences of key presses (similar to old T9 mobile phones) into readable text.
// It includes robust input handling, enhanced error checking, and a more precise decoding algorithm.

// A dedicated buffer to accumulate all incoming raw data from the standard input stream.
let incomingDataBuffer = '';

// Configure the standard input to ensure continuous reading and proper character interpretation.
process.stdin.resume(); // Prevents the process from terminating before input is fully received.
process.stdin.setEncoding('utf8'); // Specifies UTF-8 to correctly handle various characters.

// Event listener triggered whenever new data chunks arrive from the standard input.
process.stdin.on('data', (dataSegment) => {
  incomingDataBuffer += dataSegment; // Concatenate the new data segment to our buffer.
});

// Event listener activated when the entire standard input stream has concluded.
process.stdin.on('end', () => {
  // Process the accumulated data: split into lines and filter out any empty or whitespace-only lines.
  const parsedInputRecords = incomingDataBuffer
    .split('\n')
    .filter(lineContent => lineContent.trim().length > 0);

  // Once input is prepared, initiate the primary text decoding process.
  beginTextDecodingProcess(parsedInputRecords);
});

// The core mapping of numeric keypad digits to their corresponding character sets.
// Index 0 is deliberately empty as the '0' key serves as a sequence separator.
const characterKeyMappings = [
  [],                               // Key 0: Reserved for sequence termination.
  ['.', ',', '!', '?', ' '],        // Key 1: Punctuation and space.
  ['a', 'b', 'c'],                  // Key 2: 'abc'
  ['d', 'e', 'f'],                  // Key 3: 'def'
  ['g', 'h', 'i'],                  // Key 4: 'ghi'
  ['j', 'k', 'l'],                  // Key 5: 'jkl'
  ['m', 'n', 'o'],                  // Key 6: 'mno'
  ['p', 'q', 'r', 's'],             // Key 7: 'pqrs'
  ['t', 'u', 'v'],                  // Key 8: 'tuv'
  ['w', 'x', 'y', 'z']              // Key 9: 'wxyz'
];

/**
 * Retrieves a specific character from the `characterKeyMappings` based on the key digit
 * and the number of times it was pressed.
 * This function encapsulates the logic for mapping key presses to characters,
 * including handling cycles within a character set.
 *
 * @param {number} digitKey - The numeric key that was pressed (1-9).
 * @param {number} totalPresses - The count of consecutive presses for the `digitKey`.
 * @returns {string} The decoded character, or an empty string if the input is invalid
 *                   or no character is found for the given combination.
 */
function resolveCharacterFromPresses(digitKey, totalPresses) {
  // Perform basic validation to ensure valid key and press counts.
  if (digitKey < 1 || digitKey > 9 || totalPresses < 1) {
    // console.debug(`Invalid input for character resolution: Key=${digitKey}, Presses=${totalPresses}`);
    return ''; // Return an empty string for invalid inputs.
  }

  const associatedChars = characterKeyMappings[digitKey];

  // Check if a character set exists for the given digit key.
  if (!associatedChars || associatedChars.length === 0) {
    // console.debug(`No character set defined for digit key: ${digitKey}`);
    return ''; // No characters mapped to this key.
  }

  // Calculate the 0-based index for the character within its set.
  // The modulo operator ensures cycling through the characters if `totalPresses`
  // exceeds the number of characters in the set (e.g., 5 presses for 'abc' will yield 'b').
  const targetCharIndex = (totalPresses - 1) % associatedChars.length;

  return associatedChars[targetCharIndex];
}

/**
 * Decodes a single sequence of numeric key presses into a plain text message.
 * The '0' digit acts as an explicit terminator for a sequence of repeated key presses.
 * If a new key is pressed, it implicitly terminates the previous sequence.
 *
 * @param {string} rawKeyPressSequence - The input string representing the key presses (e.g., "222033").
 * @returns {string} The resulting decoded text message.
 */
function decodeKeypadSequence(rawKeyPressSequence) {
  // Handle edge case: empty or invalid input sequence.
  if (!rawKeyPressSequence || rawKeyPressSequence.length === 0) {
    return '';
  }

  let finalDecodedMessage = ''; // Buffer to build the decoded string.
  let activeDigit = '';         // Stores the current digit being pressed repeatedly.
  let consecutivePressCount = 0; // Counts how many times `activeDigit` has been pressed.

  // Iterate over each character in the input sequence.
  for (let charPosition = 0; charPosition < rawKeyPressSequence.length; ++charPosition) {
    const currentKeyPress = rawKeyPressSequence[charPosition];

    // Case 1: The current key press is '0', which explicitly terminates the current sequence.
    if (currentKeyPress === '0') {
      // If there was an active sequence, decode and append its character.
      if (consecutivePressCount > 0 && activeDigit !== '') {
        const numericKey = Number(activeDigit);
        finalDecodedMessage += resolveCharacterFromPresses(numericKey, consecutivePressCount);
      }
      // Reset for the next potential sequence.
      activeDigit = '';
      consecutivePressCount = 0;
    }
    // Case 2: The current key press is a digit other than '0'.
    else {
      // Sub-case 2a: It's the same digit as the `activeDigit`.
      if (currentKeyPress === activeDigit) {
        consecutivePressCount++; // Increment the repetition count.
      }
      // Sub-case 2b: It's a different digit from the `activeDigit`, implying
      // the previous sequence (if any) is implicitly terminated.
      else {
        // First, decode and append the character from the *previous* active sequence.
        if (consecutivePressCount > 0 && activeDigit !== '') {
          const numericKey = Number(activeDigit);
          finalDecodedMessage += resolveCharacterFromPresses(numericKey, consecutivePressCount);
        }
        // Then, start a new sequence with the current key press.
        activeDigit = currentKeyPress;
        consecutivePressCount = 1; // This is the first press of the new active digit.
      }
    }
  }

  // Critical Post-loop check: After processing the entire sequence,
  // there might be a pending sequence that wasn't terminated by a '0'.
  // This ensures inputs like "222" (which should decode to 'c') are correctly handled.
  if (consecutivePressCount > 0 && activeDigit !== '') {
    const numericKey = Number(activeDigit);
    finalDecodedMessage += resolveCharacterFromPresses(numericKey, consecutivePressCount);
  }

  return finalDecodedMessage; // Return the fully decoded message.
}

/**
 * Orchestrates the decoding process for multiple test cases provided in the input.
 * This is the entry point after all standard input has been received.
 *
 * @param {string[]} allInputRecords - An array where the first element is the total
 *                                     number of decoding challenges, and subsequent
 *                                     elements are the key press sequences for each challenge.
 */
function beginTextDecodingProcess(allInputRecords) {
  // Initial validation: Ensure there's at least some input to process.
  if (!allInputRecords || allInputRecords.length === 0) {
    console.error("System Error: No input records detected for decoding. Aborting.");
    return;
  }

  // Parse the total number of decoding challenges from the first input line.
  const totalChallengesToProcess = parseInt(allInputRecords[0], 10);

  // Validate the parsed number of challenges.
  if (isNaN(totalChallengesToProcess) || totalChallengesToProcess < 0) {
    console.error(`Input Error: Invalid challenge count specified: "${allInputRecords[0]}". Expected a non-negative integer.`);
    return;
  }

  // Iterate through each challenge, starting from the second record in the input array.
  // The loop runs for the exact `totalChallengesToProcess` count.
  for (let challengeIterator = 0; challengeIterator < totalChallengesToProcess; ++challengeIterator) {
    // Calculate the actual index for the current challenge's key press sequence.
    // We add 1 because the first element (index 0) is the challenge count itself.
    const currentSequenceIndex = challengeIterator + 1;

    // Guard against insufficient input lines compared to the declared challenge count.
    if (currentSequenceIndex >= allInputRecords.length) {
      console.warn(`Warning: Input record missing for challenge #${challengeIterator + 1}. Expected ${totalChallengesToProcess} challenges, but ran out of data.`);
      break; // Exit the loop gracefully if input is exhausted.
    }

    const currentChallengeSequence = allInputRecords[currentSequenceIndex];

    // Execute the decoding for the current key press sequence.
    const decodedChallengeOutput = decodeKeypadSequence(currentChallengeSequence);

    // Display the decoded result for the current challenge to the standard output.
    console.log(decodedChallengeOutput);
  }
}