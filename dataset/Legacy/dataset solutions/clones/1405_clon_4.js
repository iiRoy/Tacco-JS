var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = sourceData.trim().split("\n");

var finalResult = lineSegments.reduce((accumulator, currentLine, index, array) => {
    if (currentLine === "0 0") {
        array.splice(1); // Stop further processing by emptying the array after this point
        return accumulator;
    }

    var dimensions = currentLine.split(" ").map(Number);
    var rows = dimensions[0];
    var cols = dimensions[1];

    var rowPattern = "#".repeat(cols);
    var gridPattern = Array(rows).fill(rowPattern).join("\n");

    return accumulator + gridPattern + "\n\n";
}, "");

console.log(finalResult.trim());
