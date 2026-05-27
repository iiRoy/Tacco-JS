const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

const parseNumericLine = (lineString) => {
    return lineString.split(" ").map(Number);
};

let currentLinePointer = 0;

while (true) {
    const lineData = inputLines[currentLinePointer++];
    const [totalPeople, skipCount, initialPosition] = parseNumericLine(lineData);

    const isTerminationConditionMet = (totalPeople === 0 && skipCount === 0 && initialPosition === 0);
    if (isTerminationConditionMet) {
        break;
    }

    const participantStatus = Array(totalPeople).fill(true);

    let currentEliminationIndex = initialPosition - 1;

    let activeParticipantCount = totalPeople;

    while (activeParticipantCount > 1) {
        participantStatus[currentEliminationIndex] = false;
        activeParticipantCount--;

        let skippedActiveCounter = 0;
        const requiredSkips = skipCount;

        while (skippedActiveCounter < requiredSkips) {
            currentEliminationIndex = (currentEliminationIndex + 1) % totalPeople;

            if (participantStatus[currentEliminationIndex]) {
                skippedActiveCounter++;
            }
        }
    }

    for (let originalPersonIndex = 0; originalPersonIndex < totalPeople; originalPersonIndex++) {
        const isPersonStillActive = participantStatus[originalPersonIndex];
        if (isPersonStillActive) {
            console.log(originalPersonIndex + 1);
            break;
        }
    }
}
