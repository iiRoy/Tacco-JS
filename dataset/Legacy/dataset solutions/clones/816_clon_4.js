const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

function* generateTestCases(lines) {
    let currentLinePointer = 0;
    while (true) {
        const dimensionsRaw = lines[currentLinePointer++].split(" ").map(Number);
        const entityQuantity = dimensionsRaw[0];
        const eventQuantity = dimensionsRaw[1];

        if (entityQuantity === 0 && eventQuantity === 0) {
            return;
        }

        const eventLog = [];
        for (let idx = 0; idx < eventQuantity; idx++) {
            const eventDetails = lines[currentLinePointer++].split(" ").map(Number);
            eventLog.push([eventDetails[0], eventDetails[1] - 1, eventDetails[2] - 1]);
        }

        eventLog.sort((firstEvent, secondEvent) => firstEvent[0] - secondEvent[0]);

        yield {
            totalEntities: entityQuantity,
            interactions: eventLog
        };
    }
}

for (const currentScenario of generateTestCases(inputLines)) {
    const totalEntities = currentScenario.totalEntities;
    const interactions = currentScenario.interactions;

    const immunePopulation = new Set();
    immunePopulation.add(0);

    for (const interactionRecord of interactions) {
        const sourceIndividual = interactionRecord[1];
        const targetIndividual = interactionRecord[2];

        if (immunePopulation.has(sourceIndividual)) {
            immunePopulation.add(targetIndividual);
        }
    }

    const immuneCount = immunePopulation.size;
    console.log(immuneCount);
}
