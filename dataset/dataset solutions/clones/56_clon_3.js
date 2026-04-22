// This module is designed to process incoming data, manage a stack-like data structure,
// and execute iterative routines based on specific conditions. It demonstrates
// input/output handling in a Node.js environment.

// --- Global Configuration and Input Buffering ---
/**
 * A buffer to accumulate raw data received from the standard input stream.
 * Initially a string, it will be transformed into an array of tokens later.
 * @type {string|Array<string>}
 */
let rawDataBuffer = '';

/**
 * A pointer indicating the current position within the `rawDataBuffer`
 * when it's being consumed as an array of tokens.
 * @type {number}
 */
let currentInputPointer = 0;

// --- Utility Functions for Input/Output ---

/**
 * Extracts and returns the next available token from the processed input buffer.
 * It intelligently attempts to cast the token to a number unless explicitly
 * requested as a string. Includes robust checks for end-of-input and type validity.
 * @param {string} [expectedFormat] - Optional hint; if 'string', the token is returned as a string.
 * @returns {number|string|undefined} The next token, or `undefined` if no more tokens are available.
 */
function acquireNextToken(expectedFormat) {
    // A guard clause to prevent reading beyond the bounds of the input array.
    if (currentInputPointer >= rawDataBuffer.length) {
        // console.warn("Input stream exhausted. No more tokens to acquire."); // Debugging addition
        return undefined; // Signifies no more data.
    }

    // Retrieve the token at the current pointer and then advance the pointer.
    const tokenFromBuffer = rawDataBuffer[currentInputPointer];
    currentInputPointer++; // Increment the pointer for the next read operation.

    // Determine the return type based on the 'expectedFormat' parameter.
    if (expectedFormat === 'string') {
        return String(tokenFromBuffer); // Explicitly ensure string type.
    } else {
        // Attempt to convert the token to a number using the unary plus operator.
        const numericalValue = +tokenFromBuffer;
        // A Type III addition: Check if the conversion resulted in NaN.
        if (Number.isNaN(numericalValue)) {
            // console.info(`Warning: Token "${tokenFromBuffer}" could not be parsed as a valid number.`); // Debugging addition
        }
        return numericalValue;
    }
}

/**
 * Displays a specified value to the console, typically as program output.
 * @param {*} outputPayload - The data item to be presented.
 */
function displayOutputValue(outputPayload) {
    // Enhancing output with a prefix for better readability (Type III embellishment).
    console.log(`[APPLICATION_OUTPUT]: ${outputPayload}`);
}

// --- General Purpose Iteration Function ---

/**
 * Iterates through a numerical range, executing a provided predicate function
 * for each number. The iteration can be halted prematurely if the predicate
 * returns `false`. This function supports flexible argument patterns:
 * 1. `iterateWithCondition(upperBound, predicateFn)`: Starts from 0.
 * 2. `iterateWithCondition(lowerBound, upperBound, predicateFn)`: Custom start.
 * @param {number} parameterOne - The starting index or the upper bound.
 * @param {number|Function} parameterTwo - The upper bound or the predicate function.
 * @param {Function} [parameterThree] - The predicate function, if `parameterTwo` was the upper bound.
 */
function iterateWithCondition(parameterOne, parameterTwo, parameterThree) {
    let iterationStart = 0;
    let iterationEnd;
    let evaluationCallback;

    // Parse arguments to determine the iteration range and callback.
    if (parameterThree === undefined) {
        // Signature: (upperBound, predicateFn)
        iterationEnd = parameterOne;
        evaluationCallback = parameterTwo;
    } else {
        // Signature: (lowerBound, upperBound, predicateFn)
        iterationStart = parameterOne;
        iterationEnd = parameterTwo;
        evaluationCallback = parameterThree;
    }

    // Type III Guard: Validate that the callback is indeed a function.
    if (typeof evaluationCallback !== 'function') {
        console.error("Error: The provided predicate for 'iterateWithCondition' is not a function.");
        return; // Abort if the predicate is invalid.
    }

    // Execute the loop with the determined parameters.
    for (let currentIterationIndex = iterationStart; currentIterationIndex < iterationEnd; currentIterationIndex += 1) {
        // Invoke the callback and store its result.
        const callbackResult = evaluationCallback(currentIterationIndex);

        // If the predicate explicitly returns `false`, terminate the loop.
        if (callbackResult === false) {
            // console.log(`Iteration terminated prematurely by predicate at index ${currentIterationIndex}.`); // Debugging addition
            break;
        }

        // Type III Addition: An example of a non-essential 'continue' statement.
        // This specific condition is trivial and doesn't change core functionality for typical inputs.
        if (currentIterationIndex === Math.floor((iterationStart + iterationEnd) / 2) && iterationEnd - iterationStart > 2) {
             // console.log(`[INFO] Middle index ${currentIterationIndex} encountered. Continuing loop.`);
             // continue; // Could be uncommented to demonstrate a 'continue'
        }
    }
}

// --- Main Application Logic ---

/**
 * This is the central function that orchestrates the primary logic of the application.
 * It reads tokens from the input, manages a stack (LIFO collection), pushing non-zero
 * values and popping/displaying values when a zero is encountered.
 */
function processInputSequence() {
    // Initialize an array to serve as our dynamic stack.
    const operationalStack = [];
    // Define the specific value that triggers a pop operation.
    const popTriggerConstant = 0;

    let incomingToken; // Variable to hold each token as it's read.

    // Loop continuously to process input tokens until the stream is exhausted or invalid data is met.
    while (true) {
        // Acquire the next token from the processed input.
        incomingToken = acquireNextToken();

        // Type III Robustness: Check for both end-of-input and non-numeric values.
        if (incomingToken === undefined || Number.isNaN(incomingToken)) {
            // If no more valid tokens, exit the processing loop.
            // console.log("Input stream fully consumed or invalid token encountered. Halting sequence processing."); // Debugging addition
            break;
        }

        // Conditional logic based on the value of the current token.
        if (incomingToken === popTriggerConstant) {
            // Type III Guard: Prevent attempting to pop from an empty stack.
            if (operationalStack.length === 0) {
                displayOutputValue("Attempted to pop from an empty stack. No value to retrieve.");
                // We can choose to 'continue' to process further input, or 'break' to stop.
                // 'continue' allows the program to handle more input even after an error.
                continue;
            }
            // If the stack is not empty, pop the top element and display it.
            const retrievedValue = operationalStack.pop();
            displayOutputValue(retrievedValue);
        } else {
            // For any other valid numeric token, push it onto the stack.
            operationalStack.push(incomingToken);
            // console.log(`Pushed value: ${incomingToken}. Stack size: ${operationalStack.length}.`); // Debugging addition
        }
    }

    // Type III Addition: Final status message after all input has been processed.
    if (operationalStack.length > 0) {
        // console.log(`Sequence processing finished. Remaining items on stack: [${operationalStack.join(', ')}]`);
    } else {
        // console.log("Sequence processing finished. The stack is now empty.");
    }
}

// --- Standard Input Stream Setup and Event Handlers ---

// Ensure the standard input stream remains open to receive data.
process.stdin.resume();

// Configure the encoding for the incoming data to be UTF-8.
process.stdin.setEncoding('utf8');

/**
 * Event handler for when data chunks are received from stdin.
 * It appends the received chunk to the global raw data buffer.
 * @param {string} receivedDataChunk - A segment of data received from stdin.
 */
const handleIncomingData = (receivedDataChunk) => {
    rawDataBuffer += receivedDataChunk;
    // console.log(`Data chunk received. Current buffer length: ${rawDataBuffer.length} characters.`); // Debugging addition
};

/**
 * Event handler for the 'end' event of stdin. This signifies that all input
 * has been received. It then processes the accumulated raw data and
 * initiates the main application logic.
 */
const finalizeInputAndExecute = () => {
    // Type III Transformation: Pre-process the raw string buffer into an array of tokens.
    // Trim leading/trailing whitespace and split by one or more whitespace characters globally.
    const tokenizedInputArray = rawDataBuffer.trim().split(/\s+/g);
    rawDataBuffer = tokenizedInputArray; // Replace the string buffer with the array of tokens.

    // Type III Validation: A crucial check to ensure there's meaningful input before proceeding.
    if (rawDataBuffer.length === 0 || (rawDataBuffer.length === 1 && rawDataBuffer[0] === '')) {
        console.error("No valid input provided after processing. Application will terminate without execution.");
        return; // Exit early if no executable input.
    }

    // Once input preparation is complete, start the core processing sequence.
    processInputSequence();
};

// Register the defined handlers for stdin events.
process.stdin.on('data', handleIncomingData);
process.stdin.on('end', finalizeInputAndExecute);