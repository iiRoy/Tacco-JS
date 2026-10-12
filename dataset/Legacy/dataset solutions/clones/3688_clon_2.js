var parseInteger = value => parseInt(value, 10);

var parseIntegerArray = inputArray => inputArray.map(item => parseInteger(item));

var absoluteValue = number => number > 0 ? number : -number;

function findMinimum() {
    var argumentList = arguments;
    var currentMinMax = argumentList[0];
    for (var idx = 1; idx < argumentList.length; idx++) {
        if (argumentList[idx] < currentMinMax) {
            currentMinMax = argumentList[idx];
        }
    }
    return currentMinMax;
}

function findMaximum() {
    var argumentList = arguments;
    var currentMinMax = argumentList[0];
    for (var idx = 1; idx < argumentList.length; idx++) {
        if (argumentList[idx] > currentMinMax) {
            currentMinMax = argumentList[idx];
        }
    }
    return currentMinMax;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
    var parsedData = rawData.split(' ');
    var firstValue = parseInteger(parsedData[0]);
    var secondValue = parseInteger(parsedData[1]);
    var thirdValue = parseInteger(parsedData[2]);
    var resultantValue = (firstValue - thirdValue) * (secondValue - 1) / (firstValue * firstValue);
    if (thirdValue !== 0) {
        resultantValue *= 2;
    }
    console.log(resultantValue);
}
