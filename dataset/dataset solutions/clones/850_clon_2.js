const fileSystem = require('fs');

const numericReadings = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const crystalCount = numericReadings[0];
const energyLevels = numericReadings.slice(
    1,
    crystalCount + 1
);

let strongestCombination = -Infinity;

for (
    let firstCrystal = 0;
    firstCrystal < energyLevels.length;
    firstCrystal++
) {
    for (
        let secondCrystal = firstCrystal + 1;
        secondCrystal < energyLevels.length;
        secondCrystal++
    ) {
        const generatedEnergy =
            energyLevels[firstCrystal] *
            energyLevels[secondCrystal];

        if (generatedEnergy > strongestCombination) {
            strongestCombination = generatedEnergy;
        }
    }
}

console.log(strongestCombination);