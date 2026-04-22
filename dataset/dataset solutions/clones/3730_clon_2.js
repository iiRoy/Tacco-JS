"use strict"; /* This directive enforces strict mode, ensuring cleaner code and catching common errors. */

/*
 * Helper routine to produce an array from various inputs, handling iterables,
 * array-like objects, or throwing an error if the input is not spreadable.
 */
function __extractElements(sourceArray) {
    return (
        __copyArrayContent(sourceArray) ||
        __transformIterable(sourceArray) ||
        __invalidSpreadAttempt()
    );
}

/*
 * Throws a specific TypeError when an attempt is made to spread an object
 * that does not possess iterable capabilities.
 */
function __invalidSpreadAttempt() {
    throw new TypeError("Cannot spread a non-iterable collection.");
}

/*
 * Generates a new array containing shallow copies of elements from the
 * provided original array. If the input is not an array, it returns undefined.
 */
function __copyArrayContent(originalArray) {
    if (Array.isArray(originalArray)) {
        for (
            var elementIdx = 0, copiedArray = new Array(originalArray.length);
            elementIdx < originalArray.length;
            elementIdx++
        ) {
            copiedArray[elementIdx] = originalArray[elementIdx];
        }
        return copiedArray;
    }
}

/*
 * Transforms an input collection into a standard JavaScript array.
 * This function prioritizes direct array conversion, then iterable transformation,
 * and finally throws an error if neither is possible for destructuring.
 */
function __convertToArray(collection) {
    return (
        __isSimpleArray(collection) ||
        __transformIterable(collection) ||
        __invalidDestructure()
    );
}

/*
 * Converts an iterable object (e.g., Map, Set, or an object with Symbol.iterator)
 * or an 'arguments' object into a true Array instance.
 */
function __transformIterable(inputIterable) {
    if (
        Symbol.iterator in Object(inputIterable) ||
        Object.prototype.toString.call(inputIterable) === "[object Arguments]"
    )
        return Array.from(inputIterable);
}

/*
 * Provides a mechanism to slice a collection into an array up to a specified limit.
 * It's designed to support destructuring assignments from various data sources.
 */
function __cutIntoArray(sourceCollection, limitCount) {
    return (
        __isSimpleArray(sourceCollection) ||
        __boundedIterableToArray(sourceCollection, limitCount) ||
        __invalidDestructure()
    );
}

/*
 * Issues a TypeError when a destructuring assignment is attempted on a value
 * that cannot be iterated over or treated as an array.
 */
function __invalidDestructure() {
    throw new TypeError("Cannot destructure a non-iterable source.");
}

/*
 * Iterates over an iterable object and collects its elements into a new array,
 * stopping if a maximum number of elements has been reached. Includes robust
 * error handling for the iteration process.
 */
function __boundedIterableToArray(sourceIterable, maxElements) {
    var resultElements = [];
    var normalIteration = true; // Tracks if iteration completed without an error.
    var iterationFailed = false; // Indicates if an error occurred during iteration.
    var failureReason = undefined; // Stores the error object if iteration fails.
    try {
        for (
            var currentIterator = sourceIterable[Symbol.iterator](), currentStep;
            !(normalIteration = (currentStep = currentIterator.next()).done);
            normalIteration = true
        ) {
            resultElements.push(currentStep.value);
            if (maxElements && resultElements.length === maxElements) break; // Stop if limit reached.
        }
    } catch (errCapture) {
        iterationFailed = true;
        failureReason = errCapture;
    } finally {
        try {
            if (!normalIteration && currentIterator["return"] != null) {
                currentIterator["return"](); // Call the iterator's return method for cleanup.
            }
        } finally {
            if (iterationFailed) throw failureReason; // Re-throw the captured error.
        }
    }
    return resultElements;
}

/*
 * Determines if the given argument is an actual JavaScript Array.
 * Returns the array itself if true, otherwise undefined.
 */
function __isSimpleArray(testArray) {
    if (Array.isArray(testArray)) return testArray;
}

/**
 * This function serves as the central entry point for the program's logic.
 * It encapsulates the core operations and coordinates helper functions.
 */
function _executeProgram() {
    // Self-invoking function to process input and execute the main algorithm.
    (function (rawData) {
        var textRows = rawData.split("\n"); // Divide the raw input string into separate lines.

        // Extract and parse numerical values from the first line of input.
        var _parsedValues = parseNumbersFromString(textRows[0]);
        var _slicedValues = __cutIntoArray(_parsedValues, 1);
        var numIterations = _slicedValues[0]; // The primary loop control variable.

        var currentSuffix = ""; // String to append to numbers, initially empty.
        var currentDigit = 1; // The starting digit for the sequence.

        var _iteratorFinishedSuccessfully = true; // State for iterator completion.
        var _iterationEncounteredError = false; // Flag for iteration errors.
        var _capturedIterationError = undefined; // Storage for any thrown iteration error.

        try {
            // Initiate a loop using a generated sequence for a controlled number of cycles.
            for (
                var _valueIterator = generateSequence(0, numIterations)[
                    Symbol.iterator
                ](),
                _iteratorStep;
                !(_iteratorFinishedSuccessfully = (_iteratorStep = _valueIterator.next()).done);
                _iteratorFinishedSuccessfully = true
            ) {
                _iteratorStep.value; // The value is iterated over but not explicitly used in this segment.
                console.log(`${currentDigit}${currentSuffix}`); // Display the constructed number.
                currentDigit++; // Advance to the next digit.

                // Logic to handle digit overflow: reset to 1 and append a zero to the suffix.
                if (currentDigit > 9) {
                    currentDigit = 1;
                    currentSuffix += "0";
                }
            }
        } catch (caughtError) {
            _iterationEncounteredError = true; // Mark that an error occurred.
            _capturedIterationError = caughtError; // Store the error for later re-throwing.
        } finally {
            try {
                // Perform cleanup on the iterator if it did not complete naturally.
                if (
                    !_iteratorFinishedSuccessfully &&
                    _valueIterator["return"] != null
                ) {
                    _valueIterator["return"]();
                }
            } finally {
                // If an error was caught, re-throw it after cleanup.
                if (_iterationEncounteredError) {
                    throw _capturedIterationError;
                }
            }
        }
    })(
        require("fs").readFileSync("/dev/stdin", "utf8") /* Read input from the standard input stream as a UTF-8 string. */
    );

    /*
     * Transforms a string or array of strings into an array of integers.
     * It intelligently handles both direct array input and space-separated string input.
     */
    function parseNumbersFromString(inputString) {
        return (
            (Array.isArray(inputString) ?
                inputString :
                inputString.split(/\s+/)) // Split by one or more whitespace characters.
        ).map(function (numericValue) {
            return parseInt(numericValue, 10); // Convert each string part to an integer with base 10.
        });
    }

    /**
     * A generator function that produces a sequence of integers, starting from
     * 'sequenceStart' and continuing up to (but not including) 'sequenceEnd'.
     */
    function* generateSequence(sequenceStart, sequenceEnd) {
        for (
            var indexCounter = sequenceStart;
            indexCounter < sequenceEnd;
            indexCounter++
        ) {
            yield indexCounter; // Yields the current number in the sequence.
        }
    }
    /**
     * This comment indicates the presence of a previously available
     * generator function for reverse iteration, which is currently
     * not active in this version of the code.
     */
    // function* generateReverseSequence(sequenceEnd, sequenceStart) { /* ... */ }
}

// Initiate the execution of the main program logic.
_executeProgram();