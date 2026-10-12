var inputLines = [];
var inputReaderModule = require('readline');

var lineInterface = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineInterface.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

lineInterface.on('close', function () {
    var firstLineParts = inputLines[0].split(" ");
    var totalElements = Number(firstLineParts[0]);
    var subArraySize = Number(firstLineParts[1]);

    var dataArray = inputLines[1].split(" ").map(valStr => Number(valStr));

    var minDistance = Infinity;
    const absoluteValue = Math.abs;

    for (var startIndex = 0; startIndex < totalElements - subArraySize + 1; startIndex++) {
        var leftIndex = startIndex;
        var rightIndex = startIndex + subArraySize - 1;

        var currentLeftValue = dataArray[leftIndex];
        var currentRightValue = dataArray[rightIndex];

        var segmentAbsoluteDifference = absoluteValue(currentRightValue - currentLeftValue);

        // Calculate distance for path 1: 0 -> Left endpoint -> Right endpoint
        var distancePathOne = absoluteValue(currentLeftValue) + segmentAbsoluteDifference;

        // Calculate distance for path 2: 0 -> Right endpoint -> Left endpoint
        var distancePathTwo = absoluteValue(currentRightValue) + segmentAbsoluteDifference;

        minDistance = Math.min(minDistance, distancePathOne, distancePathTwo);
    }
    console.log(minDistance);
});
