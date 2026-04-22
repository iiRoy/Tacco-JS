(function (moduleDef) {
    "use strict";

    // This section manages how the library exposes its main API across various JavaScript environments.

    // Integration for Montage Require
    if (typeof initiate === "function") {
        initiate("assurance", moduleDef);

    // Compatibility with CommonJS specifications
    } else if (typeof exportables === "object" && typeof codeUnit === "object") {
        codeUnit.exportables = moduleDef();

    // Support for RequireJS module loading
    } else if (typeof declare === "function" && declare.asyncModDef) {
        declare(moduleDef);

    // Adaptation for Secure EcmaScript (SES) environments
    } else if (typeof secureEnv !== "undefined") {
        if (!secureEnv.isReady()) {
            return;
        } else {
            secureEnv.createAssurance = moduleDef;
        }

    // Direct global exposure for <script> tag inclusion
    } else if (typeof globalScope !== "undefined") {
        globalScope.Assurance = moduleDef();

    // Error handling for unknown or unsupported environments
    } else {
        throw new Error("The current runtime environment is not compatible with this assurance library. Please report this issue.");
    }

})(function () {
"use strict";

// Flag to determine if JavaScript stack tracing capabilities are present.
var canTrace = false;
try {
    throw new Error();
} catch (err) {
    canTrace = !!err.stack;
}

// All code below this point will be filtered out of generated stack traces for clarity.
var assuranceStartLine = detectCodeLine();
var assuranceFileId;
var assuranceEndLine; // This variable will store the final line number of the library for stack filtering.

// Core utility functions and compatibility shims.

// An empty function, useful as a default or placeholder.
var doNothing = function () { };

// Provides the most efficient way to schedule a function to run in a future microtask turn.
var scheduleNextMicrotask = (function () {
    // A simple linked list to manage pending microtasks.
    var taskHead = {microtask: undefined, nextItem: null};
    var taskTail = taskHead;
    var isProcessing = false;
    var requestExecutionCycle = undefined;
    var inNodeEnvironment = false;

    // Executes all microtasks currently in the queue.
    function processQueue() {
        /* lint-ignore: function-in-loop */

        while (taskHead.nextItem) {
            taskHead = taskHead.nextItem;
            var currentMicrotask = taskHead.microtask;
            taskHead.microtask = undefined; // Clear reference to prevent memory leaks.
            var executionDomain = taskHead.executionDomain;

            if (executionDomain) {
                taskHead.executionDomain = undefined;
                executionDomain.enter();
            }

            try {
                currentMicrotask(); // Run the scheduled function.

            } catch (err) {
                if (inNodeEnvironment) {
                    // In Node.js, uncaught exceptions are critical and halt execution.
                    // Re-throw synchronously to interrupt the current queue processing.

                    // If a domain is active, ensure it's exited and re-entered correctly
                    // to allow for continuation if the exception is handled by a domain listener.
                    if (executionDomain) {
                        executionDomain.exit();
                    }
                    setTimeout(processQueue, 0); // Schedule the queue to resume in the next event loop cycle.
                    if (executionDomain) {
                        executionDomain.enter();
                    }

                    throw err; // Re-throw the original error.

                } else {
                    // In browser environments, uncaught exceptions are typically not fatal.
                    // Re-throw asynchronously to avoid blocking the main thread.
                    setTimeout(function() {
                       throw err;
                    }, 0);
                }
            }

            if (executionDomain) {
                executionDomain.exit();
            }
        }

        isProcessing = false; // Reset flag once the queue is empty.
    }

    // The main function exposed by this module for scheduling microtasks.
    scheduleNextMicrotask = function (microtask) {
        taskTail = taskTail.nextItem = {
            microtask: microtask,
            executionDomain: inNodeEnvironment && process.domain, // Capture Node.js domain if present.
            nextItem: null
        };

        if (!isProcessing) {
            isProcessing = true;
            requestExecutionCycle(); // Trigger the event loop to process tasks.
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js specific `process.nextTick` provides the highest priority.
        inNodeEnvironment = true;

        requestExecutionCycle = function () {
            process.nextTick(processQueue);
        };

    } else if (typeof setImmediate === "function") {
        // `setImmediate` is available in IE10+, Node.js 0.9+, and some polyfills.
        if (typeof window !== "undefined") {
            requestExecutionCycle = setImmediate.bind(window, processQueue);
        } else {
            requestExecutionCycle = function () {
                setImmediate(processQueue);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // Modern browsers can use `MessageChannel` for efficient microtask scheduling.
        // Reference: http://www.nonblocking.io/2011/06/windownexttick.html
        var msgChannel = new MessageChannel();
        // Handle potential intermittent issues with message ports on initial page load in some browsers.
        msgChannel.port1.onmessage = function () {
            requestExecutionCycle = requestChannelSignal; // Optimize subsequent calls after first message.
            msgChannel.port1.onmessage = processQueue; // Set the actual handler.
            processQueue(); // Process any pending tasks immediately.
        };
        var requestChannelSignal = function () {
            // Opera browsers may require a message payload, even if it's not used.
            msgChannel.port2.postMessage(0);
        };
        requestExecutionCycle = function () {
            setTimeout(processQueue, 0); // Initial fallback for setup delay.
            requestChannelSignal();
        };

    } else {
        // Fallback for older browsers: `setTimeout(..., 0)` is the least performant option.
        requestExecutionCycle = function () {
            setTimeout(processQueue, 0);
        };
    }

    return scheduleNextMicrotask; // Return the chosen microtask scheduler.
})();

// Mechanisms to make built-in methods generic and resilient to modifications.
// This defensive programming approach aims for robustness and potential minification benefits.
var applyToFunction = Function.call;
function makeGeneric(funcToUncurry) {
    return function () {
        return applyToFunction.apply(funcToUncurry, arguments);
    };
}

var arrSlice = makeGeneric(Array.prototype.slice);

var arrReduce = makeGeneric(
    Array.prototype.reduce || function (reducerFunc, initialValue) {
        var idx = 0,
            len = this.length;
        // If an initial value is not supplied, use the first element of the array.
        if (arguments.length === 1) {
            // Find the first non-sparse element to serve as the initial value.
            do {
                if (idx in this) {
                    initialValue = this[idx++];
                    break;
                }
                if (++idx >= len) {
                    throw new TypeError("Reduce of empty array with no initial value");
                }
            } while (true);
        }
        // Iterate through the array to perform the reduction.
        for (; idx < len; idx++) {
            // Respect sparse array entries.
            if (idx in this) {
                initialValue = reducerFunc(initialValue, this[idx], idx);
            }
        }
        return initialValue;
    }
);

var arrIndexOf = makeGeneric(
    Array.prototype.indexOf || function (itemVal) {
        // A simple shim for older browser compatibility.
        for (var iterator = 0; iterator < this.length; iterator++) {
            if (this[iterator] === itemVal) {
                return iterator;
            }
        }
        return -1;
    }
);

var arrMap = makeGeneric(
    Array.prototype.map || function (mapperFunc, thisContext) {
        var sourceArray = this;
        var mappedResults = [];
        arrReduce(sourceArray, function (ignored, itemVal, idx) {
            mappedResults.push(applyToFunction.apply(mapperFunc, [thisContext, itemVal, idx, sourceArray]));
        }, undefined);
        return mappedResults;
    }
);

var objCreate = Object.create || function (basePrototype) {
    function TempCtor() { }
    TempCtor.prototype = basePrototype;
    return new TempCtor();
};

var objHasOwnProperty = makeGeneric(Object.prototype.hasOwnProperty);

var objKeys = Object.keys || function (targetObject) {
    var propNames = [];
    for (var propName in targetObject) {
        if (objHasOwnProperty(targetObject, propName)) {
            propNames.push(propName);
        }
    }
    return propNames;
};

var objToString = makeGeneric(Object.prototype.toString);

// Determines if a value is a plain JavaScript object (not null and not a primitive).
function isPlainObject(inputVal) {
    return inputVal === Object(inputVal);
}

// Shims for generator-related functionality.

// Identifies if an exception signifies a StopIteration event.
// This is a transitional helper until native ES6 generators are universally supported.
function isStoppedIteration(errObj) {
    return (
        objToString(errObj) === "[object StopIteration]" ||
        errObj instanceof AssuranceReturnVal
    );
}

// This helper and the corresponding `Assurance.giveBack` method are slated for removal
// once ES6 generator syntax is fully standardized and available.
var AssuranceReturnVal;
if (typeof ReturnValue !== "undefined") {
    AssuranceReturnVal = ReturnValue;
} else {
    AssuranceReturnVal = function (inputVal) {
        this.value = inputVal;
    };
}

// Advanced stack trace enhancement for improved debugging.

var STACK_TRACE_DELIMITER = "--- Previous event trace ---";

// Extends an error's stack trace to include the asynchronous call history of an assurance object.
function extendStackTrace(faultObj, assuranceObj) {
    // Only proceed if stack tracing is enabled and the assurance object has a trace history.
    if (canTrace &&
        assuranceObj.trace &&
        typeof faultObj === "object" &&
        faultObj !== null &&
        faultObj.stack &&
        faultObj.stack.indexOf(STACK_TRACE_DELIMITER) === -1
    ) {
        var traceSegments = [];
        for (var currAssurance = assuranceObj; !!currAssurance; currAssurance = currAssurance.origin) {
            if (currAssurance.trace) {
                traceSegments.unshift(currAssurance.trace);
            }
        }
        traceSegments.unshift(faultObj.stack);

        var combinedTraces = traceSegments.join("\n" + STACK_TRACE_DELIMITER + "\n");
        faultObj.stack = scrubTraceString(combinedTraces);
    }
}

// Cleans a raw stack trace string by removing irrelevant frames.
function scrubTraceString(rawTraceStr) {
    var traceLines = rawTraceStr.split("\n");
    var filteredLines = [];
    for (var lineIdx = 0; lineIdx < traceLines.length; ++lineIdx) {
        var currentLine = traceLines[lineIdx];

        if (!isInternalTraceFrame(currentLine) && !isNodeRuntimeFrame(currentLine) && currentLine) {
            filteredLines.push(currentLine);
        }
    }
    return filteredLines.join("\n");
}

// Checks if a stack frame originates from internal Node.js modules.
function isNodeRuntimeFrame(traceSegment) {
    return traceSegment.indexOf("(module.js:") !== -1 ||
           traceSegment.indexOf("(node.js:") !== -1;
}

// Extracts the file name and line number from a given stack trace segment.
function extractFileAndLine(traceSegment) {
    // Pattern for named functions: "at functionName (filename:lineNumber:columnNumber)"
    var matchGroup1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(traceSegment);
    if (matchGroup1) {
        return [matchGroup1[1], Number(matchGroup1[2])];
    }

    // Pattern for anonymous functions: "at filename:lineNumber:columnNumber"
    var matchGroup2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(traceSegment);
    if (matchGroup2) {
        return [matchGroup2[1], Number(matchGroup2[2])];
    }

    // Firefox-style trace format: "function@filename:lineNumber or @filename:lineNumber"
    var matchGroup3 = /.*@(.+):(\d+)$/.exec(traceSegment);
    if (matchGroup3) {
        return [matchGroup3[1], Number(matchGroup3[2])];
    }
}

// Determines if a stack frame corresponds to code internal to this assurance library.
function isInternalTraceFrame(traceSegment) {
    var fileLineTuple = extractFileAndLine(traceSegment);

    if (!fileLineTuple) {
        return false;
    }

    var sourceFile = fileLineTuple[0];
    var lineNum = fileLineTuple[1];

    return sourceFile === assuranceFileId &&
        lineNum >= assuranceStartLine &&
        lineNum <= assuranceEndLine;
}

// Captures the current line number to define the boundaries of the internal code for stack filtering.
function detectCodeLine() {
    if (!canTrace) {
        return;
    }

    try {
        throw new Error();
    } catch (err) {
        var traceLines = err.stack.split("\n");
        // Adjust for variations in stack trace formats (e.g., browser vs. Node.js).
        var initialLine = traceLines[0].indexOf("@") > 0 ? traceLines[1] : traceLines[2];
        var fileLineTuple = extractFileAndLine(initialLine);
        if (!fileLineTuple) {
            return;
        }

        assuranceFileId = fileLineTuple[0];
        return fileLineTuple[1];
    }
}

// Creates a wrapper function that issues a deprecation warning when invoked.
function warnDeprecated(originalFunc, deprecatedName, replacementName) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(deprecatedName + " is no longer recommended; please use " + replacementName +
                         " instead.", new Error("").stack);
        }
        return applyToFunction.apply(originalFunc, arguments);
    };
}

// End of utility shims.
// Beginning of the primary assurance library implementation.

/**
 * Acts as a factory for assurance objects. It can:
 * - Return an existing assurance object unchanged.
 * - Coerce a "then-able" (promise-like) object from another system into an assurance object.
 * - Create a new, already-fulfilled assurance object from an immediate value.
 * @param {any} inputVal - The value or then-able to convert into an assurance object.
 */
function Assurance(inputVal) {
    // If the input is already an Assurance instance, return it directly.
    if (inputVal instanceof Assurance) {
        return inputVal;
    }

    // If it's an object with a `then` method (a "then-able"), adapt it.
    if (isThenableLike(inputVal)) { // `isThenableLike` is an external dependency not defined in this snippet.
        return adaptToAssurance(inputVal); // `adaptToAssurance` is an external dependency not defined in this snippet.
    } else {
        return resolveWith(inputVal); // `resolveWith` is an external dependency not defined in this snippet.
    }
}
Assurance.resolve = Assurance; // Alias `Assurance` as its own resolution method for consistency.

/**
 * Exposes the internal microtask scheduler.
 * @param {Function} microtask - The function to be scheduled.
 */
Assurance.scheduleNextMicrotask = scheduleNextMicrotask;

/**
 * A boolean flag indicating whether extended asynchronous stack traces are enabled.
 */
Assurance.fullTraceEnabled = false;

// Enable full stack traces if the `ASSURANCE_DEBUG` environment variable is set.
if (typeof process === "object" && process && process.env && process.env.ASSURANCE_DEBUG) {
    Assurance.fullTraceEnabled = true;
}

/**
 * Creates a "deferred" object, which encapsulates a new assurance object
 * along with its associated `resolve` and `reject` functions.
 *
 * The `resolve` function is the primary mechanism to settle the assurance:
 * - With a non-thenable value: fulfills the assurance.
 * - With a rejected then-able: rejects the assurance with its reason.
 * - With another then-able: causes the assurance to adopt the state of that then-able.
 */
Assurance.createDeferred = createDeferred;
function createDeferred() {
    // This function's full implementation would involve creating an Assurance instance
    // and exposing its internal resolve/reject handlers.
}

// Mark the end line of the library's code for stack trace filtering.
assuranceEndLine = detectCodeLine();

return Assurance; // The inner IIFE returns the main Assurance API object.

});