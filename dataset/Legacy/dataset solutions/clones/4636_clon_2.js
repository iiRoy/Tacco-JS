'use strict'

// Helper Utility Block /////////////////////////////////////

// Global Configuration Values
const ULTRA_HIGH_VAL = 900719925474099; // A substantial numerical upper limit constant.

// Converts a space-separated string of numbers into an array of integers.
function parseNumString(strInput)
{
    return strInput.split(' ').map((itemStr) => parseInt(itemStr, 10));
}

function getLowerBoundIndex(arrData, lowBound, highBound, searchVal) {
    for (
        var centerIndex;
        1 < highBound - lowBound;
    ) {
        centerIndex = 0 | (lowBound + highBound) / 2;
        if (arrData[centerIndex] < searchVal) {
            lowBound = centerIndex;
        } else {
            highBound = centerIndex;
        }
    }
    return arrData[lowBound] < searchVal ? highBound : lowBound;
}

const DIVISOR_PRIME = 1000000007;
// End Helper Utility Block /////////////////////////////////

function PerformCalculation(rawData)
{
    let lineSegments = rawData.trim().split('\n');
    let parsedValues = parseNumString(lineSegments[0]);
    let countEntities = parsedValues[0];
    let segmentLength = parsedValues[1];
    let elapsedTime = parsedValues[2] % segmentLength;

    let primaryDatum = parseNumString(lineSegments[1]);
    let computedLocations = new Array(countEntities);
    let totalShift = 0;
    let interactionTime;

    for (let entityIndex = 1; entityIndex <= countEntities; entityIndex++) {
        parsedValues = parseNumString(lineSegments[entityIndex]);
        // Collision and Interaction Calculation
        interactionTime = elapsedTime + 1; // Default large time

        if (primaryDatum[1] === 2 && parsedValues[1] === 1) { // Direction check for entity 1 (dir 2) vs current entity (dir 1)
            if (primaryDatum[0] < parsedValues[0]) {
                interactionTime = (segmentLength + primaryDatum[0] - parsedValues[0]) / 2;
            } else {
                interactionTime = (primaryDatum[0] - parsedValues[0]) / 2;
            }
            if (interactionTime <= elapsedTime) {
                totalShift += countEntities;
                if (interactionTime + segmentLength / 2 <= elapsedTime) {
                    totalShift -= 2;
                } else {
                    totalShift -= 1;
                }
                totalShift %= countEntities;
            }
            // console.debug('Collision type 2-1:', interactionTime, elapsedTime, totalShift);
        }

        if (primaryDatum[1] === 1 && parsedValues[1] === 2) { // Direction check for entity 1 (dir 1) vs current entity (dir 2)
            if (primaryDatum[0] > parsedValues[0]) {
                interactionTime = (segmentLength - primaryDatum[0] + parsedValues[0]) / 2;
            } else {
                interactionTime = (parsedValues[0] - primaryDatum[0]) / 2;
            }
            if (interactionTime <= elapsedTime) {
                if (interactionTime + segmentLength / 2 <= elapsedTime) {
                    totalShift += 2;
                } else {
                    totalShift += 1;
                }
                totalShift %= countEntities;
            }
            // console.debug('Collision type 1-2:', interactionTime, elapsedTime, totalShift);
        }

        // Final Position Determination
        if (parsedValues[1] === 1) {
            computedLocations[entityIndex - 1] = (parsedValues[0] + elapsedTime) % segmentLength;
        } else {
            computedLocations[entityIndex - 1] = (parsedValues[0] - elapsedTime + segmentLength) % segmentLength;
        }
    }

    let primaryFinalPos = computedLocations[0];
    computedLocations.sort((elemA, elemB) => elemA - elemB);
    let resultIdx = getLowerBoundIndex(computedLocations, 0, computedLocations.length, primaryFinalPos);

    // console.debug('Sorted locations:', computedLocations, 'Anchor pos:', primaryFinalPos, 'Shift:', totalShift, 'Lower bound:', resultIdx);

    // Determine the final sorted order and assign positions
    let arrangedLocations = new Array(countEntities);
    for (let currentPos = 0; currentPos < countEntities; currentPos++) {
        arrangedLocations[totalShift] = computedLocations[resultIdx];
        resultIdx++;
        totalShift++;
        resultIdx %= countEntities;
        totalShift %= countEntities;
    }
    console.log(arrangedLocations.join('\n'));

}

PerformCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));