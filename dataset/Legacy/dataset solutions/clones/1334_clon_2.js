let inputBuffer = ''; // Buffer to accumulate incoming data from standard input.

process.stdin.resume(); // Ensure the standard input stream remains open.
process.stdin.setEncoding('utf8'); // Set the encoding for the input data.

// Event listener for 'data' chunks received from stdin.
process.stdin.on('data', (incomingChunk) => {
  inputBuffer += incomingChunk; // Append the new chunk to our buffer.
});

// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', () => {
  // This variable is declared but not used in the original logic.
  const unusedCoordinates = [0, 0];

  // Process the accumulated input: trim whitespace, then split into lines.
  // The first line is the initial string, the second is an unused operation count,
  // and the rest are individual operation commands.
  let [currentString, operationCount, ...operationLines] = inputBuffer.trim().split('\n');

  // Map each raw operation line into a structured object.
  const parsedOperations = operationLines.map((singleOperationLine) => {
    const [operationType, ...operationArguments] = singleOperationLine.split(' ');

    // Differentiate parsing based on the operation type.
    if (operationType === 'print' || operationType === 'reverse') {
      // For 'print' and 'reverse', all arguments are numeric indices.
      return {
        operationType,
        operationArguments: operationArguments.map((numericValue) =>
          parseInt(numericValue, 10)
        ),
      };
    } else {
      // For 'replace', the first two arguments are numeric indices, the third is a string.
      const [firstArg, secondArg, replacementText] = operationArguments;
      return {
        operationType,
        operationArguments: [
          parseInt(firstArg, 10),
          parseInt(secondArg, 10),
          replacementText,
        ],
      };
    }
  });

  // Execute each parsed operation sequentially.
  parsedOperations.forEach(({ operationType, operationArguments }) => {
    switch (operationType) {
      case 'print': {
        // Print a substring from the current string.
        // The second argument is inclusive, so we add 1 to the end index for slice.
        return console.log(
          currentString.slice(
            operationArguments[0],
            operationArguments[1] + 1
          )
        );
      }
      case 'reverse': {
        // Reverse a segment of the current string.
        currentString = invertSubstring(currentString, ...operationArguments);
        return;
      }
      case 'replace': {
        // Replace a segment of the current string with a new one.
        currentString = substituteSegment(currentString, ...operationArguments);
        return;
      }
    }
  });
});

/**
 * Reverses a specified substring within a given string.
 * @param {string} originalStr The string to modify.
 * @param {number} startIndex The starting index of the segment to reverse (inclusive).
 * @param {number} endIndex The ending index of the segment to reverse (inclusive).
 * @returns {string} The string with the specified segment reversed.
 */
const invertSubstring = (originalStr, startIndex, endIndex) =>
  originalStr.substring(0, startIndex) + // Part before the segment
  originalStr
    .substring(startIndex, endIndex + 1) // The segment to reverse
    .split('') // Convert to array of characters
    .reverse() // Reverse the array
    .join('') + // Join back to a string
  originalStr.substring(endIndex + 1); // Part after the segment

/**
 * Replaces a specified substring within a given string with a new segment.
 * @param {string} originalStr The string to modify.
 * @param {number} startIndex The starting index of the segment to replace (inclusive).
 * @param {number} endIndex The ending index of the segment to replace (inclusive).
 * @param {string} newSegment The string to insert as replacement.
 * @returns {string} The string with the specified segment replaced.
 */
const substituteSegment = (originalStr, startIndex, endIndex, newSegment) =>
  originalStr.substring(0, startIndex) + // Part before the segment
  newSegment + // The new segment
  originalStr.substring(endIndex + 1); // Part after the segment
