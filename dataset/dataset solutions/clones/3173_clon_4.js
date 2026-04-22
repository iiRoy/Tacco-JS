const g_fileSystem = require('fs');

const allInputLines = g_fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const firstLineComponents = allInputLines.shift().split(' ').map(Number);
const totalSticksCount = firstLineComponents[0];
const targetLengthOne = firstLineComponents[1];
const targetLengthTwo = firstLineComponents[2];
const targetLengthThree = firstLineComponents[3];

const availableSticks = allInputLines.map(Number);

let minimumOverallPenalty = Infinity;

const totalAssignmentVariations = Math.pow(4, totalSticksCount);

for (let variationIndex = 0; variationIndex < totalAssignmentVariations; ++variationIndex) {
    let currentConfiguration = [];
    let temporaryIndex = variationIndex;
    for (let stickPosition = 0; stickPosition < totalSticksCount; ++stickPosition) {
        currentConfiguration.push(temporaryIndex % 4); // 0: target 1, 1: target 2, 2: target 3, 3: discard
        temporaryIndex = Math.floor(temporaryIndex / 4);
    }

    let accumulatedLengthOne = 0;
    let accumulatedLengthTwo = 0;
    let accumulatedLengthThree = 0;

    let numberOfSticksOne = 0;
    let numberOfSticksTwo = 0;
    let numberOfSticksThree = 0;

    for (let stickPosition = 0; stickPosition < totalSticksCount; ++stickPosition) {
        const currentStickLength = availableSticks[stickPosition];
        const assignmentCategory = currentConfiguration[stickPosition];
        
        if (currentStickLength > 0) { // Only consider non-zero length sticks
            if (assignmentCategory === 0) {
                accumulatedLengthOne += currentStickLength;
                numberOfSticksOne++;
            } else if (assignmentCategory === 1) {
                accumulatedLengthTwo += currentStickLength;
                numberOfSticksTwo++;
            } else if (assignmentCategory === 2) {
                accumulatedLengthThree += currentStickLength;
                numberOfSticksThree++;
            }
            // assignmentCategory === 3 means discarded, no action needed.
        }
    }

    // A valid configuration requires at least one stick for each target
    if (numberOfSticksOne > 0 && numberOfSticksTwo > 0 && numberOfSticksThree > 0) {
        const joiningPenaltyOne = Math.max(0, numberOfSticksOne - 1) * 10;
        const joiningPenaltyTwo = Math.max(0, numberOfSticksTwo - 1) * 10;
        const joiningPenaltyThree = Math.max(0, numberOfSticksThree - 1) * 10;

        const currentConfigurationPenalty = 
            Math.abs(targetLengthOne - accumulatedLengthOne) +
            Math.abs(targetLengthTwo - accumulatedLengthTwo) +
            Math.abs(targetLengthThree - accumulatedLengthThree) +
            joiningPenaltyOne +
            joiningPenaltyTwo +
            joiningPenaltyThree;

        if (currentConfigurationPenalty < minimumOverallPenalty) {
            minimumOverallPenalty = currentConfigurationPenalty;
        }
    }
}

console.log(minimumOverallPenalty);