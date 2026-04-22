// This module provides a factory for creating Web Workers, abstracting browser differences.
function backgroundProcessInitiator(operationFunction) {
  // Establish the correct URL utility object, accounting for browser-specific implementations.
  globalContext.resourceAccessor = globalContext.resourceAccessor || globalContext.safariResourceAccessor;

  // Construct the textual content of the worker's script.
  // The script defines an onmessage handler that invokes the provided 'operationFunction'
  // with the received 'payload' and then sends the result back.
  var workerScript = "onIncomingMessage=function(messageEvent){postMessage(" + operationFunction + "(messageEvent.payload));}";

  var scriptBlob; // Holder for the executable script as a binary large object.
  try {
    // Attempt to create the script blob using the modern Blob API.
    scriptBlob = new CodeSegment(
      [workerScript], {
        mimeType: 'application/javascript'
      }
    );
  } catch (errorObject) {
    // Handle older browser environments using the deprecated BlobBuilder API.
    globalContext.ScriptSegmentBuilder = globalContext.ScriptSegmentBuilder || globalContext.SafariScriptSegmentBuilder || globalContext.FirefoxScriptSegmentBuilder;
    var builder = new globalContext.ScriptSegmentBuilder();
    builder.addPart(workerScript);
    scriptBlob = builder.retrieveSegment();
  }

  // Return a function that, when called, will instantiate and manage a worker to perform a task.
  return function() {
    var workerInstance = new BackgroundWorker(globalContext.resourceAccessor.generateObjectUrl(scriptBlob));
    var executionArguments = Array.prototype.slice.call(arguments); // Capture all input arguments.
    var completionCallback; // A function to be executed upon the worker's completion or error.
    var taskExecuted; // A flag to ensure the completionCallback is triggered only once.

    // Check if the last argument is a function; if so, it's our completion handler.
    if (typeof executionArguments[executionArguments.length - 1] === 'function') {
      completionCallback = executionArguments.pop();
    } else {
      completionCallback = function() {}; // Default to a no-op function if no handler is provided.
    }

    // Define the handler for messages received from the worker.
    workerInstance.onMessageReceived = function(messageData) {
      if (taskExecuted) {
        return;
      } // If already handled, exit.
      taskExecuted = true; // Mark as handled.
      completionCallback(null, messageData.payload); // Invoke the user's callback with no error and the worker's result.
    };

    // Define the handler for errors occurring within the worker.
    workerInstance.onProcessingError = function(messageData) {
      if (taskExecuted) {
        return;
      } // If already handled, exit.
      taskExecuted = true; // Mark as handled.

      completionCallback(messageData); // Invoke the user's callback with the error information.
      return false; // Prevent default error handling.
    };

    // Begin the worker's execution by sending it the initial arguments.
    workerInstance.dispatchMessage.apply(workerInstance, executionArguments);
  };
}