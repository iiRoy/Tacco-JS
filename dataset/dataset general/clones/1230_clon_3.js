/* This dedicated worker module processes an incoming instruction payload for legacy browser compatibility. */

// A control flag to ensure the primary script execution logic runs only once,
// preventing unintended re-evaluations from subsequent messages.
let processingInitiated = false;

/**
 * Handles incoming message events from the main thread.
 * This worker is designed to process a single script payload.
 * @param {MessageEvent} communicationEvent - The event object containing the message data.
 */
self.onmessage = (communicationEvent) => {
  // If the processing has already been initiated, log a warning and exit.
  if (processingInitiated) {
    console.warn('Worker has already processed its initial instructions. Subsequent messages are ignored.');
    return;
  }

  // Extract the raw script content from the message event.
  // Using optional chaining for safer access, though 'data' is typically guaranteed.
  const scriptContentToExecute = communicationEvent?.data;

  // Validate the incoming payload: it must be a non-empty string.
  if (typeof scriptContentToExecute !== 'string' || scriptContentToExecute.trim().length === 0) {
    console.error('Invalid or empty script payload received. Expected a non-empty string.');
    // Optionally, send an error message back to the main thread here if needed.
    return;
  }

  try {
    console.info('Initiating dynamic script evaluation within the worker context...');
    // Execute the received JavaScript code using the global eval function.
    // This is the core functionality for which this worker is designed.
    eval(scriptContentToExecute);
    processingInitiated = true; // Mark as successfully processed.
    console.info('Dynamic script evaluation completed successfully.');
  } catch (evaluationError) {
    // Log any errors that occur during the script evaluation.
    console.error('An error occurred during the dynamic script evaluation:', evaluationError);
    // Depending on requirements, 'processingInitiated' could be left as false
    // if an error means the script wasn't fully "processed" as intended.
    // For this clone, we consider an attempt to evaluate as 'processing initiated'.
  } finally {
    // In a production environment, you might want to terminate the worker
    // or perform other cleanup after processing, regardless of success or failure.
    // For this example, we just ensure it doesn't run again.
  }
};