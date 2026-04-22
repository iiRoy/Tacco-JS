const fileSystemOperations = require('fs');
const acquiredContent = fileSystemOperations.readFileSync(0, 'utf8').trim();
const entrySegments = acquiredContent.split('\n');

function determineJosephusResult(populationTotal, removalInterval) {
    let finalParticipantIndex = 0; // Represents 0-indexed position
    for (let currentPopulation = 1; currentPopulation <= populationTotal; currentPopulation++) {
        finalParticipantIndex = (finalParticipantIndex + removalInterval) % currentPopulation;
    }
    return finalParticipantIndex + 1; // Convert to 1-indexed identifier
}

for (const currentSegment of entrySegments) {
    const numericalParts = currentSegment.split(' ');
    const populationQuantity = parseInt(numericalParts[0], 10);
    const eliminationIncrement = parseInt(numericalParts[1], 10);

    if (populationQuantity === 0 && eliminationIncrement === 0) {
        break;
    }

    const survivingIdentifier = determineJosephusResult(populationQuantity, eliminationIncrement);
    console.log(survivingIdentifier);
}