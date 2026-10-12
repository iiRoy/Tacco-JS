function swapElements(array, indexA, indexB) {
    var tempVal = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = tempVal;
}

function rearrangeSegment(arr, startIdx, endIdx) {
    var pivotElement = arr[endIdx];
    var boundaryIdx = startIdx - 1;

    for (var currentIdx = startIdx; currentIdx < endIdx; currentIdx++) {
        if (arr[currentIdx] <= pivotElement) {
            boundaryIdx++;
            swapElements(arr, boundaryIdx, currentIdx);
        }
    }
    swapElements(arr, boundaryIdx + 1, endIdx);

    return boundaryIdx + 1;
}

function readStandardInput() {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
}

function parseNumericValue(itemString) {
    return +itemString;
}

var rawInputData = readStandardInput();
var processedLines = rawInputData.split('\n');

var numElementsCount = parseNumericValue(processedLines.shift());
var numericArray = processedLines.shift().split(' ').map(parseNumericValue);

var lastElementIndex = numericArray.length - 1;
var finalPivotPosition = rearrangeSegment(numericArray, 0, lastElementIndex);

var formattedPivotString = '[' + numericArray[finalPivotPosition] + ']';
numericArray[finalPivotPosition] = formattedPivotString;

console.log(numericArray.join(' '));
