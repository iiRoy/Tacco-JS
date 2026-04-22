let receivedData = ''; // Buffer to accumulate all incoming data from stdin

// Resume the standard input stream to listen for data
process.stdin.resume();

// Set the character encoding for the input stream
process.stdin.setEncoding('utf8');

// Attach a listener for 'data' events, appending chunks to the buffer
process.stdin.on('data', (dataPortion) => {
  receivedData += dataPortion; // Concatenate the new data chunk
});

// Attach a listener for the 'end' event, indicating all input has been received
process.stdin.on('end', () => {
  // An array for potential internal state, initialized with arbitrary values (unused)
  const initialValues = [1, 1];

  // Trim whitespace, then split the accumulated data by newline characters.
  // Destructure into the primary string, an unused operation count, and command lines.
  let [targetString, numOperations, ...commandLines] = receivedData.trim().split('\n');

  // Map each raw command line into a structured operation object
  const actionList = commandLines.map((rawCommand) => {
    // Split the command line by space to get the action type and its parameters
    const [actionType, ...parameters] = rawCommand.split(' ');

    // For 'print' and 'reverse' actions, all parameters are numeric indices
    if (actionType === 'print' || actionType === 'reverse') {
      return {
        actionType,
        parameters: parameters.map((numericString) => parseInt(numericString, 10)),
      };
    } else {
      // For 'replace' action, parameters are two numeric indices and a string
      const [firstPos, secondPos, substituteText] = parameters;
      return {
        actionType,
        parameters: [parseInt(firstPos, 10), parseInt(secondPos, 10), substituteText],
      };
    }
  });

  // Iterate over the parsed operation objects and execute each action
  actionList.forEach(({actionType, parameters}) => {
    switch (actionType) {
      case 'print': {
        // Log a substring of the target string based on start and end indices
        const startIdx = parameters[0];
        const endIdx = parameters[1];
        return console.log(targetString.slice(startIdx, endIdx + 1));
      }
      case 'reverse': {
        // Apply the flipSegment function to reverse a part of the target string
        targetString = flipSegment(targetString, ...parameters);
        return; // Terminate this case execution
      }
      case 'replace': {
        // Apply the substituteSegment function to replace a part of the target string
        targetString = substituteSegment(targetString, ...parameters);
        return; // Terminate this case execution
      }
    }
  });
});

/**
 * Reverses a specified segment within a given string.
 *
 * @param {string} originalStr The string to be modified.
 * @param {number} startIdx The zero-based starting index of the segment to reverse.
 * @param {number} endIdx The zero-based ending index of the segment to reverse.
 * @returns {string} The new string with the specified segment reversed.
 */
const flipSegment = (originalStr, startIdx, endIdx) =>
  originalStr.substring(0, startIdx) + // The part of the string before the segment
  originalStr
    .substring(startIdx, endIdx + 1) // Extract the segment to be reversed
    .split('') // Convert the segment to an array of characters
    .reverse() // Reverse the array of characters
    .join('') + // Join the characters back into a string
  originalStr.substring(endIdx + 1); // The part of the string after the segment

/**
 * Replaces a specified segment within a string with new content.
 *
 * @param {string} originalStr The string to be modified.
 * @param {number} startIdx The zero-based starting index of the segment to replace.
 * @param {number} endIdx The zero-based ending index of the segment to replace.
 * @param {string} newContent The string to insert as a replacement.
 * @returns {string} The new string with the specified segment replaced.
 */
const substituteSegment = (originalStr, startIdx, endIdx, newContent) =>
  originalStr.substring(0, startIdx) + // The part of the string before the segment
  newContent + // The new content to be inserted
  originalStr.substring(endIdx + 1); // The part of the string after the segment