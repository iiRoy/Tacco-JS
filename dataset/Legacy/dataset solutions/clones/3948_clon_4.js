var inputBuffer = [];
var ioHandler = require('readline');

var streamProcessor = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

streamProcessor.on('line', function (inputLine) {
    inputBuffer.push(inputLine);
});

streamProcessor.on('close', function () {
    var elementCount = Number(inputBuffer[0]);
    var sourceValues = inputBuffer[1].split(" ").map(valStr => Number(valStr));

    for (let currentRemovalIndex = 0; currentRemovalIndex < elementCount; currentRemovalIndex++) {
        const pathSequence = [0]; // Start with the initial 0 point

        // Construct the sequence of points for the current removal scenario
        for (let i = 0; i < elementCount; i++) {
            if (i !== currentRemovalIndex) {
                pathSequence.push(sourceValues[i]);
            }
        }
        pathSequence.push(0); // End with the final 0 point

        // Calculate the total travel cost for this specific path using a functional reducer
        const totalTravelCost = pathSequence.slice(1).reduce((accumulator, currentPoint, index) => {
            // 'index' in slice(1) refers to the index within the sliced array.
            // To get the previous point from the original 'pathSequence', we use 'index' directly.
            const previousPoint = pathSequence[index];
            return accumulator + Math.abs(currentPoint - previousPoint);
        }, 0);

        console.log(totalTravelCost);
    }
});
