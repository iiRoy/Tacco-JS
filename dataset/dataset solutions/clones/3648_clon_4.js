let inputStringHolder;
let finalAccumulator = 0;
const sequenceBase = ["X", "Y", "Z"];
const primeDivisor = 1000000007;

const inputProcessor = require('readline');
const dataInterface = inputProcessor.createInterface({
    input: process.stdin,
    output: process.stdout,
});

dataInterface.on('line', (dataLine) => {
    inputStringHolder = dataLine;
});

dataInterface.on('close', () => {
    const originalCharacters = inputStringHolder.split("");
    const wildcardPositions = [];
    for (let k = 0; k < originalCharacters.length; k++) {
        if (originalCharacters[k] === "?") {
            wildcardPositions.push(k);
        }
    }

    const numWildcards = wildcardPositions.length;
    const totalVariations = Math.pow(3, numWildcards);

    for (let variationIndex = 0; variationIndex < totalVariations; variationIndex++) {
        let currentSequence = [...originalCharacters];
        let tempValue = variationIndex;

        for (let q = 0; q < numWildcards; q++) {
            const charSelector = tempValue % 3;
            currentSequence[wildcardPositions[q]] = sequenceBase[charSelector];
            tempValue = Math.floor(tempValue / 3);
        }
        evaluateSequence(currentSequence);
    }
    console.log(finalAccumulator);
});

function evaluateSequence(characterSequence) {
    const sequenceLength = characterSequence.length;
    const scoreGrid = Array(sequenceLength).fill(0).map(() => Array(3).fill(0));

    if (characterSequence[0] === sequenceBase[0]) {
        scoreGrid[0][0] = 1;
    }

    for (let k = 1; k < sequenceLength; k++) {
        if (characterSequence[k] === sequenceBase[0]) {
            scoreGrid[k][0] = (scoreGrid[k - 1][0] + 1);
        } else {
            scoreGrid[k][0] = scoreGrid[k - 1][0];
        }
    }

    for (let p = 1; p < 3; p++) {
        const segmentTally = {};
        for (let k = 1; k < sequenceLength; k++) {
            if (characterSequence[k] === sequenceBase[p] && scoreGrid[k - 1][p - 1] !== 0) {
                scoreGrid[k][p] = scoreGrid[k - 1][p - 1] + (segmentTally[characterSequence[k]] || 0);
                segmentTally[characterSequence[k]] = (segmentTally[characterSequence[k]] || 0) + 1;
            } else {
                scoreGrid[k][p] = scoreGrid[k - 1][p];
            }
        }
    }
    finalAccumulator = (finalAccumulator + scoreGrid[sequenceLength - 1][2]) % primeDivisor;
}