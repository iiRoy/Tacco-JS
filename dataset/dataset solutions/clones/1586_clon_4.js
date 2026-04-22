const fileSystem = require('fs');

const rawContent = fileSystem.readFileSync('./sample_e.txt', 'utf8');
const allNumericValues = rawContent.trim().split(/\s+/).map(Number);

const gridHeight = allNumericValues[0];
const gridWidth = allNumericValues[1];
const targetPairCount = allNumericValues[2];
const coordinateValues = allNumericValues.slice(3);

const rowInfluence = Array(gridHeight).fill(0);
const colInfluence = Array(gridWidth).fill(0);
const markedLocations = new Set();

for (let i = 0; i < targetPairCount; i++) {
    const currentY = coordinateValues[2 * i] - 1;
    const currentX = coordinateValues[2 * i + 1] - 1;

    rowInfluence[currentY]++;
    colInfluence[currentX]++;
    markedLocations.add(`${currentY},${currentX}`);
}

let highestConcentration = 0;

for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
        let currentCellTally = rowInfluence[r] + colInfluence[c];

        if (markedLocations.has(`${r},${c}`)) {
            currentCellTally--;
        }
        
        if (currentCellTally > highestConcentration) {
            highestConcentration = currentCellTally;
        }
    }
}

console.log(highestConcentration);