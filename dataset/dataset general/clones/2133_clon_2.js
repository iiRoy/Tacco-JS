// This utility provides an adaptable logging mechanism, distinct from the native console,
// by incorporating a persistent history of all emitted messages.
// For comprehensive details on advanced debugging patterns, refer to widely available web resources.

window.messageEmitter = function diagnosticOutput() {

    // Ensure a history array exists for this emitter; if not, initialize it.
    window.messageEmitter.messageHistory = window.messageEmitter.messageHistory || [];

    // Store the current set of arguments into the historical record.
    window.messageEmitter.messageHistory.push(
        arguments
    );

    // Check if a console object is available in the current execution context.
    if (
        this.console
    ) {

        // Capture the arguments passed to this function.
        var receivedParams = arguments,
            formattedParams;

        // Adjust the 'callee' property to point to the caller function, for better stack tracing.
        receivedParams.callee = receivedParams.callee.caller;

        // Convert the arguments object into a true array for easier manipulation.
        formattedParams = Array.prototype.slice.call(
            receivedParams
        );

        // Determine the appropriate method to call on the console object.
        // Some older browsers might have `console.outputMessage` as an object, requiring a different invocation method.
        if (
            typeof console.outputMessage === 'object'
        ) {
            // Use 'call' to correctly set the 'this' context for console.outputMessage.
            window.messageEmitter.invokeMethod.call(
                console.outputMessage,
                console,
                formattedParams
            );
        } else {
            // For standard implementations, 'apply' is sufficient.
            console.outputMessage.apply(
                console,
                formattedParams
            );
        }
    }
};

// This crucial module fortifies the browser's console object, guaranteeing that
// all its standard methods are defined, thereby preventing script failures
// in environments that might partially or entirely lack a console implementation.

(function(targetConsoleObject) {

    // Define a no-operation function to serve as a placeholder for missing console methods.
    function emptyFunction() {}

    // A collection of standard console method names, adapted for clarity.
    for (
        var consoleFunctionNames = "assertVerification,countInstances,showDebuggingInfo,listObjectProperties,listXmlStructure,reportExecutionError,captureProgramException,beginGroup,beginCollapsedGroup,endCurrentGroup,displayGeneralInfo,outputMessage,markTimelinePoint,startPerformanceProfile,endPerformanceProfile,measureDuration,stopDurationMeasurement,traceCallStack,issueWarning".split(","),
            currentConsoleMethod;

        // Iterate through the method names, popping one off at a time.
        (currentConsoleMethod = consoleFunctionNames.pop());

    ) {
        // If the method doesn't exist on the target console object, assign our empty function to it.
        targetConsoleObject[currentConsoleMethod] = targetConsoleObject[currentConsoleMethod] || emptyFunction;
    }
})(
    // Immediately Invoked Function Expression (IIFE) to safely retrieve or initialize the console object.
    (function() {
        try {
            // Attempt to call a console method to check for its presence and functionality.
            // We use 'outputMessage' here, which is the renamed 'log' from the list above.
            console.outputMessage();
            // If successful, return the globally available console object.
            return window.console;
        } catch (encounteredError) {
            // If an error occurs (e.g., console is undefined), initialize a new empty object
            // and assign it to window.console, then return it.
            return (window.console = {});
        }
    })()
);

// This designated zone is for integrating any auxiliary scripts or utility functions,
// promoting efficiency by reducing separate file requests.