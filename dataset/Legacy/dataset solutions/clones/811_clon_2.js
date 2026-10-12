var outputLog = console.log;

// Check if running in a Node.js environment to handle standard input.
if (typeof process !== "undefined") {
    var rawData = ""; // Accumulates incoming data from stdin.
    process.stdin.resume(); // Keep the process alive.
    process.stdin.setEncoding('utf8'); // Set encoding for input.

    // Event listener for data chunks.
    process.stdin.on('data', function (chunkSegment) {
        rawData += chunkSegment; // Append new data.
    });

    // Event listener for end of input.
    process.stdin.on('end', function () {
        processInitialData(rawData); // Process all collected data.
    });
}

/**
 * Pre-processes the raw input string before passing it to the main logic.
 * @param {string} incomingText - The complete input string from stdin.
 */
function processInitialData(incomingText) {
    var textRows = incomingText.split("\n"); // Split input into individual lines.
    textRows.shift(); // Remove the first line (often metadata or empty).
    textRows.pop(); // Remove the last line (often empty or EOF marker).
    executeCoreLogic(textRows); // Pass cleaned lines to the primary function.
}

//----- Core Application Logic -----

/**
 * Executes the main algorithm on the processed input lines.
 * @param {string[]} textRows - An array of strings, each representing a line of data.
 */
function executeCoreLogic(textRows) {
    textRows.shift(); // Discard another initial line, as per problem spec.

    // Convert each line into an array of numbers.
    var parsedNumericRows = textRows.map(function (currentElement) {
        var partsArray = currentElement.split(" "); // Split line by space.
        var numericValues = partsArray.map(function (strValue) {
            return Number(strValue); // Convert each part to a number.
        });
        return numericValues;
    });

    var dataCollections = []; // Stores pairs of data arrays.

    // Group the numeric rows into datasets of two arrays each.
    while (parsedNumericRows.length > 1) {
        var tempCollection = []; // Temporary array for a single dataset.
        tempCollection.push(parsedNumericRows.shift()); // Add the first array.
        tempCollection.push(parsedNumericRows.shift()); // Add the second array.
        dataCollections.push(tempCollection); // Store the pair.
    }

    // Process each collected dataset.
    dataCollections.forEach(function (currentDataset) {
        var powerValue = currentDataset[0][1]; // Extract the power value from the first array.
        var differenceArray = []; // Array to store differences between consecutive elements.

        // Calculate differences between adjacent elements in the second array of the dataset.
        currentDataset[1].forEach(function (currentNum, idx, fullArray) {
            if (idx === 0) {
                return; // Skip the first element as there's no previous one.
            } else {
                differenceArray.push(fullArray[idx] - fullArray[idx - 1]); // Calculate and store difference.
            }
        });

        // Sort the differences in descending order.
        differenceArray.sort(function (valA, valB) {
            return valB - valA; // Descending sort.
        });

        // Remove the largest (powerValue - 1) differences.
        for (var loopCounter = 0; loopCounter < powerValue - 1; loopCounter++) {
            differenceArray.shift(); // Remove the first element (largest).
        }

        // Calculate the sum of the remaining differences.
        if (differenceArray.length > 0) {
            var totalSum = differenceArray.reduce(function (previousVal, currentVal) {
                // Ensure currentVal is defined before adding.
                if (currentVal !== undefined) {
                    return previousVal + currentVal;
                } else {
                    // If previousVal is undefined, initialize to 0, otherwise use its value.
                    return previousVal === undefined ? 0 : previousVal;
                }
            });
            outputLog(totalSum); // Output the calculated sum.
        } else {
            outputLog(0); // If no differences remain, output 0.
        }
    });
}
