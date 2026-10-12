function processCandyDistribution(rawData) {
    const NEWLINE_DELIMITER = '\n';
    const SPACE_DELIMITER = ' ';

    const inputLines = rawData.split(NEWLINE_DELIMITER);

    const firstLineParts = inputLines[0].split(SPACE_DELIMITER);
    const totalParticipants = Number(firstLineParts[0]);
    const availableCandy = Number(firstLineParts[1]);

    let demandValues = inputLines[1].split(SPACE_DELIMITER).map(Number);

    demandValues.sort(function(valA, valB) {
        return valA - valB;
    });

    let currentCandySum = 0;
    let satisfiedParticipantsCount = 0;

    for (let idx = 0; idx < totalParticipants; idx++) {
        const currentDemand = demandValues[idx];
        currentCandySum += currentDemand;
        satisfiedParticipantsCount++;
        
        if (currentCandySum > availableCandy) {
            console.log(satisfiedParticipantsCount - 1);
            return;
        }
    }

    console.log(satisfiedParticipantsCount);
}

processCandyDistribution(require('fs').readFileSync('/dev/stdin', 'utf8'));
