const readline = require('readline');

const inputReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedInputLines = [];
inputReader.on('line', (currentLine) => {
    collectedInputLines.push(currentLine);
});

inputReader.on('close', () => {
    executeGraphProcessing(collectedInputLines);
});

function DisjointSetUnionStructure(totalNodes) {
    const parentRegistry = new Map();
    const setSizeRegistry = new Map();

    for (let i = 0; i < totalNodes; i++) {
        parentRegistry.set(i, i);
        setSizeRegistry.set(i, 1);
    }

    function findSetRepresentative(element) {
        if (parentRegistry.get(element) === element) {
            return element;
        }
        const root = findSetRepresentative(parentRegistry.get(element));
        parentRegistry.set(element, root); // Path compression
        return root;
    }

    function mergeSets(elementOne, elementTwo) {
        let rootOne = findSetRepresentative(elementOne);
        let rootTwo = findSetRepresentative(elementTwo);

        if (rootOne !== rootTwo) {
            // Union by size heuristic
            if (setSizeRegistry.get(rootOne) < setSizeRegistry.get(rootTwo)) {
                [rootOne, rootTwo] = [rootTwo, rootOne]; // Ensure rootOne is the larger set
            }
            parentRegistry.set(rootTwo, rootOne);
            setSizeRegistry.set(rootOne, setSizeRegistry.get(rootOne) + setSizeRegistry.get(rootTwo));
            return true; // Sets were merged
        }
        return false; // Elements already in the same set
    }

    function areElementsInSameSet(elementOne, elementTwo) {
        return findSetRepresentative(elementOne) === findSetRepresentative(elementTwo);
    }

    function countConnectedComponents(activeNodeFlags) {
        let distinctComponentRoots = new Set();
        for (let i = 0; i < totalNodes; i++) {
            if (activeNodeFlags[i]) {
                distinctComponentRoots.add(findSetRepresentative(i));
            }
        }
        return distinctComponentRoots.size;
    }

    return {
        merge: mergeSets,
        getRepresentative: findSetRepresentative,
        countComponents: countConnectedComponents,
        checkSameSet: areElementsInSameSet
    };
}

function executeGraphProcessing(allInputLines) {
    let currentLineIndex = 0;
    const retrieveNextLine = () => allInputLines[currentLineIndex++];

    while (true) {
        const [nodeQuantityStr, edgeQuantityStr] = retrieveNextLine().split(' ');
        const nodeQuantity = parseInt(nodeQuantityStr, 10);
        const edgeQuantity = parseInt(edgeQuantityStr, 10);

        if (nodeQuantity === 0 && edgeQuantity === 0) {
            break;
        }

        const nodeDetails = []; // Stores { identifier: i, activationValue: value }
        const distinctActivationValues = new Set();
        for (let i = 0; i < nodeQuantity; i++) {
            const activationValue = parseInt(retrieveNextLine(), 10);
            nodeDetails.push({ identifier: i, activationValue: activationValue });
            distinctActivationValues.add(activationValue);
        }

        const allGraphEdges = []; // Stores [source, destination, weight]
        for (let i = 0; i < edgeQuantity; i++) {
            const [sourceStr, destinationStr, edgeWeightStr] = retrieveNextLine().split(' ');
            allGraphEdges.push([parseInt(sourceStr, 10) - 1, parseInt(destinationStr, 10) - 1, parseInt(edgeWeightStr, 10)]);
        }

        // Sort unique activation values in descending order to process from highest threshold
        const orderedActivationValues = Array.from(distinctActivationValues).sort((a, b) => b - a);

        let finalMinimumSpanningCost = 0; // Result for the current test case

        // Iterate through each unique activation value as a potential threshold
        for (const currentThresholdValue of orderedActivationValues) {
            const currentlyActiveNodes = new Array(nodeQuantity).fill(false);
            let activeNodeCount = 0;

            for (const nodeEntry of nodeDetails) {
                if (nodeEntry.activationValue >= currentThresholdValue) {
                    currentlyActiveNodes[nodeEntry.identifier] = true;
                    activeNodeCount++;
                }
            }

            // If there's only one active node, it's trivially connected with 0 cost.
            // If no active nodes, this threshold is not relevant for connectivity.
            if (activeNodeCount <= 1) {
                continue;
            }

            const dsuInstance = DisjointSetUnionStructure(nodeQuantity);
            let currentSpanningCost = 0;

            // Sort edges by weight for Kruskal's algorithm
            const sortedGraphEdges = [...allGraphEdges].sort((a, b) => a[2] - b[2]);

            for (const [uNode, vNode, weightValue] of sortedGraphEdges) {
                // Only consider edges where both endpoints are currently active
                if (currentlyActiveNodes[uNode] && currentlyActiveNodes[vNode]) {
                    if (dsuInstance.merge(uNode, vNode)) {
                        currentSpanningCost += weightValue;
                    }
                }
            }

            // Check if all currently active nodes form a single connected component
            if (dsuInstance.countComponents(currentlyActiveNodes) === 1) {
                // The original logic effectively keeps the result from the *last*
                // (i.e., smallest threshold) successful connection.
                finalMinimumSpanningCost = currentSpanningCost;
            }
        }
        console.log(finalMinimumSpanningCost);
    }
}
