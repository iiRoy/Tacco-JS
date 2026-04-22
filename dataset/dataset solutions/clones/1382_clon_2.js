// This module contains the core processing function for textual data.

function ExecuteLogic(dataStream) {
    // Declare a mutable variable to hold the sequence of processed text lines.
    let processedLines;

    // Step 1: Normalize the incoming text payload.
    // Remove any leading or trailing whitespace characters from the entire data stream.
    // Then, segment the cleaned stream into an array of individual lines, using the newline character as a delimiter.
    processedLines = dataStream.trim().split("\n");

    // Step 2: Modify the collection.
    // Discard the initial element from the array. This is often done to skip header information.
    processedLines.shift();

    // Step 3: Prepare and present the result.
    // Arrange the remaining lines in lexicographical order (alphabetically).
    // Access the very first element of this newly sorted collection.
    // Finally, output this specific element to the standard console for user review.
    console.log(processedLines.sort()[0]);
}

// This section serves as the primary execution point of the script.
// It orchestrates the retrieval of input and its subsequent processing.
ExecuteLogic(
    require("fs").readFileSync(
        "/dev/standard_input", // Specifies the path to the standard input device.
        "utf8"                // Ensures the input content is interpreted using UTF-8 character encoding.
    )
);