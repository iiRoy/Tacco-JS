const acquiredText = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = acquiredText.trim().split('\n');

const totalGameRounds = Number(processedLines[0]);
const dataPayload = processedLines.slice(1);

const scoringRules = {
    'greater': (currentFirst, currentSecond, valA, valB) => [currentFirst + valA + valB, currentSecond],
    'lesser': (currentFirst, currentSecond, valA, valB) => [currentFirst, currentSecond + valA + valB],
    'equal': (currentFirst, currentSecond, valA, valB) => [currentFirst + valA, currentSecond + valB]
};

function calculateOutcome(gameDataFragments, presentScores, currentRoundIndex) {
    if (currentRoundIndex >= gameDataFragments.length) {
        return presentScores;
    }

    const roundDataString = gameDataFragments[currentRoundIndex];
    
    const separatorPos = roundDataString.indexOf(' ');
    const participantOneValue = parseInt(roundDataString.substring(0, separatorPos), 10);
    const participantTwoValue = parseInt(roundDataString.substring(separatorPos + 1), 10);

    let comparisonResultKey;
    if (participantOneValue > participantTwoValue) {
        comparisonResultKey = 'greater';
    } else if (participantOneValue < participantTwoValue) {
        comparisonResultKey = 'lesser';
    } else {
        comparisonResultKey = 'equal';
    }

    const updateScoringFunction = scoringRules[comparisonResultKey];
    const [nextScoreForOne, nextScoreForTwo] = updateScoringFunction(
        presentScores[0],
        presentScores[1],
        participantOneValue,
        participantTwoValue
    );

    return calculateOutcome(gameDataFragments, [nextScoreForOne, nextScoreForTwo], currentRoundIndex + 1);
}

const finalGameResults = calculateOutcome(dataPayload, [0, 0], 0);

console.log(finalGameResults[0] + ' ' + finalGameResults[1]);