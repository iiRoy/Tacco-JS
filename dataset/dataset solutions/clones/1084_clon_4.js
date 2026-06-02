const fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const nodeCollection = new Map(); // Stores node data: Map<number, { id: number, children: number[], parent: number | null, level: number | null }>

const totalNodes = parseInt(fileContent[0]);
const inputEntries = fileContent.slice(1, totalNodes + 1)
                                 .map(entryLine => entryLine.split(' ').map(Number));

// Populate nodeCollection and establish parent-child relationships
inputEntries.forEach(entryData => {
    const primaryId = entryData[0];
    const childIdentifiers = entryData.slice(2);

    // Ensure the primary node exists in the collection
    if (!nodeCollection.has(primaryId)) {
        nodeCollection.set(primaryId, { id: primaryId, children: [], parent: null, level: null });
    }
    const currentPrimaryNode = nodeCollection.get(primaryId);
    currentPrimaryNode.children = childIdentifiers; // Assign children for the current node

    // For each child, ensure it exists and set its parent
    childIdentifiers.forEach(childId => {
        if (!nodeCollection.has(childId)) {
            nodeCollection.set(childId, { id: childId, children: [], parent: null, level: null });
        }
        nodeCollection.get(childId).parent = primaryId;
    });
});

// Determine node depths using an iterative Breadth-First Search (BFS)
let rootNodeId;
for (const [identifier, nodeData] of nodeCollection.entries()) {
    if (nodeData.parent === null) {
        rootNodeId = identifier;
        break;
    }
}

const processingQueue = [];
processingQueue.push({ nodeId: rootNodeId, currentLevel: 0 });

while (processingQueue.length > 0) {
    const { nodeId: currentIdentifier, currentLevel } = processingQueue.shift();
    const currentNodeData = nodeCollection.get(currentIdentifier);
    currentNodeData.level = currentLevel;

    currentNodeData.children.forEach(childIdentifier => {
        processingQueue.push({ nodeId: childIdentifier, currentLevel: currentLevel + 1 });
    });
}

// Prepare output
const allNodeObjects = Array.from(nodeCollection.values());
allNodeObjects.sort((a, b) => a.id - b.id); // Sort by ID for consistent output order

const finalOutputLines = allNodeObjects.map(node => {
    const nodeCategory = node.parent === null ? 'root'
                       : node.children.length > 0 ? 'internal node'
                       : 'leaf';
    const childListRepresentation = `[${node.children.join(', ')}]`;
    const parentDisplay = node.parent === null ? -1 : node.parent;
    return `node ${node.id}: parent = ${parentDisplay}, depth = ${node.level}, ${nodeCategory}, ${childListRepresentation}`;
});

console.log(finalOutputLines.join('\n'));
