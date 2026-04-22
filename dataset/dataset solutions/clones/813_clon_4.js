const acquireInputContent = () => {
    const rawContent = require('node:fs').readFileSync(0, 'utf8');
    return rawContent.trim().split('\n');
};

function* contentLineStream(linesCollection) {
    for (const textUnit of linesCollection) {
        yield textUnit;
    }
}

const parseNumericLine = (lineString) => lineString.split(/\s+/).map(Number);

const computeUnaffectedCount = (totalEntities, interactionRecords) => {
    let currentUnaffectedSet = new Set([0]);

    const chronologicallyOrderedRecords = interactionRecords.sort((recA, recB) => recA[0] - recB[0]);

    const finalUnaffectedSet = chronologicallyOrderedRecords.reduce((accumulatorSet, currentRecord) => {
        const [momentOfInteraction, firstParticipant, secondParticipant] = currentRecord;
        
        if (accumulatorSet.has(firstParticipant)) {
            accumulatorSet.add(secondParticipant);
        }
        return accumulatorSet;
    }, currentUnaffectedSet);

    return finalUnaffectedSet.size;
};

const orchestrateScenarios = (lineIteratorSource) => {
    const scenarioResults = [];
    let currentStreamUnit;

    while ((currentStreamUnit = lineIteratorSource.next().value) !== undefined) {
        const [entityPopulationSize, interactionEventCount] = parseNumericLine(currentStreamUnit);

        if (entityPopulationSize === 0 && interactionEventCount === 0) {
            break;
        }

        const eventsForCurrentScenario = [];
        for (let k = 0; k < interactionEventCount; k++) {
            const eventUnit = lineIteratorSource.next().value;
            const [eventTimestamp, participantIdentifierA, participantIdentifierB] = parseNumericLine(eventUnit);
            eventsForCurrentScenario.push([eventTimestamp, participantIdentifierA - 1, participantIdentifierB - 1]);
        }
        
        scenarioResults.push(computeUnaffectedCount(entityPopulationSize, eventsForCurrentScenario));
    }
    return scenarioResults;
};

const allInputLines = acquireInputContent();
const lineIterator = contentLineStream(allInputLines);

const finalOutcomeList = orchestrateScenarios(lineIterator);

finalOutcomeList.forEach(outcome => console.log(outcome));