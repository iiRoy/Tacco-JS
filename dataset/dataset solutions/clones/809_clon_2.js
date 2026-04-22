var writeOutput = console.log;

// Check if running in a Node.js-like environment
if (typeof process !== "undefined") {
    // Variable to hold all incoming raw data
    var receivedText = "";

    // Ensure standard input stream is active
    process.stdin.resume();

    // Set encoding for incoming data chunks
    process.stdin.setEncoding('utf8');

    // Event listener for data reception
    process.stdin.on('data', function (dataSegment) {
        receivedText += dataSegment;
    });

    // Event listener for end of input stream
    process.stdin.on('end', function () {
        // Once all data is received, pass it to the preprocessing function
        prepareData(receivedText);
    });
}

/**
 * Prepares the raw input string for main processing.
 * @param {string} rawInputString - The complete raw input received.
 */
function prepareData(rawInputString) {
    // Split the input into individual lines
    var textRows = rawInputString.split("\n");

    // Remove the first line (often headers or counts)
    textRows.shift();

    // Remove the last line (often empty or EOF marker)
    textRows.pop();

    // Pass the cleaned lines to the core logic function
    performAnalysis(textRows);
}

/*
 * This section contains the primary logic for data analysis.
 * It processes a collection of data rows to derive specific results.
 */
function performAnalysis(dataRows) {
    // Discard the very first row of the processed data array.
    dataRows.shift();

    // Transform each remaining string row into an array of numbers.
    dataRows = dataRows.map(function (dataRowString) {
        // Split the string by space to get individual string components.
        var stringParts = dataRowString.split(" ");
        // Convert each string component into a number.
        var convertedNumbers = stringParts.map(function (strValue) {
            return Number(strValue);
        });
        return convertedNumbers;
    });

    // This array will hold groups of two data sets.
    var collectionOfSets = [];

    // Loop while there are at least two rows left to form a data set pair.
    while (dataRows.length > 1) {
        // Create a temporary array for the current pair of data sets.
        var temporaryArray = [];
        // Add the first data set (row) to the temporary array.
        temporaryArray.push(dataRows.shift());
        // Add the second data set (row) to the temporary array.
        temporaryArray.push(dataRows.shift());
        // Store the completed pair in the main collection.
        collectionOfSets.push(temporaryArray);
    }

    // Iterate through each collected pair of data sets.
    collectionOfSets.forEach(function (currentDataSet) {
        // Extract the 'power' or 'threshold' value from the first part of the current data set.
        var thresholdIndex = currentDataSet[0][1];

        // An array to store calculated differences.
        var deltaValues = [];

        // Iterate through the second array of the current data set to calculate differences.
        currentDataSet[1].forEach(function (currentElement, currentIndex, fullNumericArray) {
            // Skip the very first element as there's no preceding element to compare.
            if (currentIndex === 0) {
                return;
            } else {
                // Calculate the difference between the current and the previous element.
                deltaValues.push(fullNumericArray[currentIndex] - fullNumericArray[currentIndex - 1]);
            }
        });

        // Sort the calculated differences in descending order.
        deltaValues.sort(function (firstVal, secondVal) {
            return secondVal - firstVal;
        });

        // Slice the array, keeping only elements from 'thresholdIndex - 1' onwards.
        // This effectively removes the largest differences.
        deltaValues = deltaValues.slice(thresholdIndex - 1);

        // Check if there are any differences remaining after slicing.
        if (deltaValues.length > 0) {
            // Calculate the sum of the remaining differences.
            var aggregateResult = deltaValues.reduce(function (accumulator, currentValue) {
                // Ensure the current value is defined before adding.
                if (currentValue !== undefined) {
                    return accumulator + currentValue;
                } else {
                    // If current value is undefined, handle initial accumulator or just return accumulator.
                    return accumulator === undefined ? 0 : accumulator;
                }
            });
            // Output the calculated sum.
            writeOutput(aggregateResult);
        } else {
            // If no differences remain, output zero.
            writeOutput(0);
        }
    });
}