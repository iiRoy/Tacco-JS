const processInput = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineBuffer = processInput.trim().split("\n");
let lineCursor = 0;

function findLargestIndexLE(sourceArray, targetValue, searchStartIdx) {
    let lowBound = searchStartIdx;
    let highBound = sourceArray.length - 1;
    let bestMatchIdx = -1;

    while (lowBound <= highBound) {
        const midPoint = Math.floor((lowBound + highBound) / 2);
        if (sourceArray[midPoint] <= targetValue) {
            bestMatchIdx = midPoint;
            lowBound = midPoint + 1;
        } else {
            highBound = midPoint - 1;
        }
    }
    return bestMatchIdx;
}

while (true) {
    const currentConfig = lineBuffer[lineCursor++].split(" ").map(Number);
    const countN = currentConfig[0];
    const limitM = currentConfig[1];

    if (countN === 0 && limitM === 0) break;

    const initialNumbers = [];
    for (let k = 0; k < countN; k++) {
        initialNumbers.push(Number(lineBuffer[lineCursor++]));
    }
    initialNumbers.push(0);

    const sumCollector = new Set();
    initialNumbers.forEach((valA, idxA) => {
        initialNumbers.slice(idxA).forEach(valB => {
            sumCollector.add(valA + valB);
        });
    });

    const distinctSums = Array.from(sumCollector).sort((a, b) => a - b);

    let greatestSum = 0;
    for (let idxA = 0; idxA < distinctSums.length; idxA++) {
        const termA = distinctSums[idxA];
        const requiredTermB = limitM - termA;
        
        const idxB = findLargestIndexLE(distinctSums, requiredTermB, idxA);

        if (idxB !== -1) {
            greatestSum = Math.max(greatestSum, termA + distinctSums[idxB]);
        }
    }
    console.log(greatestSum);
}
