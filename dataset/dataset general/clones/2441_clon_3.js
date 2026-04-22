/** @license
 * Derived Work: AsyncOp
 * Original Copyright 2011-2012 Ian J. Wessman (defer.js)
 * This derivative work is also licensed under the Apache License, Version 2.0.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @define {boolean} Controls verbose console output for debugging.
 */
var _debugMode = false;

/**
 * @define {boolean} Enables compatibility features for older Internet Explorer versions.
 */
var _legacyBrowserSupport = true;

(function(globalObj) { // Main execution wrapper, receives the global object (window).
    /**
     * @const
     * @type {boolean}
     */
    var IS_TRUE = true; // Boolean constant for true

    /**
     * @const
     * @type {boolean}
     */
    var IS_FALSE = false; // Boolean constant for false

    /**
     * @const
     * @type {undefined}
     */
    var UNDEF_VAL; // Constant for undefined to reduce characters and ensure strict comparison

    /**
     * @const
     * @type {string}
     */
    var LIB_VERSION = "2.0-alpha"; // Version identifier for this cloned library.

    /**
     * @const
     * @type {string}
     */
    var ERROR_MARKER = "async-op:"; // Prefix for error messages.

    // --- Core Management Data Structures ---

    /** @type {Object<number, OperationUnit>} */
    var activeTasks = {}; // A map to hold all currently pending asynchronous operation units by their unique ID.

    /** @type {number} */
    var taskCounter = 1000; // Counter for generating unique identifiers for operation units. Starts high to avoid conflicts.

    /** @type {boolean} */
    var domReadyState = IS_FALSE; // Flag indicating if the Document Object Model (DOM) is fully loaded and ready.

    /** @type {boolean} */
    var isLegacyBrowser = (!!globalObj.document.detachEvent && !globalObj.addEventListener); // Detects older IE versions that use attachEvent.

    // --- Event Name Constants ---

    /** @const @type {string} */
    var DOM_LOAD_EVENT_NAME = "DOMContentLoaded"; // Standard DOM ready event.

    /** @const @type {string} */
    var READY_STATE_CHANGE_EVENT_NAME = "readystatechange"; // IE-specific document state change event.

    /** @const @type {string} */
    var ON_READY_STATE_CHANGE_PROPERTY = "on" + READY_STATE_CHANGE_EVENT_NAME; // Property name for IE event handling.

    /** @const @type {string} */
    var COMPLETE_DOC_STATE = "complete"; // Document readyState value when the document is fully loaded.

    /** @const @type {string} */
    var WINDOW_LOAD_EVENT_NAME = "load"; // Fallback event for when the entire page (including assets) has loaded.

    // --- Configuration Key Constants (for options objects) ---

    /** @const @type {string} */
    var KEY_READY_PREDICATE = "ready"; // Special string predicate to signify waiting for DOM ready.

    /** @const @type {string} */
    var KEY_PREDICATE = "predicate"; // Key for the predicate function in options.

    /** @const @type {string} */
    var KEY_HANDLER = "handler"; // Key for the handler function in options.

    /** @const @type {string} */
    var KEY_OPTIONS = "options"; // General key for the options object.

    /* --- Internal Utility Functions --- */

    /**
     * Checks if a provided value is either `undefined` or `null`.
     * Uses loose equality for brevity and to cover both cases.
     * @param {*} value - The item to check.
     * @return {boolean} True if the value is null or undefined, false otherwise.
     */
    var isUndefinedOrNull = function(value) {
        return value == null;
    };

    /**
     * Determines if the given argument is a callable function.
     * @param {*} potentialFunction - The item to verify.
     * @return {boolean} True if the item is a function, false otherwise.
     */
    function isCallable(potentialFunction) {
        return typeof potentialFunction === 'function';
    }

    /**
     * Logs messages to the console, but only when `_debugMode` is enabled.
     * It gracefully handles environments where `console` might not be available.
     * @param {string} msg - The primary message string.
     * @param {*=} extraData - Optional additional data to log alongside the message.
     */
    function debugOutput(msg, extraData) {
        if (_debugMode === IS_TRUE) {
            var currentConsole = globalObj.console;
            if (!isUndefinedOrNull(currentConsole) && isCallable(currentConsole.log)) {
                // Use spread if extraData is an array, otherwise just log as-is.
                if (Array.isArray(extraData)) {
                    currentConsole.log(msg, ...extraData);
                } else if (!isUndefinedOrNull(extraData)) {
                    currentConsole.log(msg, extraData);
                } else {
                    currentConsole.log(msg);
                }
            }
        }
    }

    /**
     * Iterates over an object's own enumerable properties, executing a callback for each.
     * Provides a guard for non-object inputs.
     * @param {Object} targetObj - The object whose properties are to be iterated.
     * @param {function(string, *): void} callbackFn - The function to call for each property (key, value).
     * @param {*=} contextObj - Optional context (`this`) for the callback function.
     */
    function iterateObjectProperties(targetObj, callbackFn, contextObj) {
        if (isUndefinedOrNull(targetObj) || typeof targetObj !== 'object') {
            debugOutput(ERROR_MARKER + "Invalid object for iteration.", targetObj);
            return;
        }
        var currentContext = contextObj || globalObj;
        for (var propKey in targetObj) {
            // Ensure we only process own properties, not inherited ones.
            if (Object.prototype.hasOwnProperty.call(targetObj, propKey)) {
                callbackFn.call(currentContext, propKey, targetObj[propKey]);
            }
        }
    }

    /**
     * Attaches an event listener to a DOM element or the window.
     * Abstracts `addEventListener` and `attachEvent` for cross-browser compatibility.
     * @param {EventTarget} targetElement - The element to which the event listener will be attached.
     * @param {string} eventType - The type of event (e.g., "click", "load").
     * @param {function(Event): void} eventListener - The function to be executed when the event occurs.
     * @param {boolean=} useCapture - Optional. If true, the listener is registered for the capturing phase.
     */
    function attachEventMonitor(targetElement, eventType, eventListener, useCapture) {
        var captureEnabled = Boolean(useCapture); // Ensures a boolean value.

        if (!isUndefinedOrNull(targetElement.addEventListener)) {
            targetElement.addEventListener(eventType, eventListener, captureEnabled);
        } else if (isLegacyBrowser) {
            // IE's attachEvent uses 'on' prefix and does not support capture phase.
            targetElement.attachEvent("on" + eventType, eventListener);
        }
    }

    /**
     * Removes an event listener from a DOM element or the window.
     * Abstracts `removeEventListener` and `detachEvent` for cross-browser compatibility.
     * @param {EventTarget} targetElement - The element from which the event listener will be removed.
     * @param {string} eventType - The type of event.
     * @param {function(Event): void} eventListener - The specific listener function to remove.
     * @param {boolean=} useCapture - Optional. Must match the value used in `attachEventMonitor`.
     */
    function detachEventMonitor(targetElement, eventType, eventListener, useCapture) {
        var captureEnabled = Boolean(useCapture);

        if (!isUndefinedOrNull(targetElement.removeEventListener)) {
            targetElement.removeEventListener(eventType, eventListener, captureEnabled);
        } else if (isLegacyBrowser) {
            targetElement.detachEvent("on" + eventType, eventListener);
        }
    }

    /**
     * Dynamically creates and appends a script element to the document body.
     * Provides options for `async` or `defer` loading attributes.
     * @param {string} scriptSource - The URL (src attribute) of the script to load.
     * @param {string=} asyncMode - Optional. Can be "async" or "defer" to set the corresponding attribute.
     */
    function injectScriptElement(scriptSource, asyncMode) {
        var scriptElem = globalObj.document.createElement("script");

        if (scriptElem) {
            scriptElem.type = "text/javascript";
            scriptElem.src = scriptSource;

            if (!isUndefinedOrNull(asyncMode) && (asyncMode === "async" || asyncMode === "defer")) {
                scriptElem[asyncMode] = asyncMode; // Set the async/defer attribute.
            }

            var docBody = globalObj.document.body;
            if (docBody) {
                docBody.appendChild(scriptElem);
                debugOutput("Script injected:", scriptSource);
            } else {
                debugOutput("Warning: Document body not available for script injection.", scriptSource);
            }
        } else {
            debugOutput("Error: Failed to create script element for injection.", scriptSource);
        }
    }

    /* --- Operation Management Objects & Methods --- */

    /**
     * Schedules an asynchronous operation. The provided callback will execute
     * once the predicate function returns true.
     * @param {Function|string} opCondition - A function that returns a boolean, or the string "ready" for DOM ready.
     * @param {Function} opCallback - The function to be executed upon condition fulfillment.
     * @param {Object=} opSettings - Optional configuration object (e.g., `interval`, `timeout`, `handlerContext`).
     * @return {number} The unique ID of the scheduled operation. Returns 0 if the condition is met immediately.
     */
    function scheduleOperation(opCondition, opCallback, opSettings) {
        // Pre-validation of callback function.
        if (!isCallable(opCallback)) {
            debugOutput(ERROR_MARKER + "02: Handler must be a function.", opCallback);
            throw new Error(ERROR_MARKER + "02: Invalid handler provided.");
        }

        // Normalize the predicate: if "ready", use the internal `alwaysTrue` and rely on `checkDomReadiness`.
        if (opCondition === KEY_READY_PREDICATE) {
            opCondition = alwaysTrue;
        } else if (!isCallable(opCondition)) {
            debugOutput(ERROR_MARKER + "01: Predicate must be a function or the string '" + KEY_READY_PREDICATE + "'.", opCondition);
            throw new Error(ERROR_MARKER + "01: Invalid predicate provided.");
        }

        var newOp = new OperationUnit(opCondition, opCallback, opSettings);

        if (newOp.isFinished === IS_TRUE) {
            // If the condition is met immediately during initialization, no deferral is needed.
            return 0;
        } else {
            activeTasks[newOp.unitId] = newOp; // Register the new operation.
            return newOp.unitId;
        }
    }

    /**
     * Attempts to cancel a currently active scheduled operation.
     * @protected
     * @param {number} operationId - The unique ID of the operation to cancel.
     * @return {boolean} True if the operation was found and successfully cancelled, false otherwise.
     */
    function haltOperation(operationId) {
        debugOutput("async-op.cancel: Attempting to halt operation ID", operationId);

        var opToCancel = activeTasks[operationId];

        if (!isUndefinedOrNull(opToCancel)) {
            opToCancel.isFinished = IS_TRUE; // Mark as finished to prevent any further processing.
            opToCancel.cancelCurrentCheck(); // Clear any pending `setTimeout`.
            disposeOperation(operationId); // Immediately remove from the active tasks registry.
            debugOutput("async-op.cancel: Operation ID " + operationId + " successfully halted.");
            return IS_TRUE;
        } else {
            debugOutput("async-op.cancel: Operation ID " + operationId + " not found or already completed.");
            return IS_FALSE;
        }
    }

    /**
     * Removes an operation unit from the `activeTasks` registry.
     * This is typically called after an operation completes or is cancelled.
     * Uses `setTimeout(..., 0)` to defer the cleanup, preventing blocking the current execution path.
     * @protected
     * @param {number} opId - The ID of the operation to remove.
     */
    function disposeOperation(opId) {
        globalObj.setTimeout(function cleanUpOperation() {
            if (activeTasks[opId]) { // Check if it still exists (might have been removed by another call).
                activeTasks[opId] = UNDEF_VAL; // Dereference to aid garbage collection.
                delete activeTasks[opId]; // Remove the property from the object.
                debugOutput("async-op.cleanup: Operation ID " + opId + " disposed.");
            }
        }, 0);
    }

    /**
     * A simple predicate function that always returns `true`.
     * Used internally when the `opCondition` is specified as the string "ready".
     * @protected
     * @return {boolean} Always true.
     */
    function alwaysTrue() {
        return IS_TRUE;
    }

    /**
     * Executes a given function within a `try-catch` block to prevent errors from
     * propagating and crashing the script.
     * @protected
     * @param {Function} funcToExecute - The function to call.
     * @param {Object=} executionContext - The `this` context for the function call. Defaults to `globalObj` (window).
     * @param {boolean} shouldPropagateError - If true, caught errors are re-thrown; otherwise, they are logged.
     * @param {string=} customErrorMsg - An optional message to prepend to re-thrown errors.
     * @return {*} The return value of `funcToExecute`, or `IS_FALSE` if an error occurred and was not propagated.
     */
    function executeSafely(funcToExecute, executionContext, shouldPropagateError, customErrorMsg) {
        var functionResult = IS_FALSE;
        var contextForCall = executionContext || globalObj;

        try {
            functionResult = funcToExecute.call(contextForCall);
        } catch (error) {
            if (_debugMode === IS_TRUE) {
                debugOutput("Error during safe execution:", error, funcToExecute);
            }

            if (shouldPropagateError === IS_TRUE) {
                var wrappedError = new Error(customErrorMsg || ERROR_MARKER + "Execution failed.");
                if (error instanceof Error) {
                    wrappedError.originalError = error; // Attach original error for deeper inspection.
                    wrappedError.stack = error.stack; // Preserve the original stack trace.
                } else {
                    wrappedError.originalError = error; // For non-Error objects.
                }
                throw wrappedError; // Re-throw the enhanced error.
            }
        }
        return functionResult;
    }

    /**
     * @constructor
     * @protected
     * Represents a single asynchronous operation unit, managing its state and execution.
     * @param {Function} opCondition - The predicate function to evaluate.
     * @param {Function} opCallback - The handler function to execute on success.
     * @param {Object=} opSettings - Configuration options for this specific operation.
     */
    function OperationUnit(opCondition, opCallback, opSettings) {
        var currentUnit = this;
        var unitSettings = opSettings || {};

        // Unique identifier for this operation unit.
        currentUnit.unitId = taskCounter++;
        currentUnit.conditionFn = opCondition;
        currentUnit.callbackFn = opCallback;

        // Process configuration options with default values.
        var effectiveInterval = unitSettings["interval"] || 50; // Default check interval: 50ms.
        if (effectiveInterval < 10 && _debugMode === IS_TRUE) {
            debugOutput(ERROR_MARKER + "03: Warning - interval less than 10ms is inadvisable for operation ID", currentUnit.unitId);
        }

        currentUnit.config = {
            checkInterval: effectiveInterval,
            maxWaitTime: unitSettings["timeout"] || 15000, // Default timeout: 15 seconds.
            callbackContext: unitSettings["handlerContext"] || UNDEF_VAL, // Optional 'this' context for the handler.
            checkDomReadiness: isUndefinedOrNull(unitSettings["testDOMReady"]) ? IS_TRUE : Boolean(unitSettings["testDOMReady"]) // Default: check DOM readiness.
        };

        // Internal state flags and timers.
        currentUnit.currentTimerId = null; // Stores the ID returned by `setTimeout`.
        currentUnit.expirationTime = null; // Timestamp when the operation should forcibly timeout.
        currentUnit.isFinished = IS_FALSE; // Indicates if the operation has completed, timed out, or been cancelled.

        var initialCheckResult = IS_FALSE;

        // Immediately evaluate the condition if DOM is already ready and required.
        if (currentUnit.config.checkDomReadiness === IS_TRUE && domReadyState === IS_TRUE) {
            initialCheckResult = currentUnit.evaluateCondition();
        }

        if (initialCheckResult === IS_TRUE) {
            debugOutput("Operation " + currentUnit.unitId + ": Condition met instantly.");
            currentUnit.handleEvaluationResult(initialCheckResult); // Execute handler immediately.
        } else {
            debugOutput("Operation " + currentUnit.unitId + ": Initial condition not met, scheduling checks.");
            currentUnit.setupNextCheck(); // Start the periodic checking process.
        }
    }

    /*
     * @protected
     * Executes the predicate function associated with this operation unit.
     * @return {boolean} The result of the predicate function.
     */
    OperationUnit.prototype.evaluateCondition = function OperationUnit_evaluateCondition() {
        return executeSafely(this.conditionFn, null, IS_FALSE, "");
    };

    /**
     * Processes the result of the predicate evaluation for this operation unit.
     * If the condition is met, the handler is executed and the operation is cleaned up.
     * Otherwise, it reschedules the next check.
     * @protected
     * @param {boolean} evaluationResult - True if the predicate returned true, false otherwise.
     */
    OperationUnit.prototype.handleEvaluationResult = function OperationUnit_handleEvaluationResult(evaluationResult) {
        var currentUnit = this;

        // Prevent processing if the operation is already marked as finished.
        if (currentUnit.isFinished === IS_TRUE) {
            debugOutput("Operation " + currentUnit.unitId + ": Already finished, skipping result handling.");
            return;
        }

        if (evaluationResult === IS_TRUE) {
            currentUnit.cancelCurrentCheck(); // Stop any pending timers for this operation.

            try {
                // Execute the handler function, propagating any errors it might throw.
                executeSafely(
                    currentUnit.callbackFn,
                    currentUnit.config.callbackContext,
                    IS_TRUE, // Re-throw errors from the handler.
                    ERROR_MARKER + "04: Handler execution failed for operation ID " + currentUnit.unitId
                );
            } catch (e) {
                // If executeSafely propagated an error, re-throw it to the global scope.
                throw e;
            }

            currentUnit.isFinished = IS_TRUE; // Mark as complete.
            disposeOperation(currentUnit.unitId); // Remove from active tasks.
            debugOutput("Operation " + currentUnit.unitId + ": Condition met and handler executed.");
        } else {
            // Condition not met, check for timeout and reschedule if within limits.
            currentUnit.cancelCurrentCheck(); // Clear the old timer before setting a new one.
            currentUnit.setupNextCheck(); // Schedule the next evaluation.
        }
    };

    /**
     * Schedules the next periodic check of the operation's condition.
     * Manages the operation's timeout.
     * @protected
     */
    OperationUnit.prototype.setupNextCheck = function OperationUnit_setupNextCheck() {
        var currentUnit = this;
        var maxTime = currentUnit.config.maxWaitTime;

        // Initialize expiration timestamp on the first call to `setupNextCheck`.
        if (currentUnit.expirationTime === null) {
            currentUnit.expirationTime = Date.now() + maxTime;
        }

        // Check if the operation has exceeded its maximum allowed wait time.
        if (Date.now() >= currentUnit.expirationTime) {
            debugOutput("Operation " + currentUnit.unitId + ": Timed out after " + maxTime + "ms.");
            currentUnit.isFinished = IS_TRUE; // Mark as finished due to timeout.
            disposeOperation(currentUnit.unitId); // Clean up.
            return; // Stop further checks.
        }

        // Schedule the next evaluation using `setTimeout`.
        currentUnit.currentTimerId = globalObj.setTimeout(function OperationUnit_internalNextCheck() {
            if (currentUnit.isFinished === IS_FALSE) { // Only evaluate if not already finished/cancelled.
                currentUnit.handleEvaluationResult(currentUnit.evaluateCondition());
            }
        }, currentUnit.config.checkInterval);

        // debugOutput("Operation " + currentUnit.unitId + ": Next check scheduled in " + currentUnit.config.checkInterval + "ms.");
    };

    /**
     * Clears any currently active `setTimeout` timer for this operation unit.
     * @protected
     */
    OperationUnit.prototype.cancelCurrentCheck = function OperationUnit_cancelCurrentCheck() {
        if (this.currentTimerId !== null) {
            globalObj.clearTimeout(this.currentTimerId);
            this.currentTimerId = null;
            // debugOutput("Operation " + this.unitId + ": Current check timer cleared.");
        }
    };

    /* --- DOM Ready Logic Implementation --- */

    /**
     * Function called when the DOM is determined to be ready.
     * It sets the `domReadyState` flag and re-evaluates all pending operations
     * that depend on DOM readiness.
     * @protected
     */
    function triggerDomReady() {
        if (domReadyState === IS_FALSE) { // Ensure this only runs once.
            domReadyState = IS_TRUE;
            debugOutput("DOM Ready event detected and triggered processing for pending operations.");

            // Iterate through all active tasks.
            iterateObjectProperties(activeTasks, function(id, op) {
                // If an operation requires DOM readiness and is not yet finished, re-evaluate its condition.
                if (op.config.checkDomReadiness === IS_TRUE && op.isFinished === IS_FALSE) {
                    op.handleEvaluationResult(op.evaluateCondition());
                }
            });
        }
    }

    /**
     * Sets up various event listeners to reliably detect when the DOM is ready.
     * Includes modern browser (`DOMContentLoaded`) and legacy IE (`readystatechange`, `doScroll`) methods.
     * @protected
     */
    function setupDomReadyListeners() {
        // 1. Check if the document is already in a complete state (e.g., script loaded late).
        if (globalObj.document.readyState === COMPLETE_DOC_STATE) {
            triggerDomReady();
            return;
        }

        // 2. Standard `DOMContentLoaded` event for modern browsers.
        attachEventMonitor(globalObj.document, DOM_LOAD_EVENT_NAME, triggerDomReady, IS_FALSE);

        // 3. Fallback for older IE versions using `readystatechange` and `doScroll`.
        if (isLegacyBrowser && _legacyBrowserSupport === IS_TRUE) {
            attachEventMonitor(globalObj.document, READY_STATE_CHANGE_EVENT_NAME, function checkIEState() {
                if (globalObj.document.readyState === COMPLETE_DOC_STATE) {
                    triggerDomReady();
                }
            });

            // IE `doScroll` method: This method throws an error until the DOM is interactive.
            // A polling loop is used to repeatedly check `doScroll`.
            var ieReadyCheckLoop = function() {
                try {
                    // This call will succeed only when the DOM is ready for interaction.
                    globalObj.document.documentElement.doScroll("left");
                    triggerDomReady();
                } catch (e) {
                    // If it throws, the DOM is not ready yet; reschedule the check.
                    globalObj.setTimeout(ieReadyCheckLoop, 50);
                }
            };

            // Only initiate the `doScroll` check if the document is not already complete.
            if (globalObj.document.readyState !== COMPLETE_DOC_STATE) {
                globalObj.setTimeout(ieReadyCheckLoop, 50);
            }
        }

        // 4. Final fallback: `window.load` event. This ensures readiness even if
        // `DOMContentLoaded` or `readystatechange` somehow fail or are missed.
        attachEventMonitor(globalObj, WINDOW_LOAD_EVENT_NAME, triggerDomReady, IS_FALSE);
    }

    // Initialize the DOM ready detection mechanism.
    setupDomReadyListeners();

    // --- Expose Public API ---
    // The `asyncOp` object is exposed on the global scope (window) for external use.
    globalObj.asyncOp = {
        version: LIB_VERSION, // Library version.
        schedule: scheduleOperation, // Function to schedule a new async operation.
        cancel: haltOperation, // Function to cancel an existing async operation.
        injectScript: injectScriptElement, // Utility to dynamically inject scripts.
        isDomReady: function() {
            return domReadyState;
        } // Public getter for the current DOM ready state.
    };

    // --- Process Queued Operations ---
    // This section handles scenarios where the `asyncOp` library itself is loaded asynchronously.
    // If a global `asyncOpQueue` array exists (created by scripts that ran before `asyncOp` loaded),
    // it processes all operations queued in it.
    if (!isUndefinedOrNull(globalObj.asyncOpQueue) && Array.isArray(globalObj.asyncOpQueue)) {
        debugOutput("Processing " + globalObj.asyncOpQueue.length + " previously queued async operations.");
        var queuedOps = globalObj.asyncOpQueue;
        while (queuedOps.length > 0) {
            var opArgs = queuedOps.shift(); // Get the oldest queued operation's arguments.
            if (Array.isArray(opArgs) && opArgs.length >= 2) {
                try {
                    scheduleOperation.apply(null, opArgs); // Call `scheduleOperation` with the queued arguments.
                } catch (e) {
                    debugOutput("Error processing queued operation:", e, opArgs);
                }
            } else {
                debugOutput("Skipping malformed queued operation:", opArgs);
            }
        }
        globalObj.asyncOpQueue = UNDEF_VAL; // Clear the queue after processing to prevent re-processing.
    }

})(window); // Pass the `window` object to the immediately invoked function expression (IIFE).