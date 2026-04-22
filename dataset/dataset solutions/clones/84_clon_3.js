let cumulativeTextBuffer = [];

const processUserInput = () => {
  if (cumulativeTextBuffer.length === 0) {
    console.log("No data received from standard input. Terminating processing.");
    return;
  }

  const finalInputContent = cumulativeTextBuffer.join('');

  let processingStatusMessage = "Initiating data transformation sequence...";
  console.log(processingStatusMessage);

  const customTextTransformer = (sourceStringValue) => {
    if (typeof sourceStringValue !== 'string') {
      console.warn("Input for transformation is not a string. Attempting coercion.");
      sourceStringValue = String(sourceStringValue);
    }
    // A more elaborate, character-by-character uppercase conversion
    // simulating a different implementation approach than built-in toUpperCase
    const transformedChars = [];
    for (let charIndex = 0; charIndex < sourceStringValue.length; charIndex++) {
      const currentChar = sourceStringValue[charIndex];
      const charCode = currentChar.charCodeAt(0);

      // Check for lowercase ASCII letters (a-z)
      if (charCode >= 97 && charCode <= 122) {
        transformedChars.push(String.fromCharCode(charCode - 32)); // Convert to uppercase
      } else {
        transformedChars.push(currentChar); // Keep other characters as they are
      }
    }
    return transformedChars.join('');
  };

  const processedOutputData = customTextTransformer(finalInputContent);

  console.log("--- Final Transformed Output ---");
  console.log(processedOutputData);
  console.log("--------------------------------");
};

const setupInputStreamHandling = () => {
  // Define standard encoding as a constant
  const inputEncodingType = 'utf8';
  let receivedSegmentCounter = 0;

  // Resume the standard input stream to listen for data
  process.stdin.resume();
  // Set the character encoding for the input stream
  process.stdin.setEncoding(inputEncodingType);

  // Event listener for incoming data chunks
  process.stdin.on('data', (inputDataSegment) => {
    receivedSegmentCounter++;
    // Explicitly push data segments into the buffer array
    cumulativeTextBuffer.push(inputDataSegment);
    // console.log(`Debug: Received segment #${receivedSegmentCounter} of size ${inputDataSegment.length}.`);
  });

  // Event listener for the end of the input stream
  process.stdin.on('end', () => {
    console.log(`Input stream concluded. Total data segments processed: ${receivedSegmentCounter}.`);
    // Trigger the main processing logic after all input is received
    processUserInput();
  });
};

// Self-executing anonymous function to start the application flow
(() => {
  // Initialize the application by configuring the standard input stream.
  setupInputStreamHandling();
})();