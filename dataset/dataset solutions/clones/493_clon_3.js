var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

const MAX_SCORE_LIMIT = 5000;
const INITIAL_PROBABILITY = 1;

while (true) {
    const configLine = lineBuffer.shift();
    const configParams = configLine.split(" ").map(Number);

    if (configParams.every(param => param === 0)) {
        break;
    }

    const [numOutcomes, targetPosition, numSpecialEvents] = configParams;

    const moveValues = lineBuffer.shift().split(" ").map(Number);

    const specialEvents = new Array(targetPosition + 1).fill(null);
    for (let eventIdx = 0; eventIdx < numSpecialEvents; eventIdx++) {
        const eventDetails = lineBuffer.shift().split(" ").map(Number);
        const eventTriggerPos = eventDetails[0];
        const eventType = eventDetails[1];
        const eventAmount = eventDetails[2];
        specialEvents[eventTriggerPos] = { type: eventType, amount: eventAmount };
    }

    const probabilityMatrix = [];
    for (let pos = 0; pos <= targetPosition; pos++) {
        probabilityMatrix[pos] = new Array(MAX_SCORE_LIMIT + 1).fill(0);
    }
    probabilityMatrix[0][0] = INITIAL_PROBABILITY;

    for (let currentPos = 0; currentPos < targetPosition; currentPos++) {
        for (let currentScore = 0; currentScore <= MAX_SCORE_LIMIT; currentScore++) {
            const currentProbability = probabilityMatrix[currentPos][currentScore];
            if (currentProbability === 0) {
                continue; // Skip if no probability to propagate from this state
            }

            const probabilityPerOutcome = currentProbability / numOutcomes;

            for (let outcomeIdx = 0; outcomeIdx < numOutcomes; outcomeIdx++) {
                const moveStep = moveValues[outcomeIdx];
                const nextPositionCandidate = currentPos + moveStep;
                const actualNextPosition = Math.min(targetPosition, nextPositionCandidate);

                const eventInfo = specialEvents[actualNextPosition];

                if (eventInfo) {
                    const { type: eventType, amount: eventAmount } = eventInfo;
                    if (eventType === 1) {
                        const finalPositionAfterEvent = Math.min(targetPosition, actualNextPosition + eventAmount);
                        probabilityMatrix[finalPositionAfterEvent][currentScore] += probabilityPerOutcome;
                    } else if (eventType === 2) {
                        const finalScoreAfterEvent = Math.min(MAX_SCORE_LIMIT, currentScore + eventAmount);
                        probabilityMatrix[actualNextPosition][finalScoreAfterEvent] += probabilityPerOutcome;
                    } else if (eventType === 3) {
                        const finalScoreAfterEvent = Math.max(0, currentScore - eventAmount);
                        probabilityMatrix[actualNextPosition][finalScoreAfterEvent] += probabilityPerOutcome;
                    }
                } else {
                    probabilityMatrix[actualNextPosition][currentScore] += probabilityPerOutcome;
                }
            }
        }
    }

    let expectedScoreSum = 0;
    for (let finalScore = 0; finalScore <= MAX_SCORE_LIMIT; finalScore++) {
        expectedScoreSum += finalScore * probabilityMatrix[targetPosition][finalScore];
    }

    console.log(Math.floor(expectedScoreSum));
}
