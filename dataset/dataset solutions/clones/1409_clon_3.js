var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = rawData.split('\n');

const ZERO_DIMENSION_SUM = 0;
const HASH_CHAR = '#';
const DOT_CHAR = '.';

function extractDimension(dimensionString) {
    return parseInt(dimensionString, 10);
}

while (true) {
    var currentPair = dataLines.shift().split(' ');
    var heightVal = extractDimension(currentPair[0]);
    var widthVal = extractDimension(currentPair[1]);

    var totalDimensionSum = heightVal + widthVal;

    if (totalDimensionSum === ZERO_DIMENSION_SUM) {
        break;
    }

    function determineGridChar(rowIndex, colIndex) {
        return (rowIndex + colIndex) % 2 === 0 ? HASH_CHAR : DOT_CHAR;
    }

    for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        for (var colIdx = 0; colIdx < widthVal; colIdx++) {
            process.stdout.write(determineGridChar(rowIdx, colIdx));
        }
        console.log();
    }
    console.log();
}
