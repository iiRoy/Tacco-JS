process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputLine) {
    processInput(inputLine);
});

var outputFn = console.log;

function processInput(inputLine) {
    var processedLines = inputLine.split("\n");
    processedLines = processedLines.filter(function(element) {
        return (element !== "");
    });
    executeLogic(processedLines);
}

// Core processing function
function executeLogic(processedLines) {
    var numericData = processedLines.map(function(element) {
        return Number(element);
    });

    while (numericData.length > 1) {
        var segmentSize = numericData.shift();
        var currentSegment = numericData.slice(0, segmentSize);
        numericData = numericData.slice(segmentSize);

        var minIdx = currentSegment.indexOf(Math.min.apply(this, currentSegment));
        currentSegment.splice(minIdx, 1);

        var maxIdx = currentSegment.indexOf(Math.max.apply(this, currentSegment));
        currentSegment.splice(maxIdx, 1);

        var segmentSum = currentSegment.reduce(function(accumulator, currentVal, currentIndex, fullArray) {
            return accumulator + currentVal;
        });

        outputFn(Math.floor(segmentSum / currentSegment.length));
    }
}
