const fs = require('fs');
const inputLines = fs.readFileSync('/dev/stdin', 'utf-8').split('\n');

const createNodeObject = (nodeIdentifier, childIdentifiers) => {
    const initialDepthValue = null;
    return {
        id: nodeIdentifier,
        children: [...childIdentifiers],
        parentNode: -1,
        depth: initialDepthValue
    };
};

const getNodeKind = (parentNodeId, childrenCount) => {
    if (parentNodeId === -1) {
        return 'root';
    } else if (childrenCount > 0) {
        return 'internal node';
    } else {
        return 'leaf';
    }
};

const formatNodeDetails = (nodeItem) => {
    const { id, parentNode, depth, children } = nodeItem;
    const nodeKind = getNodeKind(parentNode, children.length);
    const childrenListString = `[${children.join(', ')}]`;
    return `node ${id}: parent = ${parentNode}, depth = ${depth}, ${nodeKind}, ${childrenListString}`;
};

const calculateDepthsRevised = (nodeMap, allNodesArray) => {
    const findRootNode = (nodes) => nodes.find(n => n.parentNode === -1);
    const rootNode = findRootNode(allNodesArray);

    if (!rootNode) {
        // Should not happen with valid input, but a guard for robustness.
        return;
    }

    const recursiveDepthSetter = (currentProcessingNode, currentDepth) => {
        currentProcessingNode.depth = currentDepth;
        for (const childId of currentProcessingNode.children) {
            const childNode = nodeMap.get(childId);
            if (childNode) { // Ensure child node exists before processing
                recursiveDepthSetter(childNode, currentDepth + 1);
            }
        }
    };
    recursiveDepthSetter(rootNode, 0);
};

const nodeCountString = inputLines[0];
const nodeCount = parseInt(nodeCountString);

const rawNodeDataLines = inputLines.slice(1, nodeCount + 1);

const temporaryNodeList = rawNodeDataLines.map(lineData => {
    const parts = lineData.split(' ').map(Number);
    const nodeIdentifier = parts[0];
    // parts[1] is the number of children, not directly used in node object creation
    const childIdentifiers = parts.slice(2);
    return createNodeObject(nodeIdentifier, childIdentifiers);
});

const nodeCollectionMap = new Map();
for (const nodeItem of temporaryNodeList) {
    nodeCollectionMap.set(nodeItem.id, nodeItem);
}

for (const currentNode of nodeCollectionMap.values()) {
    for (const childId of currentNode.children) {
        const childNode = nodeCollectionMap.get(childId);
        if (childNode) {
            childNode.parentNode = currentNode.id;
        }
    }
}

const finalNodeCollection = Array.from(nodeCollectionMap.values()).sort((a, b) => a.id - b.id);

calculateDepthsRevised(nodeCollectionMap, finalNodeCollection);

console.log(finalNodeCollection.map(nodeItem => formatNodeDetails(nodeItem)).join('\n'));
