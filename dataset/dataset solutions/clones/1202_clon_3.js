// This module provides a basic command-line interface (CLI) tool
// for calculating the cube of numerical inputs received via standard input.

// 1. Initialize Input Stream Configuration
//    - Obtain a reference to the standard input stream provided by the Node.js runtime.
const standardInputSource = process.stdin; // Reference to the global stdin object.

// 2. Prepare the Input Stream
//    - It's crucial to explicitly resume the input stream flow. Without this,
//      the 'data' events might not be emitted, or the stream might remain paused.
standardInputSource.resume();

//    - Define the character encoding for incoming data. 'utf8' is a common and
//      flexible choice for text data, ensuring proper interpretation of characters.
standardInputSource.setEncoding('utf8'); // One explicit setting is sufficient.

// 3. User Interface and Instructions
//    - Output introductory messages to guide the user on how to interact with the program.
console.log("======================================");
console.log("  Cubic Value Calculator (v1.0)       ");
console.log("======================================");
console.log("Please type a number and press 'Enter' to see its cube.");
console.log("Press 'Ctrl+C' at any time to terminate the application.");
console.log("--------------------------------------");

// 4. Event Handling for Incoming Data
//    - Attach an event listener to the 'data' event of the standard input stream.
//      This callback function will be invoked whenever new data chunks are received.
standardInputSource.on('data', function (incomingDataChunk) {
    // 4.1. Pre-process the raw input.
    //      - Convert the incoming data (which might be a Buffer or string) to a string.
    //      - Trim leading/trailing whitespace to clean the user's input.
    const trimmedInputString = String(incomingDataChunk).trim();

    // 4.2. Validate Input for Emptiness
    //      - If the input is empty after trimming, inform the user and skip processing.
    if (trimmedInputString.length === 0) {
        console.warn("Warning: No input detected. Please enter a number.");
        return; // Halt execution for this data chunk.
    }

    // 4.3. Convert Input to Numeric Type
    //      - Attempt to parse the string into a floating-point number.
    //      - `parseFloat` is used to handle both integers and decimals.
    const parsedNumericValue = parseFloat(trimmedInputString);

    // 4.4. Validate Numeric Input
    //      - Check if the parsed value is a valid, finite number.
    //      - `isNaN` checks for "Not-a-Number" (e.g., from "hello").
    //      - `!Number.isFinite` checks for `Infinity` or `-Infinity`.
    if (isNaN(parsedNumericValue) || !Number.isFinite(parsedNumericValue)) {
        console.error(`Error: '${trimmedInputString}' is not a valid finite number.`);
        console.log("Hint: Ensure your input contains only digits and an optional decimal point.");
        return; // Halt execution for invalid numeric input.
    }

    // 4.5. Perform the Core Calculation
    //      - Calculate the cube of the validated numeric input.
    //      - Using `Math.pow(base, exponent)` is an explicit and clear way
    //        to perform exponentiation, alternative to `**` operator.
    const calculatedCube = Math.pow(parsedNumericValue, 3);

    // 4.6. Display the Result
    //      - Output the original input and its calculated cube in a clear format.
    console.log(`=> Input: ${parsedNumericValue} | Cube: ${calculatedCube}`);
    console.log("--------------------------------------");
});

// 5. Handle Stream Closure (Optional but good practice)
//    - Register a listener for the 'end' event, which is emitted when
//      the input stream has no more data to provide (e.g., EOF).
standardInputSource.on('end', () => {
    console.log("Input stream has ended. Shutting down cube calculator.");
    console.log("======================================");
});

// 6. Handle Stream Errors (Optional for robustness)
//    - Attach a listener for the 'error' event to catch any issues
//      that might occur with the standard input stream itself.
standardInputSource.on('error', (streamError) => {
    console.error("An unexpected error occurred with the input stream:", streamError.message);
    process.exit(1); // Exit with an error code.
});