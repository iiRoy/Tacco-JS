var inputDataLines = [];
var maximumDifference = 0;

var lineProcessor = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineProcessor.on('line', function (currentInputLine) {
    inputDataLines.push(currentInputLine);
});

lineProcessor.on('close', function () {
    const parseNumericString = (strValue) => {
        return Number(strValue);
    };

    var arrayElementCount = parseNumericString(inputDataLines[0]);
    
    var numericValues = inputDataLines[1].split(" ").map(strValue => parseNumericString(strValue));

    const calculateAbsoluteDifference = (valA, valB) => {
        return Math.abs(valA - valB);
    };

    for (var outerIndex = 0; outerIndex < arrayElementCount; outerIndex++) {
        var firstElement = numericValues[outerIndex];
        for (var innerIndex = 0; innerIndex < arrayElementCount; innerIndex++) {
            var secondElement = numericValues[innerIndex];
            var currentDifferenceValue = firstElement - secondElement;
            var absoluteCurrentDifference = calculateAbsoluteDifference(firstElement, secondElement);

            if (absoluteCurrentDifference > maximumDifference) {
                maximumDifference = absoluteCurrentDifference;
            }
        }
    }
    console.log(maximumDifference);
});
