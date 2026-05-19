function processInputData(rawInputString) {
    rawInputString = rawInputString.split("\n");

    // Helper function for parsing integers
    const parseInteger = (str) => parseInt(str, 10);

    // Parse initial configuration: number of nodes and number of relations
    const initialConfigParts = rawInputString[0].split(" ");
    const nodeCount = parseInteger(initialConfigParts[0]);
    const relationCount = parseInteger(initialConfigParts[1]);

    // Arrays to store relation details (source, target, difference)
    const sourceNodes = new Array(relationCount);
    const targetNodes = new Array(relationCount);
    const differenceValues = new Array(relationCount);

    // Array to store calculated values for each node, initialized to 0
    const nodeValues = new Array(nodeCount).fill(0);
    // Adjacency list to store relations for each node
    // Each entry is an array of [connectedNodeIndex, differenceValue] pairs
    const nodeRelations = Array.from({ length: nodeCount }, () => []);

    // Populate relation arrays and the adjacency list
    for (let idx = 0; idx < relationCount; idx++) {
        const currentRelationLine = rawInputString[idx + 1].split(" ").map(parseInteger);
        
        // Extract raw values from input
        const rawSourceNode = currentRelationLine[0];
        const rawTargetNode = currentRelationLine[1];
        const rawDifference = currentRelationLine[2];

        // Adjust to 0-based indexing
        const adjustedSourceNode = rawSourceNode - 1;
        const adjustedTargetNode = rawTargetNode - 1;

        // Store relation details
        sourceNodes[idx] = adjustedSourceNode;
        targetNodes[idx] = adjustedTargetNode;
        differenceValues[idx] = rawDifference;

        // Add bidirectional relations to the adjacency list
        // For a relation (A, B, D), it means B - A = D
        // So, A -> B with difference D, and B -> A with difference -D
        nodeRelations[adjustedSourceNode].push(adjustedTargetNode, rawDifference);
        nodeRelations[adjustedTargetNode].push(adjustedSourceNode, -rawDifference);
    }

    let consistencyResult = "Yes"; // Assume consistent until proven otherwise

    // Recursive function to propagate node values through connected components
    // This function destructively modifies the `currentRelationList` array by truncating it.
    function propagateNodeValue(currentRelationList, currentNodeIdx, currentListEndIdx) {
        // Guard clause: If there are no more relation pairs to process in this list, return.
        // A pair consists of two elements (connectedNodeIdx, valueDifference), so length must be at least 2.
        if (currentListEndIdx < 0) {
            return;
        }

        // Extract the connected node index and the difference value from the current pair
        const connectedNodeIdx = currentRelationList[currentListEndIdx];
        const valueDifference = currentRelationList[currentListEndIdx + 1];

        // Set the value of the connected node based on the current node's value and the difference
        nodeValues[connectedNodeIdx] = nodeValues[currentNodeIdx] + valueDifference;

        // Mark this specific relation pair as processed by truncating the array.
        // This prevents reprocessing the same relation from the current node.
        currentRelationList.length = currentListEndIdx;

        // Recursively process the next relation pair in the current node's list (if any)
        const nextListEndIdx = currentListEndIdx - 2;
        if (nextListEndIdx >= 0) {
            propagateNodeValue(currentRelationList, currentNodeIdx, nextListEndIdx);
        }

        // After processing relations from the current node,
        // recursively propagate values from the newly set connected node.
        const connectedNodeListEndIdx = nodeRelations[connectedNodeIdx].length - 2;
        if (connectedNodeListEndIdx >= 0) {
            propagateNodeValue(nodeRelations[connectedNodeIdx], connectedNodeIdx, connectedNodeListEndIdx);
        }
    }

    // Iterate through all nodes to initiate value propagation for each connected component
    for (let idx = 0; idx < nodeCount; idx++) {
        const currentAdjacencyList = nodeRelations[idx];
        const initialListEndIdx = currentAdjacencyList.length - 2;
        
        // Only start propagation if the node has at least one relation pair
        if (initialListEndIdx >= 0) {
            propagateNodeValue(currentAdjacencyList, idx, initialListEndIdx);
        }
    }

    // Final consistency check: Verify all original relations hold true with the calculated node values
    for (let idx = 0; idx < relationCount; idx++) {
        const sourceNodeValue = nodeValues[sourceNodes[idx]];
        const targetNodeValue = nodeValues[targetNodes[idx]];
        const requiredDifference = differenceValues[idx];

        // If the difference between target and source node values does not match the required difference,
        // the system of relations is inconsistent.
        if (targetNodeValue - sourceNodeValue !== requiredDifference) {
            consistencyResult = "No";
            break; // No need to check further, inconsistency found
        }
    }

    // Output the final result
    console.log(consistencyResult);
}

// Read input from stdin and pass it to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
