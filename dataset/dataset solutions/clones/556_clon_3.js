var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = (fileContent.trim()).split("\n");

const TERMINATION_SIGNAL_VALUE = "0 0";

// Helper function to parse dimension strings into numbers
const parseDimensionString = (dimensionText) => dimensionText.split(" ").map(Number);

while (true) {
    var dimensionsLine = lines.shift();

    if (dimensionsLine === TERMINATION_SIGNAL_VALUE) {
        break;
    }

    var parsedDims = parseDimensionString(dimensionsLine);
    var numRows = parsedDims[0];
    var numCols = parsedDims[1];

    // Initialize column aggregates using Array.from for a different structural approach
    var columnAggregates = Array.from({ length: numCols }, (_, index) => ({
        columnIdentifier: index + 1,
        totalSum: 0
    }));

    // Process each data row
    for (var currentRowIndex = 0; currentRowIndex < numRows; currentRowIndex++) {
        var currentDataRow = (lines.shift()).split(" ").map(Number);
        // Iterate through columns to update sums using a traditional for loop
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            columnAggregates[colIndex].totalSum += currentDataRow[colIndex];
        }
    }

    // Sort column aggregates in descending order of totalSum
    columnAggregates.sort(function (itemA, itemB) {
        // Rewriting the comparison logic for clarity and idiomatic JavaScript
        return itemB.totalSum - itemA.totalSum;
    });

    // Extract sorted column identifiers using map
    var resultIdentifiers = columnAggregates.map(entry => entry.columnIdentifier);

    console.log(resultIdentifiers.join(" "));
}
