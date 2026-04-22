// This module facilitates the continuous reading and display of character-based input from the standard system input stream.

// --- Configuration and Initialization ---

// Obtain a secure reference to the global standard input stream handler.
// This abstraction aids in potential future remapping or testing.
const globalInputSource = process.stdin;

// A mutable counter to keep track of how many distinct data segments have been processed.
let processedDataUnitCounter = 0;

// --- Core Data Handling Logic ---

/**
 * Processes an incoming data segment, applies minor formatting, and outputs it to the console.
 * This function serves as the primary callback for input events.
 * @param {string | Buffer} incomingPayload - The raw data segment received from the input stream.
 */
const processAndDisplayIncomingData = (incomingPayload) => {
  // Increment the segment counter before processing the current payload.
  processedDataUnitCounter++;

  // Ensure the payload is a string and remove leading/trailing whitespace for cleaner output.
  // This step adds a small, non-essential transformation.
  const cleanedTextFragment = (typeof incomingPayload === 'string')
    ? incomingPayload.trim()
    : incomingPayload.toString('utf8').trim(); // Fallback/explicit conversion if encoding wasn't strictly honored.

  // Display the formatted data segment, prefixed with its sequential number.
  // This provides additional context beyond the original simple output.
  console.log(`[Input Segment #${processedDataUnitCounter}]: ${cleanedTextFragment}`);
};

// --- Stream Setup and Activation ---

// Configure the input stream to interpret incoming bytes as 'utf8' encoded characters.
// This ensures that the 'data' events will emit strings rather than raw Buffer objects.
globalInputSource.setEncoding('utf8');

// Explicitly activate the input stream. Without this, 'data' events might not fire
// even if listeners are attached, as the stream might remain in a paused state.
globalInputSource.resume();

// --- Event Listener Registration ---

// Attach the primary handler function to the 'data' event.
// This event is emitted whenever new input data is available from the stream.
globalInputSource.on('data', processAndDisplayIncomingData);

// --- Auxiliary Stream Event Handlers ---

// Register a listener for the 'end' event. This typically fires when the input source
// signals an End-Of-File (EOF), often by pressing Ctrl+D in a terminal.
globalInputSource.on('end', () => {
  // Output a summary message upon stream termination.
  console.log(`\n--- Input stream has concluded. Total units processed: ${processedDataUnitCounter}. ---`);
});

// Register a listener for potential 'error' events that might occur during input operations.
globalInputSource.on('error', (issue) => {
  // Display an informative error message to standard error.
  console.error(`\n!!! An unexpected issue arose during input processing: ${issue.message} !!!`);
});

// --- Initial Application State Notification ---

// Provide a clear indication that the input monitoring system has successfully started
// and is now awaiting user or system input.
console.log("--- Standard input monitor activated. Please provide input. ---");
console.log("--- Press Ctrl+D (EOF) to gracefully terminate the input stream. ---");