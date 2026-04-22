const fileAccessUtility = require("fs");

const entireInputContent = fileAccessUtility.readFileSync("/dev/stdin", "UTF-8");

const primarySequence = entireInputContent.split("\n")[0];

const sequenceTotalLength = primarySequence.length;

if (sequenceTotalLength === 0) {
    console.log(0);
    return;
}

const transitionPoints = Array.from(primarySequence)
    .slice(1)
    .map((charValue, relativeIndex) => ({
        currentCharacter: charValue,
        absoluteIndex: relativeIndex + 1
    }))
    .filter((item) => {
        return item.currentCharacter !== primarySequence[item.absoluteIndex - 1];
    })
    .map((item) => item.absoluteIndex);

let finalSeparationScore;

if (transitionPoints.length === 0) {
    finalSeparationScore = sequenceTotalLength;
} else {
    const potentialScores = transitionPoints.map((transitionIndex) => {
        return Math.max(transitionIndex, sequenceTotalLength - transitionIndex);
    });

    finalSeparationScore = Math.min(...potentialScores);
}

console.log(finalSeparationScore);