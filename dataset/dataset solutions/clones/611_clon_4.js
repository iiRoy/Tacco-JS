const { readFileSync: acquireFileContents } = require('fs');

function* patternProducer(characterSequence) {
    for (let separatorCount = 0; separatorCount < 47; ++separatorCount) {
        const currentSeparator = '.'.repeat(separatorCount);
        const constructedPattern = characterSequence.join(currentSeparator);

        if (Number(constructedPattern) >= 100) {
            return;
        }
        yield constructedPattern;
    }
}

const rawTextData = acquireFileContents('/dev/stdin', 'utf8');
const processedLines = rawTextData.trim().split('\n');

const targetStringQuantity = Number(processedLines.shift());
const baseCharacterArray = processedLines.shift().split('');

let successfulMatchCount = 0;

for (let currentTargetIdx = 0; currentTargetIdx < targetStringQuantity; ++currentTargetIdx) {
    const currentTargetValue = processedLines[currentTargetIdx];

    for (const candidatePattern of patternProducer(baseCharacterArray)) {
        const patternRegex = new RegExp(candidatePattern);
        if (patternRegex.test(currentTargetValue)) {
            successfulMatchCount++;
            break;
        }
    }
}

console.log(successfulMatchCount);
