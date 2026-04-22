const inputLines = require('fs').readFileSync(0, 'utf-8').split('\n');

const totalEntities = Number(inputLines[0]);
const entityRecords = new Map();

for (let j = 1; j <= totalEntities; ++j) {
    const parts = inputLines[j].split(' ').map(Number);
    const currentId = parts[0];
    const descendantCount = parts[1];
    const childIds = parts.slice(2, 2 + descendantCount);

    entityRecords.set(currentId, {
        identifier: currentId,
        descendants: childIds,
        ancestry: -1,
        level: null,
        classification: null
    });
}

for (const [key, value] of entityRecords) {
    for (const childId of value.descendants) {
        const childNode = entityRecords.get(childId);
        if (childNode) {
            childNode.ancestry = value.identifier;
        }
    }
}

let rootEntityIdentifier = -1;
for (const [key, value] of entityRecords) {
    if (value.ancestry === -1) {
        rootEntityIdentifier = key;
        break;
    }
}

const visitationQueue = [];
visitationQueue.push({ entity: entityRecords.get(rootEntityIdentifier), currentLevel: 0 });

while (visitationQueue.length > 0) {
    const { entity, currentLevel } = visitationQueue.shift();
    entity.level = currentLevel;

    if (entity.ancestry === -1) {
        entity.classification = 'root';
    } else if (entity.descendants.length > 0) {
        entity.classification = 'internal node';
    } else {
        entity.classification = 'leaf';
    }

    for (const childId of entity.descendants) {
        visitationQueue.push({ entity: entityRecords.get(childId), currentLevel: currentLevel + 1 });
    }
}

const sortedEntities = Array.from(entityRecords.values()).sort((a, b) => a.identifier - b.identifier);

const outputRows = sortedEntities.map(item => {
    const childRepresentation = `[${item.descendants.join(', ')}]`;
    return `node ${item.identifier}: parent = ${item.ancestry}, depth = ${item.level}, ${item.classification}, ${childRepresentation}`;
});

console.log(outputRows.join('\n'));