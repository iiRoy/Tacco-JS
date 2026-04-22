const sourceContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = sourceContent.trim().split('\n');

let linePointer = 0;
const scenarioOutcomes = [];

while (true) {
    const entityDefinitionCount = parseInt(rawLines[linePointer++], 10);

    if (entityDefinitionCount === 0) {
        break;
    }

    const connectionRegistry = new Map();
    let startingEntityName = '';

    for (let currentDefIndex = 0; currentDefIndex < entityDefinitionCount; currentDefIndex++) {
        const definitionLine = rawLines[linePointer++].split(':');
        const primaryEntity = definitionLine[0];
        const linkedEntities = definitionLine[1].split(',');

        connectionRegistry.set(primaryEntity, linkedEntities);

        if (currentDefIndex === 0) {
            startingEntityName = primaryEntity;
        }
    }

    const normalizeEntityIdentifier = (identifier) => {
        return identifier.replace(/[.](\r\n|\n|\r)/gm, "");
    };

    const discoveredIndividuals = new Set();
    const traversalStack = [startingEntityName];
    const visitedGroups = new Set();
    visitedGroups.add(startingEntityName);

    while (traversalStack.length > 0) {
        const currentFocus = traversalStack.pop();
        const directConnections = connectionRegistry.get(currentFocus) || [];

        for (const connectedItem of directConnections) {
            const cleanedItem = normalizeEntityIdentifier(connectedItem);

            if (connectionRegistry.has(cleanedItem)) {
                if (!visitedGroups.has(cleanedItem)) {
                    visitedGroups.add(cleanedItem);
                    traversalStack.push(cleanedItem);
                }
            } else {
                discoveredIndividuals.add(cleanedItem);
            }
        }
    }
    scenarioOutcomes.push(discoveredIndividuals.size);
}

for (const outcome of scenarioOutcomes) {
    console.log(outcome);
}