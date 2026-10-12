function processCandyDistribution(rawInputData) {
    let satisfiedPeopleCount = 0;

    const LINE_DELIMITER = '\n';
    const VALUE_DELIMITER = ' ';

    const inputLines = rawInputData.split(LINE_DELIMITER);

    const firstLineParts = inputLines[0].split(VALUE_DELIMITER);

    const totalParticipants = parseInt(firstLineParts[0], 10);
    const availableCandySupply = parseInt(firstLineParts[1], 10);

    let individualDemands = inputLines[1].split(VALUE_DELIMITER).map(Number);

    const compareDemandsAscending = (demandA, demandB) => demandA - demandB;

    individualDemands.sort(compareDemandsAscending);

    let accumulatedCandyNeeded = 0;

    const loopIterationLimit = totalParticipants;

    for (let participantIndex = 0; participantIndex < loopIterationLimit; participantIndex++) {
        satisfiedPeopleCount = participantIndex;
        
        accumulatedCandyNeeded += individualDemands[participantIndex];

        const supplyExceeded = accumulatedCandyNeeded > availableCandySupply;

        if (supplyExceeded) {
            console.log(satisfiedPeopleCount);
            break;
        }
    }

    console.log(satisfiedPeopleCount);
}

processCandyDistribution(require('fs').readFileSync('/dev/stdin', 'utf8'));
