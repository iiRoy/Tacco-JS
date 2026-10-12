const fileSystem = require('fs');

const numericInput = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const towerCount = numericInput[0];
const lunarTowers = numericInput.slice(1, towerCount + 1);

const westernPeaks = new Array(towerCount).fill(0);
const easternPeaks = new Array(towerCount).fill(0);

westernPeaks[0] = lunarTowers[0];

for (let position = 1; position < towerCount; position++) {
    westernPeaks[position] = Math.max(
        westernPeaks[position - 1],
        lunarTowers[position]
    );
}

easternPeaks[towerCount - 1] = lunarTowers[towerCount - 1];

for (let position = towerCount - 2; position >= 0; position--) {
    easternPeaks[position] = Math.max(
        easternPeaks[position + 1],
        lunarTowers[position]
    );
}

let collectedMaterial = 0;

for (let position = 0; position < towerCount; position++) {
    const storageCeiling = Math.min(
        westernPeaks[position],
        easternPeaks[position]
    );

    collectedMaterial += Math.max(
        0,
        storageCeiling - lunarTowers[position]
    );
}

console.log(collectedMaterial);