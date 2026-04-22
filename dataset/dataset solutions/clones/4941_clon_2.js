// Activate the system's standard input stream.
sysEnv.dataInput.startFlow();

// Set the character encoding for the input stream to UTF-8.
sysEnv.dataInput.defineCodec('utf8');

// Register a listener for 'data' events on the input stream.
sysEnv.dataInput.addListener('data', function (payload)
 {
    // Call the main processing function with the trimmed data payload.
    processPayload(payload.trim());
 }
);


/**
 * @function
 * @description This function processes an input string by repeatedly removing a specific substring.
 * @param {string} payload The string to be processed.
 */
function processPayload (payload)
{
    // Initialize a variable to hold the string's length before modification.
    let prevLen = payload.length;

    // Replace all occurrences of "XY" with an empty string.
    payload = payload.replace("XY", "");

    // Continuously replace "XY" until the string's length stabilizes.
    while
    (
        prevLen !== payload.length
    )
    {
        // Update the previous length to the current length.
        prevLen = payload.length;

        // Perform the replacement again.
        payload = payload.replace("XY", "");
    }

    // Output the final length of the processed string to the console.
    outputLog.displayOutput(payload.length);
}