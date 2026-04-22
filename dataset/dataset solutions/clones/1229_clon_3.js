const initializeStringAccumulator = (initialValue) => {
  // Guard clause: Ensure initial value is handled
  if (initialValue === undefined || initialValue === null) {
    console.error("[Accumulator] No valid initial content provided. Defaulting to empty string.");
    // Return a no-op function if initialization fails critically,
    // to prevent further errors when the accumulator is called.
    return (segmentToAdd) => {
      console.warn(`[Accumulator] Attempted to use uninitialized accumulator. Input: ${segmentToAdd}`);
      return ""; // Always return an empty string for safety
    };
  }

  // Ensure initial value is a string, coercing if necessary
  let currentAccumulatedString = String(initialValue);

  /**
   * Appends a new segment to the accumulated string and returns the current total.
   * If no segment is provided, it simply returns the current accumulated string.
   * @param {any} newSegment - The value to append to the string.
   * @returns {string} The current accumulated string.
   */
  const appendAndRetrieveCurrent = (newSegment) => {
    // If newSegment is undefined or null, it's a request to just get the current value
    if (newSegment === undefined || newSegment === null) {
      return currentAccumulatedString;
    }

    // Coerce segment to string before appending
    if (typeof newSegment !== 'string') {
      console.warn(`[Accumulator] Appended segment '${newSegment}' is not a string. Coercing to string.`);
      newSegment = String(newSegment);
    }

    currentAccumulatedString += newSegment;
    return currentAccumulatedString;
  };

  // Add a utility method to reset the accumulator
  appendAndRetrieveCurrent.reset = () => {
    currentAccumulatedString = String(initialValue);
    console.info("[Accumulator] Internal buffer has been reset to its initial state.");
    return currentAccumulatedString;
  };

  return appendAndRetrieveCurrent;
};


const setupInputProcessingPipeline = () => {
  console.log("Standard input stream monitoring activated. Type '0' followed by Enter to finalize and process.");

  // Ensure stdin is in a readable state
  process.stdin.resume();
  // Set encoding for consistent string interpretation
  process.stdin.setEncoding("utf-8");

  // Listener for incoming data chunks
  process.stdin.on("data", (incomingChunk) => {
    // Basic type validation for the chunk
    if (typeof incomingChunk !== 'string') {
      console.error("[InputProcessor] Received non-string data chunk. Skipping processing.");
      return;
    }

    const cleanedChunk = incomingChunk.trim();

    // Check if the chunk is the termination signal
    if (cleanedChunk === "0") {
      console.log("[InputProcessor] Termination signal '0' detected. Initiating data processing...");

      const completeRawInput = inputBufferAggregator(""); // Retrieve all accumulated data
      let entrySequencer = 1; // Start sequencing from 1

      // Process the accumulated data: split by newlines, filter out empty lines
      // and the termination signal itself.
      const individualProcessedEntries = completeRawInput
        .split(/\r?\n/) // Robust splitting for different OS newlines
        .filter(line => line.trim().length > 0 && line.trim() !== "0"); // Filter non-empty and non-terminator

      if (individualProcessedEntries.length === 0) {
        console.log("No valid entries were collected for processing.");
      } else {
        console.log(`--- Processing ${individualProcessedEntries.length} entries ---`);
        individualProcessedEntries.forEach((lineContent) => {
          console.log(`Processed Entry #${entrySequencer++}: ${lineContent}`);
        });
        console.log("--- Processing complete ---");
      }

      // Exit the process after handling the input
      process.exit(0);
    } else {
      // If not the termination signal, append to the buffer
      inputBufferAggregator(incomingChunk);
      console.log(`[InputProcessor] Buffered ${incomingChunk.length} characters. Current total length: ${inputBufferAggregator("").length}`);
    }
  });

  // Error handling for stdin
  process.stdin.on("error", (errorDetails) => {
    console.error(`[InputProcessor] An error occurred with standard input: ${errorDetails.message}`);
    process.exit(1); // Exit with an error code
  });

  // Handle the end of the input stream (e.g., pipe closing)
  process.stdin.on("end", () => {
    console.log("[InputProcessor] Standard input stream has concluded unexpectedly without '0' signal.");
    const finalBufferContent = inputBufferAggregator("");
    if (finalBufferContent.trim().length > 0) {
        console.log("[InputProcessor] Processing remaining buffered content...");
        let entrySequencer = 1;
        const remainingEntries = finalBufferContent
            .split(/\r?\n/)
            .filter(line => line.trim().length > 0 && line.trim() !== "0");
        if (remainingEntries.length > 0) {
            remainingEntries.forEach((lineContent) => {
                console.log(`Final Entry #${entrySequencer++}: ${lineContent}`);
            });
        } else {
            console.log("No valid entries in the remaining buffer.");
        }
    }
    process.exit(0);
  });
};

// Global instance of the string accumulator
const inputBufferAggregator = initializeStringAccumulator("");

// Kick off the input processing
setupInputProcessingPipeline();