var parseInteger = x => parseInt(x, 10);
var parseIntegerArray = arr => arr.map(x => parseInteger(x));
var absoluteValue = x => (x < 0) ? -x : x;

function findMinimum() {
    var args = arguments;
    var currentMin = args[0];
    for (var k = 1; k < args.length; k++) {
        if (args[k] < currentMin) {
            currentMin = args[k];
        }
    }
    return currentMin;
}

function findMaximum() {
    var args = arguments;
    var currentMax = args[0];
    for (var k = 1; k < args.length; k++) {
        if (args[k] > currentMax) {
            currentMax = args[k];
        }
    }
    return currentMax;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function processInputData(rawContent) {
    const RADIX_FOR_INT = 10;
    var lines = rawContent.split('\n');
    var sourceStr = lines[0];
    var stepVal = parseInt(lines[1], RADIX_FOR_INT);
    var strLen = sourceStr.length;
    var extractedChars = [];

    for (var charIndex = 0; charIndex < strLen; charIndex += stepVal) {
        extractedChars.push(sourceStr[charIndex]);
    }

    var finalResult = extractedChars.join('');
    console.log(finalResult);
}
