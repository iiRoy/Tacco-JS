let globalMessageCounter = 0; // A global counter to track and uniquely identify each log entry.
let workerCapabilityCache = null; // A cache to store the result of the Web Worker support check, avoiding redundant computations.

/**
 * Appends a formatted informational message or status update to a designated display area within the DOM.
 * This function aims for robust DOM manipulation and provides contextual information.
 *
 * @param {string} incomingMessageText - The textual content to be displayed.
 * @returns {void}
 */
function publishStatusUpdate(incomingMessageText) {
  // First, perform a basic environment check to ensure we are operating in a browser-like context.
  if (typeof document === 'undefined' || document.getElementById === undefined) {
    // If 'document' is not available or doesn't have 'getElementById', we cannot interact with the DOM.
    console.error('Environment does not support DOM manipulation. Cannot publish status update.');
    return;
  }

  // Identify the target container element by its ID. It is expected to be 'status'.
  const targetOutputContainer = document.getElementById("status");

  // If the target container does not exist, log an error and gracefully exit.
  if (!targetOutputContainer) {
    console.error(`Target display element with ID "status" not found in the document. Message: "${incomingMessageText}"`);
    return;
  }

  // Increment the global message counter for tracking and unique identification.
  globalMessageCounter++;

  // Create a new paragraph element dynamically to hold the message.
  const newLogParagraph = document.createElement('p');

  // Generate a current timestamp to prepend to the message for better context.
  const currentTimeStamp = new Date().toLocaleTimeString('en-US', { hour12: false });

  // Construct the full message string, including timestamp and the unique message ID.
  const completeMessageContent = `[${currentTimeStamp} #${globalMessageCounter}] ${incomingMessageText}`;

  // Set the text content of the new paragraph element. Using textContent prevents XSS vulnerabilities.
  newLogParagraph.textContent = completeMessageContent;

  // Add a CSS class to the new paragraph for potential styling.
  newLogParagraph.classList.add('system-notification');

  // Append the newly created and formatted paragraph element to the target container.
  // Using appendChild is generally more efficient and safer than modifying innerHTML directly.
  targetOutputContainer.appendChild(newLogParagraph);
}

/**
 * Determines and reports whether the current browser environment supports Web Workers.
 * The result is cached to prevent redundant checks on subsequent calls.
 *
 * @returns {boolean} - True if Web Workers are supported, false otherwise.
 */
function checkWorkerAvailability() {
  // If the worker capability has already been determined and cached, return the cached value.
  if (workerCapabilityCache !== null) {
    console.debug('Web Worker support status retrieved from internal cache.');
    return workerCapabilityCache;
  }

  // Initialize a flag to store the result of the check.
  let isWebWorkerFeaturePresent = false;

  // Perform a comprehensive check:
  // 1. Ensure 'window' object exists (indicating a browser environment).
  // 2. Check if 'Worker' constructor function is available on the 'window' object.
  if (typeof window !== 'undefined' && typeof window.Worker === 'function') {
    isWebWorkerFeaturePresent = true;
  }

  // Store the determined capability in the cache for future calls.
  workerCapabilityCache = isWebWorkerFeaturePresent;

  // Log the result of the initial check for diagnostic purposes.
  console.info(`Web Worker support check completed: ${isWebWorkerFeaturePresent ? 'Fully supported' : 'Not available'}.`);

  // Return the final determination of Web Worker support.
  return isWebWorkerFeaturePresent;
}