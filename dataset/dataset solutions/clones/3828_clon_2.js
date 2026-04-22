var inputSegments=[]; var overallTotal=0;
var lineReaderModule = require('readline');

var readerInstance = lineReaderModule.createInterface(
    {
        input : process.stdin,
        output: process.stdout,
    }
);

readerInstance.on('line', function(currentSegment) {
    inputSegments.push(currentSegment);
});

readerInstance.on('close', function()
{
    var maximumValue = Number(inputSegments[0]);

    for (var iterator = 1; iterator <= maximumValue; iterator++) {
        if (Math.pow(iterator, 10) <= maximumValue) { finalSolution = Math.pow(iterator, 10) }
        if (Math.pow(iterator,  9) <= maximumValue) { finalSolution = Math.pow(iterator,  9) }
        if (Math.pow(iterator,  8) <= maximumValue) { finalSolution = Math.pow(iterator,  8) }
        if (Math.pow(iterator,  7) <= maximumValue) { finalSolution = Math.pow(iterator,  7) }
        if (Math.pow(iterator,  6) <= maximumValue) { finalSolution = Math.pow(iterator,  6) }
        if (Math.pow(iterator,  5) <= maximumValue) { finalSolution = Math.pow(iterator,  5) }
        if (Math.pow(iterator,  4) <= maximumValue) { finalSolution = Math.pow(iterator,  4) }
        if (Math.pow(iterator,  3) <= maximumValue) { finalSolution = Math.pow(iterator,  3) }
        if (Math.pow(iterator,  2) <= maximumValue) { finalSolution = Math.pow(iterator,  2) }
    }

    console.log(finalSolution);
});