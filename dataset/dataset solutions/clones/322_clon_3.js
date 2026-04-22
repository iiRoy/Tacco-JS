// This module initializes a standard input stream listener, accumulates all incoming data,
// and upon stream completion, performs a specific string transformation.
// It is designed to process text-based input from the command line or piped sources.

let collectedInputSegments = []; // Stores individual chunks received from stdin.
let totalCharacterCount = 0;     // Accumulates the total length of all received data.
let segmentReceptionCounter = 0; // Tracks the number of data segments received.

// Configuration constants for the text transformation logic.
const TARGET_SUBSTRING_TO_LOCATE = 'Hoshino';
const SUBSTITUTION_STRING_VALUE = 'Hoshina';

// Limits the number of detailed console logs for incoming data segments to prevent flood.
const VERBOSE_SEGMENT_LOG_THRESHOLD = 3;

/**
 * Processes a given text string by applying a specific replacement rule.
 * Includes validation checks for empty input and presence of the target substring.
 *
 * @param {string} originalContent - The text content to be processed.
 * @param {string} searchFor - The specific substring to find within the content.
 * @param {string} replaceWith - The string to use as a replacement.
 * @returns {string} The modified content or a status message if no transformation occurs.
 */
function applyContentTransformation(originalContent, searchFor, replaceWith) {
  // --- Input Validation and Guard Clauses ---
  if (originalContent === null || originalContent === undefined || originalContent.trim().length === 0) {
    console.warn("[Transformation_Engine] Received empty or purely whitespace content. Skipping transformation.");
    return "[EMPTY_OR_INVALID_INPUT]"; // Return a specific indicator for empty input.
  }

  if (!originalContent.includes(searchFor)) {
    console.info(`[Transformation_Engine] The target substring "${searchFor}" was not detected in the input. Content returned unchanged.`);
    return originalContent; // Return the original content if the target isn't found.
  }

  // --- Core Transformation Logic ---
  // The standard `replace` method in JavaScript replaces only the first occurrence.
  let transformedContent = originalContent.replace(searchFor, replaceWith);
  console.log(`[Transformation_Engine] Successfully applied transformation: '${searchFor}' replaced.`);

  return transformedContent;
}

// --- Standard Input Stream Setup ---

// Ensure the standard input stream is active and ready to emit data events.
// This is crucial for interactive input or piped data to flow.
process.stdin.resume();

// Configure the input stream to decode incoming bytes into 'utf8' strings.
// This simplifies handling text data directly without manual buffer decoding.
process.stdin.setEncoding('utf8');

// --- Event Listener for Incoming Data ---
process.stdin.on('data', function handleDataReception(receivedChunk) {
  segmentReceptionCounter++;
  totalCharacterCount += receivedChunk.length;
  collectedInputSegments.push(receivedChunk);

  // Log initial data chunks in detail, then switch to a more summarized message.
  if (segmentReceptionCounter <= VERBOSE_SEGMENT_LOG_THRESHOLD) {
    console.debug(`[Stream_Monitor] Segment #${segmentReceptionCounter} received: ${receivedChunk.length} characters.`);
  } else if (segmentReceptionCounter === VERBOSE_SEGMENT_LOG_THRESHOLD + 1) {
    console.debug(`[Stream_Monitor] Further segments are arriving... (per-segment logging suppressed for brevity).`);
  }
});

// --- Event Listener for Stream End ---
process.stdin.on('end', function processStreamCompletion() {
  console.log(`\n[Stream_Monitor] End of input stream detected. Total segments: ${segmentReceptionCounter}, Accumulated characters: ${totalCharacterCount}.`);

  // Concatenate all collected segments into a single, complete string payload.
  let finalInputPayload = collectedInputSegments.join('');

  // Invoke the transformation engine with the complete payload and defined constants.
  let processedOutput = applyContentTransformation(
    finalInputPayload,
    TARGET_SUBSTRING_TO_LOCATE,
    SUBSTITUTION_STRING_VALUE
  );

  // Output the final transformed or original content.
  console.log("\n==== FINAL PROCESSED RESULT ====");
  console.log(processedOutput);
  console.log("================================");

  // Explicitly exit the process with a success code.
  process.exit(0);
});

// --- Optional: Error Handling for the Input Stream ---
process.stdin.on('error', function handleStreamError(errorObject) {
  console.error(`[CRITICAL_ERROR] An unhandled error occurred during stdin processing: ${errorObject.message}`);
  // Exit the process with an error code to indicate failure.
  process.exit(1);
});

// --- Initial User Guidance ---
// Inform the user how to provide input and signal its end.
console.log("Please provide input via standard input. To finalize, press Ctrl+D (Unix/macOS) or Ctrl+Z then Enter (Windows).");