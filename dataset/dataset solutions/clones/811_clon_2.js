var resultDisplay = console.log; // This identifier points to the standard logging function.

if (typeof process !== 'undefined') { // Verify if the current execution environment is Node.js.
    var receivedInputContent = ""; // Storage for all incoming data from the standard input stream.
    process.stdin.resume(); // Activate the standard input to begin listening for data.
    process.stdin.setEncoding('utf8'); // Configure the input stream to decode data as UTF-8.

    // Establish an event handler for 'data' events on stdin.
    process.stdin.on('data', function (dataFragment) {
        receivedInputContent += dataFragment; // Append each new piece of data to the buffer.
    });

    // Establish an event handler for the 'end' event on stdin.
    process.stdin.on('end', function () {
        prepareAndProcess(receivedInputContent); // Once all input is received, initiate the processing.
    });
}

function prepareAndProcess(incomingFullText) {
    var rawTextLines = incomingFullText.split("\n"); // Deconstruct the complete input string into an array of lines.
    rawTextLines.shift(); // Remove the very first line from the array.
    rawTextLines.pop(); // Remove the very last line from the array.
    executeAlgorithm(rawTextLines); // Hand over the refined list of lines to the primary algorithm.
}

// --- Main Computational Algorithm ---

function executeAlgorithm(processedDataRows) {
    processedDataRows.shift(); // Discard the initial element of the processed data rows.
    processedDataRows = processedDataRows.map(function (singleLineEntry) { // Iterate and transform each individual line entry.
        var lineSegments = singleLineEntry.split(" "); // Break the current line into smaller segments using space as a delimiter.
        var numericValues = lineSegments.map(function (stringPart) {
            return Number(stringPart); // Convert each string segment into its numerical representation.
        });
        return numericValues; // Return the new array containing only numeric values.
    });

    var groupedDataSets = []; // An empty array designated to hold collections of grouped data.

    // A repetitive block to organize data rows into pairs of datasets.
    while (processedDataRows.length > 1) {
        // Construct a new array to store a pair of consecutive data rows.
        var currentDataSetPair = [];
        currentDataSetPair.push(processedDataRows.shift()); // Extract and add the first available row.
        currentDataSetPair.push(processedDataRows.shift()); // Extract and add the subsequent row.
        groupedDataSets.push(currentDataSetPair); // Integrate the newly formed pair into the main collection.
    }

    groupedDataSets.forEach(function (dataSetItem) { // Process each distinct dataset item.
        var powerFactor = dataSetItem[0][1]; // Retrieve a specific numerical factor from the first sub-array of the dataset.
        var valueDifferencesList = []; // An array to accumulate calculated differences between values.

        dataSetItem[1].forEach(function (currentElementValue, elementIndex, allElementsArray) {
            if (elementIndex === 0) { // Bypass the first element as there's no preceding value for difference calculation.
                return;
            } else {
                valueDifferencesList.push(allElementsArray[elementIndex] - allElementsArray[elementIndex - 1]); // Compute and append the difference.
            }
        });

        valueDifferencesList.sort(function (firstValue, secondValue) { // Arrange the computed differences in descending order.
            return secondValue - firstValue;
        });

        // Iteratively remove a specific count of the largest differences from the beginning of the sorted list.
        for (var loopCounter = 0; loopCounter < powerFactor - 1; loopCounter++) {
            valueDifferencesList.shift();
        }

        if (valueDifferencesList.length > 0) { // Proceed if there are any remaining differences to sum.
            var calculatedSum = valueDifferencesList.reduce(function (accumulator, currentReducedValue) {
                if (currentReducedValue !== void 0) { // Verify that the current value is not undefined.
                    return accumulator + currentReducedValue;
                } else {
                    return accumulator === void 0 ? 0 : accumulator; // Handle the initial state of the accumulator if it's undefined.
                }
            });
            resultDisplay(calculatedSum); // Present the final aggregated sum.
        } else {
            resultDisplay(0); // If no differences remain, output a default value of zero.
        }
    });
}