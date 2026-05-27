const faceRotationMap = new Map([
    ["N", [1, 5, 2, 3, 0, 4]],
    ["S", [4, 0, 2, 3, 5, 1]],
    ["E", [3, 1, 0, 5, 4, 2]],
    ["W", [2, 1, 5, 0, 4, 3]]
]);

function applyDiceRoll(directionKey, currentFaces) {
    const permutationIndices = faceRotationMap.get(directionKey);
    if (!permutationIndices) {
        return currentFaces;
    }
    return permutationIndices.map(originalIndex => currentFaces[originalIndex]);
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInput.trim().split("\n");

let currentDiceConfiguration = processedLines[0].split(" ").map(Number);
const targetPositions = processedLines.slice(2).map(line => line.split(" ").map(Number));
const movementDirections = ["N", "S", "E", "W"];

for (const targetPair of targetPositions) {
    const desiredTop = targetPair[0];
    const desiredFront = targetPair[1];

    while (!(currentDiceConfiguration[0] === desiredTop && currentDiceConfiguration[1] === desiredFront)) {
        const randomDirectionIndex = Math.floor(Math.random() * movementDirections.length);
        const chosenDirection = movementDirections[randomDirectionIndex];
        currentDiceConfiguration = applyDiceRoll(chosenDirection, currentDiceConfiguration);
    }
    console.log(currentDiceConfiguration[2]);
}
