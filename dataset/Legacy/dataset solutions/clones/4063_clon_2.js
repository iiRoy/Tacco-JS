function ProcessInputData(rawData) {
    // Split the raw input string into individual lines.
    let processedLines = rawData.split("\n");

    // Parse the first line to get the number of nodes and constraints.
    const firstLineValues = processedLines[0].split(" ").map(element => parseInt(element, 10));

    // Extract the total number of nodes.
    const nodeCount = firstLineValues[0];

    // Extract the total number of constraints.
    let constraintCount = firstLineValues[1];

    // Initialize arrays to store the left nodes, right nodes, and their distances for each constraint.
    const leftNodes = [];
    const rightNodes = [];
    const distances = [];

    // Populate the constraint arrays from the input lines.
    for (let idx = 0; idx < constraintCount; idx++) {
        const currentConstraint = processedLines[idx + 1].split(" ").map(val => parseInt(val, 10));
        leftNodes[idx] = currentConstraint[0];
        rightNodes[idx] = currentConstraint[1];
        distances[idx] = currentConstraint[2];
    }

    // Initialize an array to store the calculated positions of each node.
    // The size is N+1 because node IDs are 1-indexed.
    const nodePositions = new Array(nodeCount + 1);

    // Initialize the result status, assuming "Yes" until a contradiction is found.
    let resultStatus = "Yes";

    // Initialize variables for the main processing loop.
    let currentConstraintIndex = leftNodes.length - 1;
    let queueSize;
    let currentNodeIdentifier;

    // Initialize a queue for nodes whose positions have been determined and need to be propagated.
    const processingQueue = [];

    // Label for breaking out of the main outer loop if a contradiction is found.
    mainLoopBreak:
    // Process constraints from the end of the list, working backwards.
    while (currentConstraintIndex >= 0) {
        // If the positions of the nodes in the current constraint are not yet known,
        // assign a relative position to them.
        // This effectively sets the first encountered L[i] to 0 and R[i] to D[i]
        // within its connected component.
        if (nodePositions[leftNodes[currentConstraintIndex]] === undefined && nodePositions[rightNodes[currentConstraintIndex]] === undefined) {
            nodePositions[leftNodes[currentConstraintIndex]] = 0;
            nodePositions[rightNodes[currentConstraintIndex]] = distances[currentConstraintIndex];
        } else if (nodePositions[leftNodes[currentConstraintIndex]] === undefined) {
            // If only the left node's position is unknown, calculate it based on the right node.
            nodePositions[leftNodes[currentConstraintIndex]] = nodePositions[rightNodes[currentConstraintIndex]] - distances[currentConstraintIndex];
        } else if (nodePositions[rightNodes[currentConstraintIndex]] === undefined) {
            // If only the right node's position is unknown, calculate it based on the left node.
            nodePositions[rightNodes[currentConstraintIndex]] = nodePositions[leftNodes[currentConstraintIndex]] + distances[currentConstraintIndex];
        } else {
            // If both are known, check for consistency.
            if (nodePositions[rightNodes[currentConstraintIndex]] !== nodePositions[leftNodes[currentConstraintIndex]] + distances[currentConstraintIndex]) {
                resultStatus = "No";
                break mainLoopBreak;
            }
            // If consistent, this constraint is already satisfied and doesn't need further processing.
            // Remove it and continue to the next constraint.
            leftNodes.splice(currentConstraintIndex, 1);
            rightNodes.splice(currentConstraintIndex, 1);
            distances.splice(currentConstraintIndex, 1);
            currentConstraintIndex--;
            continue; // Skip the rest of the loop body for this iteration
        }

        // Clear the processing queue and add the two nodes from the current constraint.
        processingQueue.length = 0;
        processingQueue.push(leftNodes[currentConstraintIndex], rightNodes[currentConstraintIndex]);

        // Remove the current constraint from the lists as it has been processed.
        leftNodes.pop();
        rightNodes.pop();
        distances.pop();

        // Initialize queue size for the inner propagation loop.
        queueSize = processingQueue.length;

        // Propagate position information through connected nodes.
        while (queueSize > 0) {
            // Get the next node to process from the queue.
            currentNodeIdentifier = processingQueue.pop();

            // Search for constraints where the current node is the left node.
            let searchIndexLeft = leftNodes.findIndex(element => element === currentNodeIdentifier);
            while (searchIndexLeft >= 0) {
                // If the right node's position is already known, check for consistency.
                if (nodePositions[rightNodes[searchIndexLeft]] !== undefined) {
                    if (nodePositions[rightNodes[searchIndexLeft]] !== nodePositions[leftNodes[searchIndexLeft]] + distances[searchIndexLeft]) {
                        resultStatus = "No";
                        break mainLoopBreak; // Contradiction found, exit all loops.
                    }
                } else {
                    // If the right node's position is unknown, calculate it and add it to the queue.
                    nodePositions[rightNodes[searchIndexLeft]] = nodePositions[leftNodes[searchIndexLeft]] + distances[searchIndexLeft];
                    processingQueue.push(rightNodes[searchIndexLeft]);
                }
                // Remove the processed constraint.
                leftNodes.splice(searchIndexLeft, 1);
                rightNodes.splice(searchIndexLeft, 1);
                distances.splice(searchIndexLeft, 1);
                // Search for the next occurrence of the current node as a left node.
                searchIndexLeft = leftNodes.findIndex(element => element === currentNodeIdentifier);
            }

            // Search for constraints where the current node is the right node.
            let searchIndexRight = rightNodes.findIndex(element => element === currentNodeIdentifier);
            while (searchIndexRight >= 0) {
                // If the left node's position is already known, check for consistency.
                if (nodePositions[leftNodes[searchIndexRight]] !== undefined) {
                    if (nodePositions[leftNodes[searchIndexRight]] !== nodePositions[rightNodes[searchIndexRight]] - distances[searchIndexRight]) {
                        resultStatus = "No";
                        break mainLoopBreak; // Contradiction found, exit all loops.
                    }
                } else {
                    // If the left node's position is unknown, calculate it and add it to the queue.
                    nodePositions[leftNodes[searchIndexRight]] = nodePositions[rightNodes[searchIndexRight]] - distances[searchIndexRight];
                    processingQueue.push(leftNodes[searchIndexRight]);
                }
                // Remove the processed constraint.
                leftNodes.splice(searchIndexRight, 1);
                rightNodes.splice(searchIndexRight, 1);
                distances.splice(searchIndexRight, 1);
                // Search for the next occurrence of the current node as a right node.
                searchIndexRight = rightNodes.findIndex(element => element === currentNodeIdentifier);
            }
            // Update the queue size for the next iteration of the propagation loop.
            queueSize = processingQueue.length;
        }
        // Move to the next constraint in the original list (or what's left of it).
        currentConstraintIndex = leftNodes.length - 1;
    }

    // Output the final result.
    console.log(resultStatus);
}

// Read input from stdin and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
