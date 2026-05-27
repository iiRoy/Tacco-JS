function ProcessInput(rawData) {
    // Split the raw input string into an array of lines for easier processing.
    let inputLines = rawData.split("\n");

    // Parse the first line to extract the total number of nodes and the count of relations.
    const dimensions = inputLines[0].split(" ").map(strVal => parseInt(strVal, 10));
    const numNodes = dimensions[0]; // Represents 'N' from the original problem statement.
    let numRelations = dimensions[1]; // Represents 'M' from the original problem statement.

    // Initialize a list to store all the given relations. Each relation is an array [nodeA, nodeB, difference].
    const relationsList = [];
    // Populate the relations list from the subsequent lines of input.
    for (let relationIndex = 0; relationIndex < numRelations; relationIndex++) {
        relationsList[relationIndex] = inputLines[relationIndex + 1].split(" ").map(strVal => parseInt(strVal, 10));
    }

    // `visitedNodes` array: Tracks whether a node's value has been determined (1 for visited, 0 for unvisited).
    // Corresponds to 'anc' in the original code.
    const visitedNodes = new Array(numNodes + 1).fill(0);
    // `nodeValues` array: Stores the calculated value for each node.
    // Corresponds to 'x' in the original code.
    const nodeValues = new Array(numNodes + 1).fill(0);

    // Mark node 0 and node 1 as visited initially. Node 1 is often used as a reference point.
    visitedNodes[0] = 1;
    visitedNodes[1] = 1;

    // Declare variables for loop iteration and tracking list changes.
    let currentRelationIdx, listLengthBeforePass;
    // The 'initialReferenceNode' variable (renamed from 'low') is declared but not used in the logic.
    const initialReferenceNode = 1;

    // Initialize the result status, assuming consistency until proven otherwise.
    let resultStatus = "Yes";

    // Main processing loop: Continues as long as there are relations left to evaluate.
    mainProcessingLoop:
    while (relationsList.length > 0) {
        // Store the current number of relations before iterating through them in this pass.
        currentRelationIdx = listLengthBeforePass = relationsList.length;

        // Iterate backwards through the relations list to safely remove elements during iteration.
        while (currentRelationIdx--) {
            const currentRelation = relationsList[currentRelationIdx];
            const nodeA = currentRelation[0];
            const nodeB = currentRelation[1];
            const difference = currentRelation[2];

            // Scenario 1: Both nodes in the current relation have already had their values determined.
            if (visitedNodes[nodeA] && visitedNodes[nodeB]) {
                // Check if the existing values are consistent with the current relation.
                if (nodeValues[nodeB] - nodeValues[nodeA] !== difference) {
                    resultStatus = "No"; // Inconsistency found, set result and exit.
                    break mainProcessingLoop; // Exit the main loop immediately.
                } else {
                    // Relation is consistent, so it's no longer needed. Remove it.
                    relationsList.splice(currentRelationIdx, 1);
                    continue; // Move to the next relation in the list.
                }
            }

            // Scenario 2: Only the first node (nodeA) has a known value.
            if (visitedNodes[nodeA]) {
                visitedNodes[nodeB] = 1; // Mark nodeB as visited.
                nodeValues[nodeB] = nodeValues[nodeA] + difference; // Calculate nodeB's value based on nodeA.
                relationsList.splice(currentRelationIdx, 1); // Remove this relation as it's now processed.
            }
            // Scenario 3: Only the second node (nodeB) has a known value.
            else if (visitedNodes[nodeB]) {
                visitedNodes[nodeA] = 1; // Mark nodeA as visited.
                nodeValues[nodeA] = nodeValues[nodeB] - difference; // Calculate nodeA's value based on nodeB.
                relationsList.splice(currentRelationIdx, 1); // Remove this relation.
            }
            // Scenario 4: Neither node has a known value. The relation remains in the list for a future pass.
        }

        // If no relations were processed in the current pass (list length did not change),
        // it means we might have isolated components or a fully processed graph.
        if (listLengthBeforePass === relationsList.length) {
            // Find the first unvisited node to establish a new reference point for its component.
            const unvisitedNodeIndex = visitedNodes.findIndex(statusFlag => statusFlag === 0);
            if (unvisitedNodeIndex !== -1) {
                visitedNodes[unvisitedNodeIndex] = 1; // Mark this node as visited.
                // Its value remains 0, effectively setting it as the arbitrary reference for its component.
            } else {
                // If no unvisited nodes are found, all nodes have been processed or are part of a component
                // that couldn't be resolved further. This implies consistency if no 'No' was set.
                break; // Exit the main loop as no further progress can be made.
            }
        }
    }

    // Output the final determination of consistency.
    console.log(resultStatus);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
