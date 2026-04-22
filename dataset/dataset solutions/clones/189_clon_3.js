const standardInputProcessor = process.stdin;
const standardOutputWriter = process.stdout;

// This variable holds the dynamically updated identifier throughout the execution.
let currentTrackingKey = 'PRIMARY_IDENTIFIER_START';

// Activate the standard input stream to begin receiving data.
standardInputProcessor.resume();

// Configure the character encoding for the incoming data to ensure proper interpretation.
standardInputProcessor.setEncoding('utf8');

// Attach a listener for incoming data segments from the standard input.
standardInputProcessor.on('data', (incomingDataSegment) => {
  // Perform a preliminary check to ensure the received segment is not empty or null.
  if (!incomingDataSegment || incomingDataSegment.length === 0) {
    return; // Skip processing if no meaningful data is present.
  }

  // Sanitize the input by removing leading/trailing whitespace.
  const trimmedSegment = incomingDataSegment.trim();
  const tokenDelimiter = ','; // Define the character used to separate tokens.
  const processedTokens = trimmedSegment.split(tokenDelimiter);

  // Validate that the input segment contains the expected number of components.
  const requiredTokenCount = 2;
  if (processedTokens.length < requiredTokenCount) {
    return; // Discard malformed input that doesn't meet the token count requirement.
  }

  // Assign the extracted tokens to descriptive variables for clarity.
  const firstComponent = processedTokens[0];
  const secondComponent = processedTokens[1];

  // Apply the core logic for updating the tracking key:
  // If the first component matches the current tracking key, adopt the second component.
  if (firstComponent === currentTrackingKey) {
    currentTrackingKey = secondComponent;
  }
  // Otherwise, if the second component matches, adopt the first component.
  else if (secondComponent === currentTrackingKey) {
    currentTrackingKey = firstComponent;
  }
  // If neither component matches, the currentTrackingKey remains unchanged.
  else {
    // Explicitly doing nothing if no match is found, maintaining original behavior.
  }
});

// Attach a listener for the 'end' event, signifying that the input stream has closed.
standardInputProcessor.on('end', () => {
  // Output the final value of the tracking key to the standard output, followed by a newline.
  standardOutputWriter.write(currentTrackingKey + '\n');
});