process.stdin.resume();

process.stdin.setEncoding('utf8'); // Set the character encoding for incoming data

process.stdin.on('data', handleIncomingData); // Register a callback for data events

/**
 * Processes chunks of data received from standard input.
 * Each line is treated as a separate ciphered message to be processed.
 * @param {string} inputChunk - The raw data string received from stdin.
 */
function handleIncomingData(inputChunk) {
  // Split the input chunk by newline characters and iterate over each line.
  inputChunk.split('\n').forEach(attemptDecryption);
}

/**
 * Recursively attempts to decrypt a given string by applying a Caesar cipher shift.
 * It checks for specific keywords ("the", "this", "that") after each shift.
 * If a keyword is found, the deciphered string is printed to standard output.
 * The function iterates through all 26 possible shifts.
 *
 * @param {string} encryptedMessage - The string that needs to be deciphered.
 * @param {number} [currentShift=0] - The current shift amount to apply, starting from 0.
 */
function attemptDecryption(encryptedMessage, currentShift) {
  // Apply a Caesar cipher shift to all lowercase English letters in the message.
  let shiftedMessage = String(encryptedMessage).replace(/[a-z]/g, function(originalChar) {
    // Calculate the new character code after applying a single shift.
    const asciiBase = 0x61; // ASCII value for 'a'
    const charCodeVal = originalChar.charCodeAt(0);
    const newCharCode = asciiBase + (charCodeVal - asciiBase + 1) % 26;
    return String.fromCharCode(newCharCode);
  });

  // Check if the currently shifted message contains any of the target keywords.
  if (/the|this|that/.test(shiftedMessage)) {
    // If a keyword is detected, output the deciphered message followed by a newline.
    process.stdout.write(shiftedMessage + '\n');
  }

  // Ensure the shift counter is an integer, defaulting to 0 if not provided.
  currentShift |= 0;

  // If not all 26 possible shifts have been tried, recurse with the new shifted message.
  if (currentShift < 26) {
    attemptDecryption(shiftedMessage, ++currentShift);
  }
}
