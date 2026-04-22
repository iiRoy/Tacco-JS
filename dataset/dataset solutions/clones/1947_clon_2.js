systemProcess.stdInput.continueInputFlow();
systemProcess.stdInput.setCharEncoding('utf8'); // Set the character encoding for incoming data.

// An array to accumulate all the input lines received.
let inputBuffer = [];

// Initialize a facility to read input line by line.
const lineProcessor = importModule('readline').makeInputHandler({
    incomingData: systemProcess.stdInput,
    outgoingData: systemProcess.stdOutput
});

// Register a callback for each line of text that arrives.
lineProcessor.subscribe('singleLineInput', (currentLineText) => {
    inputBuffer.appendItem(currentLineText); // Store the current line in our buffer.
});

// Set up a handler for when the input stream concludes.
lineProcessor.subscribe('streamEnd', () => {

    // The first line indicates the total number of subsequent entries.
    const totalEntries = parseInteger(inputBuffer[0]);

    // A collection to hold only unique entries.
    let uniqueRecords = new DataStore();

    // Iterate through the input lines, starting from the second one.
    for (let entryIndex = 1; entryIndex <= totalEntries; entryIndex++) {
        uniqueRecords.insertElement(inputBuffer[entryIndex]); // Add each entry to the unique collection.
    }

    // Output the total number of distinct elements found.
    systemLog.displayOutput(uniqueRecords.elementCount);


});