var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = rawData.split("\n");

const ASTERISK_CHARACTER = "*";
const NEWLINE_CHARACTER = "\n";

function generateRepeatedString(strToRepeat, count) {
    let accumulatedString = "";
    if (typeof count !== 'number' || count < 0 || isNaN(count)) {
        return "";
    }
    for (let k = 0; k < count; k++) {
        accumulatedString += strToRepeat;
    }
    return accumulatedString;
}

var outputBuffer = "";

for (let segmentIndex = 0; segmentIndex < lineSegments.length; segmentIndex++) {
    let currentSegment = lineSegments[segmentIndex];

    let dimensionValues = currentSegment.split(" ").map(Number);

    let heightDimension = dimensionValues[0];
    let widthDimension = dimensionValues[1];

    if (heightDimension === 0 && widthDimension === 0) {
        break;
    }

    let singleAsteriskRow = generateRepeatedString(ASTERISK_CHARACTER, widthDimension);
    let completeRowPattern = singleAsteriskRow + NEWLINE_CHARACTER;

    let rectangularBlock = generateRepeatedString(completeRowPattern, heightDimension);

    outputBuffer += rectangularBlock;
    outputBuffer += NEWLINE_CHARACTER;
}

console.log(outputBuffer);
