const fileSystemModule = require('fs');
const sourcePath = '/dev/stdin';
const fullContent = fileSystemModule.readFileSync(sourcePath, 'utf8');

const lineSegments = [];
let segmentStart = 0;
for (let k = 0; k < fullContent.length; k++) {
    if (fullContent[k] === '\n') {
        let currentSegment = fullContent.substring(segmentStart, k);
        lineSegments.push(currentSegment.trim());
        segmentStart = k + 1;
    }
}
if (segmentStart < fullContent.length) {
    lineSegments.push(fullContent.substring(segmentStart, fullContent.length).trim());
}

function testForPrimal(numberToCheck, currentDivisor = 3) {
    if (numberToCheck < 2) return false;
    if (numberToCheck === 2) return true;
    if (numberToCheck % 2 === 0) return false;

    if (currentDivisor * currentDivisor > numberToCheck) return true;
    if (numberToCheck % currentDivisor === 0) return false;

    return testForPrimal(numberToCheck, currentDivisor + 2);
}

let totalPrimeCount = 0;
let dataPointer = 1;

while (dataPointer < lineSegments.length) {
    const valueToEvaluate = parseInt(lineSegments[dataPointer], 10);
    if (!isNaN(valueToEvaluate) && testForPrimal(valueToEvaluate)) {
        totalPrimeCount++;
    }
    dataPointer++;
}

console.log(totalPrimeCount);