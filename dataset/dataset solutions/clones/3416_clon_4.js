var collectedInputs = [];
var ioFacade = require('readline');

var inputHandler = ioFacade.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (inputLine) {
    collectedInputs.push(inputLine);
});

inputHandler.on('close', function () {
    var initialParameters = collectedInputs[0].split(" ");
    var totalItems = parseFloat(initialParameters[0]);
    var groupSpan = parseFloat(initialParameters[1]);
    collectedInputs.splice(0, 1);

    var heightMeasurements = collectedInputs.map(itemValue => parseFloat(itemValue));

    heightMeasurements.sort((firstElement, secondElement) => firstElement - secondElement);

    var minimumRange = Number.POSITIVE_INFINITY;

    const possibleStartingIndices = Array.from({ length: heightMeasurements.length - groupSpan + 1 }, (_, index) => index);

    minimumRange = possibleStartingIndices.reduce((currentMinDifference, currentWindowStart) => {
        const currentWindowEnd = currentWindowStart + groupSpan - 1;
        const differenceForCurrentWindow = heightMeasurements[currentWindowEnd] - heightMeasurements[currentWindowStart];
        return Math.min(currentMinDifference, differenceForCurrentWindow);
    }, Number.POSITIVE_INFINITY);

    console.log(minimumRange);
});