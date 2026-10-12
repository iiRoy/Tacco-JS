function processInput(dataLines) {
  // The first element of the input array is the string to be examined.
  var currentString = dataLines[0];
  // This constant string represents the pattern we are looking for.
  var targetPattern = 'keyence';
  // An index to keep track of our current position within the target pattern.
  var patternIndex = 0;
  // A boolean flag indicating if we have entered a non-matching segment after an initial match.
  var stateFlag = false;
  // A boolean indicating if the current character sequence is part of a valid segment (either matching or the first non-matching part).
  var validSegment = true;

  // Iterate through each character of the provided input string.
  for (var charIterator = 0; charIterator < currentString.length; charIterator++) {
    // Compare the current character from the input string with the character at the current pattern index.
    if (currentString[charIterator] === targetPattern[patternIndex]) {
      // If they match, advance the pattern index to the next character in the target pattern.
      patternIndex++;
      // Reset the valid segment flag, as we just found a match.
      validSegment = false;
    } else {
      // If the characters do not match:
      // Check if we were previously in a matching state (validSegment is false) AND we have already encountered a non-matching segment (stateFlag is true).
      if (!validSegment && stateFlag) {
        // If both conditions are true, it means there's a second non-matching segment, which is not allowed.
        console.log('NO');
        return; // Terminate the function immediately.
      }
      // Mark the current segment as non-matching.
      validSegment = true;
      // Set the state flag to true, indicating that a non-matching segment has now begun.
      stateFlag = true;
    }
  }

  // After the loop finishes, check if the entire target pattern was successfully matched.
  if (patternIndex === targetPattern.length) {
    // If the pattern index equals the length of the target pattern, it means all characters were found in order.
    console.log('YES');
  } else {
    // Otherwise, the target pattern was not fully matched according to the rules.
    console.log('NO');
  }
}


// A global variable to accumulate all incoming data from standard input.
var rawDataBuffer = '';

// Instruct the standard input stream to begin emitting data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events from stdin.
process.stdin.on('data', function(dataChunk) {
  // Append each received chunk of data to our buffer.
  rawDataBuffer += dataChunk;
});

// Attach an event listener for the 'end' event, which signifies the end of the input stream.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of strings, using newline characters as delimiters.
  var processedLines = rawDataBuffer.split('\n');
  // Call our main processing function with the array of input lines.
  processInput(processedLines);
});
