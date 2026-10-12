const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let allInputLines = [];

rl.on('line', (currentLine) => {
    allInputLines.push(currentLine);
});

rl.on('close', () => {
    processGraphData(allInputLines);
});

// Helper function to perform set union
function combineSets(firstSet, secondSet) {
    const combinedSet = new Set(firstSet);
    for (const element of secondSet) {
        combinedSet.add(element);
    }
    return combinedSet;
}

// Main processing logic
function processGraphData(inputData) {
    let lineCursor = 0;
    const START_NODE_INDEX = 1; // Nodes are 1-indexed in the problem description

    // Parse initial parameters: node count and edge count
    const [nodeCount, edgeCount] = inputData[lineCursor++].split(' ').map(Number);

    // Parse preferred nodes array (0-indexed internally, but corresponds to 1-indexed problem nodes)
    const preferredNodes = inputData[lineCursor++].split(' ').map(Number);

    // Parse all connection pairs (edges)
    const graphConnections = [];
    while (lineCursor < inputData.length) {
        graphConnections.push(inputData[lineCursor++].split(' ').map(Number));
    }

    // Initialize disjoint sets for each node
    // Each node initially forms its own component
    const componentMapping = new Array(nodeCount + 1).fill(null);
    for (let i = START_NODE_INDEX; i <= nodeCount; i++) {
        componentMapping[i] = new Set([i]);
    }

    // Process each connection to merge components
    for (const connectionPair of graphConnections) {
        const [nodeA, nodeB] = connectionPair;
        
        const setForNodeA = componentMapping[nodeA];
        const setForNodeB = componentMapping[nodeB];

        // Only merge if the nodes are not already in the same component (i.e., point to different set objects)
        if (setForNodeA !== setForNodeB) {
            const mergedComponentSet = combineSets(setForNodeA, setForNodeB);
            
            // Update all nodes within the newly merged component to reference this single merged set object
            for (const memberNodeId of mergedComponentSet) {
                componentMapping[memberNodeId] = mergedComponentSet;
            }
        }
    }

    // Calculate the number of "matching" components
    // A component matches if its preferred node is part of its connected component
    const componentMatchFlags = new Array(nodeCount + 1).fill(null);

    for (let currentIdx = START_NODE_INDEX; currentIdx <= nodeCount; currentIdx++) {
        // If this node's match status has already been determined (e.g., by processing another node in the same component)
        if (componentMatchFlags[currentIdx] !== null) {
            continue; // Skip re-evaluation
        }

        const targetNodeValue = preferredNodes[currentIdx - START_NODE_INDEX]; // Adjust for 0-indexed preferredNodes array
        const currentComponentSet = componentMapping[currentIdx];

        // Check if the preferred node for currentIdx is present in its connected component
        const isTargetNodeInComponent = currentComponentSet.has(targetNodeValue);
        
        // Store 1 if it matches, 0 otherwise
        componentMatchFlags[currentIdx] = Number(isTargetNodeInComponent);
    }

    // The problem implies result[0] should be 0, as nodes are 1-indexed.
    componentMatchFlags[0] = 0; 

    // Sum up all the match flags
    const initialSumValue = 0;
    const totalValidComponents = componentMatchFlags.reduce((accumulator, currentFlag) => {
        // Ensure nulls (if any, though none expected here after processing) are treated as 0
        return accumulator + (currentFlag || 0);
    }, initialSumValue);

    console.log(totalValidComponents);
}
