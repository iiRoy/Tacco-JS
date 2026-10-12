var inputData = [];
var inputReader = require('readline');

var inputHandler = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLine) {
    inputData.push(currentLine);
});

inputHandler.on('close', function () {
    // Parse the first line for total elements and window size
    var firstLineParts = inputData[0].split(" ");
    var totalElements = Number(firstLineParts[0]);
    var windowSize = Number(firstLineParts[1]);

    // Parse the second line for the array of numeric values
    var numericValues = inputData[1].split(" ").map(valStr => Number(valStr));

    var minimumDistance = Infinity; // Initialize with a very large value

    // Iterate through possible window starting positions
    for (var idx = 0; idx + windowSize - 1 < totalElements; idx++) {
        var leftBound = idx;
        var rightBound = idx + windowSize - 1;

        // Calculate distance for path 1: 0 -> rightmost -> leftmost
        var pathOneResult = Math.abs(numericValues[leftBound]) + Math.abs(numericValues[rightBound] - numericValues[leftBound]);
        // Calculate distance for path 2: 0 -> leftmost -> rightmost
        var pathTwoResult = Math.abs(numericValues[rightBound]) + Math.abs(numericValues[rightBound] - numericValues[leftBound]);

        // Update the minimum distance found so far
        minimumDistance = Math.min(minimumDistance, pathOneResult, pathTwoResult);
    }
    console.log(minimumDistance);
});
