function processAndSortLine(inputChunk) {
    // Convert the input data (which might be a Buffer) to a string.
    const fullInputString = String(inputChunk);

    // Remove leading and trailing whitespace from the entire input.
    const trimmedInputString = fullInputString.trim();

    // Split the trimmed string into an array of lines.
    const allInputLines = trimmedInputString.split("\n");

    // Access the second line from the input (index 1).
    // This assumes the input will always contain at least two lines.
    const targetLineForProcessing = allInputLines[1];

    // Split the target line into individual elements based on spaces.
    const lineElements = targetLineForProcessing.split(" ");

    // Sort these elements alphabetically.
    const sortedLineElements = lineElements.sort();

    // Join the sorted elements back into a single string, separated by spaces.
    return sortedLineElements.join(" ");
}

// Set up an event listener for incoming data on standard input.
process.stdin.on("data", function handleIncomingData(receivedData) {
    // Process the received data using the helper function.
    const finalOutputResult = processAndSortLine(receivedData);

    // Print the processed and sorted string to standard output.
    console.log(finalOutputResult);
});

// Ensure the standard input stream is in flowing mode to receive data.
process.stdin.resume();
