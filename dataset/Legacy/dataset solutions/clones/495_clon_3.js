var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

const parseNumericLine = (buffer) => buffer.shift().split(" ").map(Number);
const isTerminationCondition = (params) => params.join(" ") === "0 0 0";

while (true) {
    const currentParams = parseNumericLine(lineBuffer);

    if (isTerminationCondition(currentParams)) {
        break;
    }

    const paramX = currentParams[0];
    const paramY = currentParams[1];
    const paramZ = currentParams[2];

    const moveValues = parseNumericLine(lineBuffer);

    const specialEvents = [];
    for (let eventIdx = 0; eventIdx < paramZ; eventIdx++) {
        const eventData = parseNumericLine(lineBuffer);
        const eventPosition = eventData[0];
        specialEvents[eventPosition] = [eventData[1], eventData[2]];
    }

    const probabilityMatrix = [];
    const MAX_SCORE_LIMIT = 5000;

    for (let rowIdx = 0; rowIdx <= paramY; rowIdx++) {
        const currentRow = new Array(MAX_SCORE_LIMIT + 1).fill(0);
        probabilityMatrix.push(currentRow);
    }
    probabilityMatrix[0][0] = 1;

    for (let currentStep = 0; currentStep < paramY; currentStep++) {
        for (let moveIdx = 0; moveIdx < paramX; moveIdx++) {
            const stepIncrement = moveValues[moveIdx];
            const nextStep = Math.min(currentStep + stepIncrement, paramY);

            for (let scoreValue = 0; scoreValue <= MAX_SCORE_LIMIT; scoreValue++) {
                const currentProbability = probabilityMatrix[currentStep][scoreValue];

                if (currentProbability === 0) {
                    continue;
                }

                const probabilityContribution = currentProbability / paramX;
                const eventDetails = specialEvents[nextStep];

                if (eventDetails !== undefined) {
                    const eventType = eventDetails[0];
                    const eventAmount = eventDetails[1];

                    if (eventType === 1) {
                        const targetStep = nextStep + eventAmount;
                        const finalTargetStep = Math.min(targetStep, paramY);
                        probabilityMatrix[finalTargetStep][scoreValue] += probabilityContribution;
                    } else if (eventType === 2) {
                        const targetScore = scoreValue + eventAmount;
                        const finalTargetScore = Math.min(targetScore, MAX_SCORE_LIMIT);
                        probabilityMatrix[nextStep][finalTargetScore] += probabilityContribution;
                    } else if (eventType === 3) {
                        const scoreReduction = Math.min(eventAmount, scoreValue);
                        const targetScore = scoreValue - scoreReduction;
                        probabilityMatrix[nextStep][targetScore] += probabilityContribution;
                    }
                } else {
                    probabilityMatrix[nextStep][scoreValue] += probabilityContribution;
                }
            }
        }
    }

    let expectedScore = 0;
    for (let scoreValue = 0; scoreValue <= MAX_SCORE_LIMIT; scoreValue++) {
        expectedScore += scoreValue * probabilityMatrix[paramY][scoreValue];
    }
    console.log(Math.floor(expectedScore));
}
