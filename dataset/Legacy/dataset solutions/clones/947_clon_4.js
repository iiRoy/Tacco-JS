const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = sourceData.trim().split('\n');
const totalNodes = Number(dataLines.shift());

const adjacencyStructure = new Map();
const nodeDistances = new Map();

dataLines.forEach(lineEntry => {
    const numericParts = lineEntry.split(' ').map(Number);
    const currentParentIdentifier = numericParts[0];
    const childIdentifiers = numericParts.slice(2);

    if (!adjacencyStructure.has(currentParentIdentifier)) {
        adjacencyStructure.set(currentParentIdentifier, []);
    }
    childIdentifiers.forEach(childId => {
        adjacencyStructure.get(currentParentIdentifier).push(childId);
    });
});

const traversalQueue = [];
const startingIdentifier = 1;

nodeDistances.set(startingIdentifier, 0);
traversalQueue.push(startingIdentifier);

while (traversalQueue.length > 0) {
    const activeIdentifier = traversalQueue.shift();
    const currentPathLength = nodeDistances.get(activeIdentifier);

    const connectedChildren = adjacencyStructure.get(activeIdentifier) || [];

    connectedChildren.forEach(descendantIdentifier => {
        if (!nodeDistances.has(descendantIdentifier)) {
            nodeDistances.set(descendantIdentifier, currentPathLength + 1);
            traversalQueue.push(descendantIdentifier);
        }
    });
}

for (let i = 1; i <= totalNodes; i++) {
    const finalDistance = nodeDistances.get(i);
    console.log(`${i} ${finalDistance === undefined ? '' : finalDistance}`);
}
