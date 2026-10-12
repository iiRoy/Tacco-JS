"use strict";

function* generateNodePermutations(elements) {
    const elementCount = elements.length;
    if (elementCount === 0) {
        yield [];
        return;
    }

    for (let i = 0; i < elementCount; i++) {
        const currentElement = elements[i];
        const remainingElements = [...elements.slice(0, i), ...elements.slice(i + 1)];
        for (const subPermutation of generateNodePermutations(remainingElements)) {
            yield [currentElement, ...subPermutation];
        }
    }
}

const processInput = (inputContent) => {
    const inputLines = inputContent.trim().split("\n");
    const [nodeQuantityStr, edgeQuantityStr] = inputLines[0].split(" ");
    const nodeQuantity = parseInt(nodeQuantityStr);
    const edgeQuantity = parseInt(edgeQuantityStr); // This variable is read but not used in the original's slice logic

    // The original code uses N for the slice end, not M. Replicating this behavior.
    const connectionDefinitions = inputLines.slice(1, nodeQuantity + 1).map(line => line.split(" ").map(Number));

    // Graph representation: Adjacency List using Sets for fast edge existence checks
    const adjacencyStructure = Array.from({ length: nodeQuantity }, () => new Set());

    for (const [firstNode, secondNode] of connectionDefinitions) {
        // Adjust to 0-indexed nodes
        adjacencyStructure[firstNode - 1].add(secondNode - 1);
        adjacencyStructure[secondNode - 1].add(firstNode - 1);
    }

    let validPathCounter = 0;

    // Nodes to permute are 1 to N-1, as the path must start from node 0
    const nodesToArrange = Array.from({ length: nodeQuantity - 1 }, (_, idx) => idx + 1);

    // Iterate through all possible orderings of the remaining nodes
    for (const nodeOrdering of generateNodePermutations(nodesToArrange)) {
        // Construct the full path starting from node 0
        const currentTraversal = [0, ...nodeOrdering];

        let isCompleteTraversal = true;
        // Verify if all consecutive nodes in the path are connected by an edge
        for (let k = 0; k < nodeQuantity - 1; k++) {
            const originNode = currentTraversal[k];
            const destinationNode = currentTraversal[k + 1];
            if (!adjacencyStructure[originNode].has(destinationNode)) {
                isCompleteTraversal = false;
                break;
            }
        }

        if (isCompleteTraversal) {
            validPathCounter++;
        }
    }

    console.log(validPathCounter);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
