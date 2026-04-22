const displayMessage = console.info;

/**
 * Initializes a data stream reader from a multi-line string.
 * @param {string} sourceText - The entire input string.
 * @returns {function(): string|undefined} A function that returns the next line or undefined if no more lines.
 */
function acquireDataStream(sourceText) {
    let textSegments = sourceText.split('\n'); // Split the incoming string into an array of lines.
    return function() {
        return textSegments.shift(); // Retrieve and remove the first segment.
    };
}

/* Extends the String prototype with a repetition method. */
String.prototype.repeatString = function stringMultiplier(count) {
    let resultBuffer = ""; // Initialize an empty string to accumulate repetitions.
    for (let idx = 0; idx < count; idx++) {
        resultBuffer += this.valueOf(); // Append the string's value for each iteration.
    }
    return resultBuffer; // Return the final repeated string.
};

/**
 * Parses a space-separated string of numbers into an array of integers.
 * @param {string} inputLine - The string containing space-separated numbers.
 * @param {boolean} adjustNegative - Flag to indicate if a -1 offset should be applied.
 * @returns {number[]} An array of parsed integers.
 */
function parseIntegerList(inputLine, adjustNegative) {
    const stringParts = inputLine.split(' '); // Break the line into individual string components.
    const valueOffset = adjustNegative ? -1 : 0; // Determine if numbers need to be offset.
    let numericalValues = []; // Array to store the resulting integers.
    for (let jdx = 0; jdx < stringParts.length; jdx++) {
        numericalValues.push(Number.parseInt(stringParts[jdx], 10)); // Convert each part to an integer and add it to the array.
    }
    return numericalValues; // Return the array of numbers.
}

// Creates an array of numbers within a specified range.
function generateSequence(startValue, endLimit) {
    let sequenceArray = []; // Container for the generated numbers.
    for (; startValue < endLimit; startValue += 1) {
        sequenceArray.push(startValue); // Add the current number to the sequence.
    }
    return sequenceArray; // Deliver the complete sequence.
}

// Ascertains the larger of two given numeric inputs.
function findMaximum(valA, valB) {
    return valA > valB ? valA : valB; // Ternary operator to pick the greater value.
}

// Ascertains the smaller of two given numeric inputs.
function findMinimum(valA, valB) {
    return valA < valB ? valA : valB; // Ternary operator to pick the lesser value.
}

/**
 * Generates a comparison function for sorting objects based on a specific property.
 * @param {string} propertyIdentifier - The name of the property to compare.
 * @returns {function(object, object): number} A comparison function suitable for Array.prototype.sort.
 */
function createComparatorByKey(propertyIdentifier) {
    return function(elementOne, elementTwo) {
        if (elementOne[propertyIdentifier] < elementTwo[propertyIdentifier]) {
            return -1; // elementOne comes before elementTwo
        } else if (elementOne[propertyIdentifier] > elementTwo[propertyIdentifier]) {
            return 1; // elementOne comes after elementTwo
        }
        return 0; // elements are considered equal
    };
}

/**
 * Computes the sum of all numeric elements within an array.
 * @returns {number} The total sum of array elements.
 */
Array.prototype.calculateTotal = function aggregateNumbers() {
    // Using reduce for summation is a common and idiomatic way.
    const accumulator = this.reduce((total, currentElement) => total + currentElement, 0);
    return accumulator;
};

// Adds a formatting utility to Array prototype to pad numbers with leading spaces.
Array.prototype.formatPadded = function alignAndPad() {
    return this.map(function(valueItem) {
        // Pads the number with leading spaces to a fixed width (e.g., 5 characters).
        return ('     ' + valueItem).slice(-5);
    });
};

/*
 * This section contains the primary logic for processing multi-line numerical input.
 * It calculates row-wise and column-wise sums for a matrix-like structure.
 */

// The main processing function for handling structured input data.
function processInputData(incomingText) {
    let dataLines = incomingText.split('\n'); // Separate the input into distinct lines.

    // Loop as long as there are lines to process.
    while (dataLines.length > 0) {
        // Initialize an array to store column-wise sums.
        let columnTotals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Supports up to 10 columns + 1 for row sum.

        // Read the number of rows (N) for the current block, converting it to a number.
        const rowCount = Number(dataLines.shift());

        // If N is zero, it signifies the end of input blocks.
        if (rowCount === 0) {
            return; // Terminate execution.
        }

        // Iterate through each row of the current data block.
        for (let rowIterator = 0; rowIterator < rowCount; rowIterator++) {
            // Parse the current line into an array of integers.
            let currentLineValues = parseIntegerList(dataLines.shift());
            // Calculate the sum of elements in the current row and append it.
            currentLineValues.push(currentLineValues.calculateTotal());

            // Display the formatted current row (including its sum).
            displayMessage(currentLineValues.formatPadded().join(''));

            // Accumulate values into column totals.
            for (let colIterator = 0; colIterator < rowCount + 1; colIterator++) {
                columnTotals[colIterator] += currentLineValues[colIterator];
            }
        }
        // After processing all rows, display the formatted column totals.
        // splice is used to extract the relevant portion of columnTotals and then format it.
        displayMessage(columnTotals.splice(0, rowCount + 1).formatPadded().join(''));
    }
}

// Execution entry point: Reads input from a file and passes it to the main processing function.
// In a production environment, you might read from '/dev/stdin' for competitive programming.
processInputData(require('node:fs').readFileSync('data.txt', 'utf-8'));