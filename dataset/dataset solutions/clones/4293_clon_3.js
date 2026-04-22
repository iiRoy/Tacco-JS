// This script initializes standard input stream processing for a Node.js application.

// Ensure the standard input stream remains active to receive data.
process.stdin.resume();

// Set the character encoding for the incoming data stream to UTF-8.
process.stdin.setEncoding('utf8');

// Declare a variable to buffer all incoming data fragments from stdin.
let collectedStreamData = '';

// Register an asynchronous event listener for 'data' events on the standard input stream.
// Each time a new chunk of data arrives, it is appended to the buffer.
process.stdin.on('data', function(incomingFragment) {
    // Concatenate the new data fragment to the accumulated buffer.
    collectedStreamData += incomingFragment;
});

// Register an asynchronous event listener for the 'end' event on the standard input stream.
// This event fires when no more data will be sent (e.g., EOF).
process.stdin.on('end', function() {
    // Before processing, validate if any data was actually collected from the stream.
    // If the buffer is empty or contains only whitespace, log an error and terminate.
    if (collectedStreamData.trim().length === 0) {
        console.error("Error: No input data was received from standard input stream.");
        // Optionally, one could exit the process here: process.exit(1);
        return;
    }

    // Split the entire collected data into an array of lines.
    // The regular expression handles both Windows-style (\r\n) and Unix-style (\n) line endings.
    const parsedInputLines = collectedStreamData.split(/\r?\n/);

    // Once all input is collected and parsed, invoke the main application logic.
    executeCoreTask(parsedInputLines);
});

/**
 * Executes the core application logic to identify a unique element from a specific input format.
 * This function expects the first line of the input array to contain three space-separated
 * string components, where exactly two of these components are identical. The task is to
 * output the component that appears only once.
 *
 * @param {string[]} inputLines An array of strings, where each string represents a line
 *                              read from the standard input. The first element is crucial.
 */
function executeCoreTask(inputLines) {
    // Guard clause: Ensure the input lines array is not null, undefined, or empty.
    if (!inputLines || inputLines.length === 0) {
        console.error("Application Logic Error: Input lines array is empty or invalid.");
        return;
    }

    // Extract the very first line from the input array, which is expected to contain the data.
    const firstLineContent = inputLines[0];

    // Guard clause: Validate the content of the first line. It must be a non-empty string.
    if (typeof firstLineContent !== 'string' || firstLineContent.trim().length === 0) {
        console.error("Application Logic Error: The first line of input is either not a string or is empty.");
        return;
    }

    // Split the first line by space characters to obtain individual string components.
    const stringComponents = firstLineContent.split(' ');

    // Guard clause: Ensure that exactly three components were extracted from the line.
    // This is critical for the problem's assumption of three numbers.
    if (stringComponents.length !== 3) {
        console.error(`Application Logic Error: Expected 3 components in the first line, but found ${stringComponents.length}. Input was: '${firstLineContent}'`);
        return;
    }

    // --- Enhanced Core Logic: Using a frequency map for robust unique element identification ---
    // This approach replaces direct conditional checks with a more generalized counting mechanism.

    // Initialize a Map to store the frequency of each component.
    const frequencyTracker = new Map();

    // Iterate over each component obtained from the input line.
    for (const individualComponent of stringComponents) {
        // Retrieve the current count for this component, defaulting to 0 if not seen before.
        const currentOccurrenceCount = frequencyTracker.get(individualComponent) || 0;
        // Increment the count and update it in the map.
        frequencyTracker.set(individualComponent, currentOccurrenceCount + 1);
    }

    let identifiedUniqueComponent = null; // Variable to hold the component found to be unique.

    // Iterate through the entries (key-value pairs) of the frequency map.
    // We are looking for a component whose count is exactly 1.
    for (const [componentValue, occurrenceCount] of frequencyTracker.entries()) {
        if (occurrenceCount === 1) {
            identifiedUniqueComponent = componentValue; // Assign the unique component.
            break; // Once found, no need to check further.
        }
    }

    // Prepare the final message to be displayed.
    let outputResultString;

    // Check if a unique component was successfully identified.
    if (identifiedUniqueComponent !== null) {
        outputResultString = identifiedUniqueComponent; // Use the found unique component.
    } else {
        // This 'else' block should ideally not be reached if the problem constraints
        // (exactly two identical elements among three) are always met.
        console.warn("Warning: No unique component was found based on frequency count. This might indicate an unexpected input format.");
        outputResultString = "ERROR: Unique element could not be determined."; // Fallback error message.
    }

    // Output the final result to the standard output.
    console.log(outputResultString);

    // The symbolic 'return 0;' from the original C/C++/Java context is not idiomatic
    // for a JavaScript function's primary purpose unless explicitly returning an exit code.
    // Therefore, it has been removed.
}