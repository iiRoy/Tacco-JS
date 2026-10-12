const fileSystem = require('fs');

const numericTokens = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const expectedFrequency = numericTokens[0];
const cosmicReadings = numericTokens.slice(1);
let detectedPair = null;

for (let leftIndex = 0; leftIndex < cosmicReadings.length; leftIndex++) {
    for (
        let rightIndex = leftIndex + 1;
        rightIndex < cosmicReadings.length;
        rightIndex++
    ) {
        if (
            cosmicReadings[leftIndex] + cosmicReadings[rightIndex]
            === expectedFrequency
        ) {
            detectedPair = [leftIndex + 1, rightIndex + 1];
            break;
        }
    }

    if (detectedPair) {
        break;
    }
}

console.log(
    detectedPair
        ? detectedPair.join(' ')
        : 'SIN COINCIDENCIA'
);