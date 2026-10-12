var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawInputContent.trim()).split("\n"); // Process raw input into an array of lines.

var collectedRows = []; // This array will store processed numerical rows.
var dimensionSize; // This variable will hold the 'N' value from the input.

// Iterate over each line obtained from the input.
for (var lineIndex = 0; lineIndex < lineSegments.length; lineIndex++) {
    // Convert the current line string into an array of numbers.
    var currentLineValues = lineSegments[lineIndex].split(" ").map(Number);

    // Check if the current line contains only a single number.
    if (currentLineValues.length === 1) {
        // If this is the very first line of input, initialize 'dimensionSize' and skip to the next line.
        if (lineIndex === 0) {
            dimensionSize = currentLineValues[0];
            continue;
        }

        // Initialize an array to accumulate column totals, filled with zeros.
        var totalSums = [];
        for (var idx = 0; idx < dimensionSize + 1; idx++) {
            totalSums.push(0);
        }

        // For each row previously collected, perform calculations and print.
        collectedRows.forEach(function (currentRow) {
            // Add elements of the current row to their respective column totals.
            for (var colIndex = 0; colIndex < dimensionSize + 1; colIndex++) {
                totalSums[colIndex] += currentRow[colIndex];
            }
            // Format the current row's numbers with leading spaces for consistent width.
            currentRow = currentRow.map(function (numericValue) {
                return ("     " + numericValue).slice(-5);
            });
            // Output the formatted row.
            console.log(currentRow.join(""));
        });

        // Format the final total sums array for output.
        totalSums = totalSums.map(function (numericValue) {
            return ("     " + numericValue).slice(-5);
        });
        // Output the formatted total sums.
        console.log(totalSums.join(""));

        // If the single number on the line is zero, it signifies the end of input processing.
        if (currentLineValues[0] === 0) {
            break;
        }

        // Reset the collected rows for the next block of data.
        collectedRows = [];
        // Update 'dimensionSize' with the new value from the current line.
        dimensionSize = currentLineValues[0];
    } else {
        // If the line contains multiple numbers, calculate their sum.
        var rowTotal = currentLineValues.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue;
        });
        // Append the calculated sum to the end of the current line's values.
        currentLineValues.push(rowTotal);
        // Add this augmented row to the collection.
        collectedRows.push(currentLineValues);
    }
}
