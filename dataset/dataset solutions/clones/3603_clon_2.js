/**
 * Primary routine to process incoming data.
 * This function takes a string, performs a specific numerical calculation,
 * and then outputs the final result to the console.
 *
 * @param {string} incomingData The raw string input to be processed.
 */
function processInputData(incomingData) {
    // Split the provided string into an array of substrings.
    // The splitting is performed using a space character as the delimiter.
    // The resulting array holds the individual data segments.
    const extractedParts = incomingData.split(" ");

    // Perform the core mathematical operation:
    // 1. Explicitly convert the first two extracted segments to numerical values.
    // 2. Subtract one from each of these numerical values.
    // 3. Multiply the two decremented numbers together to get the final product.
    // The calculated value is then printed to the standard output stream.
    console.log(
        (Number(extractedParts[0]) - 1) *
        (Number(extractedParts[1]) - 1)
    );
}


// --- Application Entry Point ---
// This section initiates the program's execution by calling the main processing function.

// The input data is sourced from the system's standard input stream.
// This involves using Node.js's built-in file system module to read the file content.
// The content is expected to be encoded in a specific text format.
processInputData(
    require("node:fs") // Access the Node.js core file system module.
        .readFileSync(
            "/dev/std_input_stream", // Specify the file path for the standard input.
            "unicode_encoding_format" // Define the character encoding (e.g., UTF-8) for reading the file.
        )
);