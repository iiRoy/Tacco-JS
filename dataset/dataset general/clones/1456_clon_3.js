// This utility facilitates offloading intensive computational tasks to a Web Worker,
// thereby preventing the main thread from becoming unresponsive. It dynamically
// creates a worker from a provided function, abstracting away the underlying
// complexities of worker setup and message passing.
// The concept is broadly inspired by asynchronous patterns used in web development.

function createAsynchronousProcessor(computationHandler) {
    // A robust validator for the core logic function is crucial.
    // The worker's execution depends entirely on this function.
    if (typeof computationHandler !== 'function') {
        throw new TypeError('The primary computationHandler must be a valid function to be executed in the worker context.');
    }

    // Determine the appropriate URL API for creating object URLs.
    // Modern browsers typically use `window.URL`, while some older WebKit-based
    // environments might still rely on `window.webkitURL`.
    const universalResourceLocator = window.URL || window.webkitURL;
    if (!universalResourceLocator) {
        // If neither API is available, Web Workers cannot be reliably created.
        // This scenario should be logged or handled more gracefully in a production environment.
        console.error('Environment lacks support for URL.createObjectURL. Web Workers may not be functional.');
        // For this Type III clone, we allow execution to proceed, but with a warning.
    }

    // Construct the full JavaScript source code that the Web Worker will execute.
    // This script defines the worker's message handler, which deserializes data,
    // invokes the user-provided computation, and then serializes and posts the result.
    const workerScriptSource = `
        // The 'self' keyword refers to the global scope within the Web Worker.
        self.onmessage = function(incomingWorkerEvent) {
            try {
                // Execute the main computation logic, passing the received data.
                // The computationHandler function is serialized as a string and executed.
                const processedOutput = (${computationHandler.toString()})(incomingWorkerEvent.data);
                // Dispatch the computed result back to the main thread.
                self.postMessage(processedOutput);
            } catch (internalWorkerError) {
                // Should an error occur during the worker's execution,
                // package it and send it back to the main thread for handling.
                self.postMessage({
                    _workerExceptionFlag: true, // Custom flag to identify worker-side errors
                    exceptionName: internalWorkerError.name,
                    exceptionMessage: internalWorkerError.message,
                    exceptionStack: internalWorkerError.stack
                });
            }
        };
    `;

    // Create a Blob object from the worker script string.
    // This Blob will serve as the source for the Web Worker.
    let scriptBinaryPayload;
    const javascriptMimeType = 'application/javascript';

    try {
        // Attempt to utilize the modern Blob constructor.
        scriptBinaryPayload = new Blob([workerScriptSource], { type: javascriptMimeType });
    } catch (modernBlobError) {
        // If the standard Blob constructor fails (e.g., in older browsers),
        // attempt to fall back to the deprecated BlobBuilder API.
        console.warn('Standard Blob API unavailable; attempting legacy BlobBuilder fallback.', modernBlobError);
        const legacyBlobConstructor = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

        if (legacyBlobConstructor) {
            const builderInstance = new legacyBlobConstructor();
            builderInstance.append(workerScriptSource);
            scriptBinaryPayload = builderInstance.getBlob(javascriptMimeType);
        } else {
            // If no suitable Blob creation API is found, worker creation is impossible.
            throw new Error('No Blob or BlobBuilder API detected. Cannot create worker script payload.');
        }
    }

    // The function returned here is the public interface for initiating a worker task.
    // Consumers will call this function with their data and an optional completion callback.
    return function initiateWorkerOperation(...inputParameters) {
        // Create a unique URL for the blob, which the Worker constructor requires.
        const workerInstantiationURL = universalResourceLocator.createObjectURL(scriptBinaryPayload);
        const backgroundExecutionUnit = new Worker(workerInstantiationURL);

        let finalCompletionCallback = function() { /* A default, no-operation callback */ };
        let operationLifecycleConcluded = false; // Ensures the callback is invoked only once.

        // Extract the user-defined completion callback, if provided as the last argument.
        if (inputParameters.length > 0 && typeof inputParameters[inputParameters.length - 1] === 'function') {
            finalCompletionCallback = inputParameters.pop();
        }

        // Configure the message handler for successful data processing by the worker.
        backgroundExecutionUnit.onmessage = function(messageDispatchEvent) {
            // Guard against redundant calls if the operation has already concluded.
            if (operationLifecycleConcluded) {
                console.warn('Worker message received after the operation was already marked as concluded. Ignoring.');
                return;
            }
            operationLifecycleConcluded = true;

            // Check if the received message indicates an internal worker exception.
            if (messageDispatchEvent.data && messageDispatchEvent.data._workerExceptionFlag) {
                const workerSideException = new Error(messageDispatchEvent.data.exceptionMessage);
                workerSideException.name = messageDispatchEvent.data.exceptionName;
                workerSideException.stack = messageDispatchEvent.data.exceptionStack;
                finalCompletionCallback(workerSideException, null); // Pass the error object.
            } else {
                finalCompletionCallback(null, messageDispatchEvent.data); // Pass successful result.
            }

            // Clean up worker resources immediately after completion.
            backgroundExecutionUnit.terminate();
        };

        // Configure the error handler for any issues encountered by the worker itself.
        backgroundExecutionUnit.onerror = function(workerErrorEvent) {
            // Prevent multiple error or success callbacks.
            if (operationLifecycleConcluded) {
                console.warn('Worker error received after operation concluded. Ignoring.', workerErrorEvent);
                return;
            }
            operationLifecycleConcluded = true;

            // Construct a comprehensive error object to pass to the callback.
            const processingIssue = new Error(workerErrorEvent.message || 'An unspecified worker error occurred.');
            processingIssue.sourceFile = workerErrorEvent.filename;
            processingIssue.lineNumber = workerErrorEvent.lineno;
            processingIssue.columnNumber = workerErrorEvent.colno;

            finalCompletionCallback(processingIssue, null); // Report the error.

            // Terminate the worker even in error scenarios to release resources.
            backgroundExecutionUnit.terminate();

            // Returning false prevents the browser's default error logging for workers.
            return false;
        };
        
        // Prepare the payload for the worker. Web Workers typically expect a single data object.
        // If multiple parameters were provided, they are bundled into an array.
        const dataPayloadForWorker = inputParameters.length === 1 ? inputParameters[0] : inputParameters;
        backgroundExecutionUnit.postMessage(dataPayloadForWorker);
    };
}