const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedInputString = rawData.trim().replace(/W/g, "0").replace(/B/g, "1").replace(/R/g, "2");
let inputLines = processedInputString.split("\n");

const dimensionsArray = inputLines.shift().split(" ").map(Number);
const numRows = dimensionsArray[0];
const numCols = dimensionsArray[1];

const calculateRowColorDeficits = (rowString, totalColumns) => {
    let deficits = [totalColumns, totalColumns, totalColumns];
    for (let charIndex = 0; charIndex < totalColumns; charIndex++) {
        const colorCode = parseInt(rowString[charIndex], 10);
        deficits[colorCode]--;
    }
    return deficits;
};

const rowDeficitMatrices = inputLines.map(rowString => calculateRowColorDeficits(rowString, numCols));

let minimumTotalCost = Infinity;

for (let whiteZoneEndIndex = 0; whiteZoneEndIndex < numRows; whiteZoneEndIndex++) {
    for (let blueZoneEndIndex = 0; blueZoneEndIndex < numRows; blueZoneEndIndex++) {
        let currentIterationCost = 0;
        let zonePresenceFlags = [0, 0, 0];

        for (let k = 0; k < whiteZoneEndIndex; k++) {
            zonePresenceFlags[0] = 1;
            currentIterationCost += rowDeficitMatrices[k][0];
        }

        for (let k = whiteZoneEndIndex; k < blueZoneEndIndex; k++) {
            zonePresenceFlags[1] = 1;
            currentIterationCost += rowDeficitMatrices[k][1];
        }

        for (let k = blueZoneEndIndex; k < numRows; k++) {
            zonePresenceFlags[2] = 1;
            currentIterationCost += rowDeficitMatrices[k][2];
        }

        if (zonePresenceFlags[0] === 1 && zonePresenceFlags[1] === 1 && zonePresenceFlags[2] === 1) {
            minimumTotalCost = Math.min(currentIterationCost, minimumTotalCost);
        }
    }
}

console.log(minimumTotalCost);
