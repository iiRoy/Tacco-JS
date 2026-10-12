"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
let lineSegments = [];

process.stdin.on('data', function (incomingChunk) {
    inputBuffer += incomingChunk;
});

process.stdin.on('end', function () {
    lineSegments = inputBuffer.split('\n');
    executeProcessing();    
});

const calculateAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

function executeProcessing() {
    const INITIAL_MAX_COST = Number.POSITIVE_INFINITY;
	const totalElements = parseInt(lineSegments.shift(), 10);
    
    const rawNumbersString = lineSegments[0];
    const stringNumbers = rawNumbersString.split(' ');
	const valueSequence = stringNumbers.map(str => parseInt(str, 10));

	const minimumPathCosts = Array(totalElements).fill(INITIAL_MAX_COST);
  
  	minimumPathCosts[0] = 0;

    const maxStepDistance = 2; // Corresponds to j = i + 1 and j = i + 2

	for (let currentIdx = 0; currentIdx < totalElements; ++currentIdx) {
		for (let step = 1; step <= maxStepDistance; ++step) {
            let targetIdx = currentIdx + step;
            
            if (targetIdx >= totalElements) {
                continue; // Skip if target index is out of bounds
            }

            const currentValue = valueSequence[currentIdx];
            const targetValue = valueSequence[targetIdx];
            
            const stepCost = calculateAbsoluteDifference(currentValue, targetValue);
            const costFromCurrent = minimumPathCosts[currentIdx] + stepCost;
            
			minimumPathCosts[targetIdx] = Math.min(minimumPathCosts[targetIdx], costFromCurrent);
		}
	}

	console.log(minimumPathCosts[totalElements - 1]);
}
