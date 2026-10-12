function ProcessInput(rawData) {
    const lines = rawData.split("\n");

    // Parse the first line for number of nodes and constraints
    const [numNodes, numConstraints] = lines[0].split(" ").map(Number);

    // Initialize arrays to store constraints (L, R, D)
    const leftNodes = [];
    const rightNodes = [];
    const distances = [];

    // Populate constraint arrays from input lines
    for (let constraintIdx = 0; constraintIdx < numConstraints; constraintIdx++) {
        const constraintParts = lines[constraintIdx + 1].split(" ").map(Number);
        leftNodes.push(constraintParts[0]);
        rightNodes.push(constraintParts[1]);
        distances.push(constraintParts[2]);
    }

    // Array to store calculated values for each node (1-indexed)
    // Initialized with undefined, similar to original `new Array(N+1)`
    const nodeValues = new Array(numNodes + 1);

    // Use an object to hold the result status, allowing it to be modified by reference
    const statusContainer = { value: "Yes" };

    // Queue for nodes whose neighbors need to be processed within a connected component
    let processingQueue = [];

    // Helper function to propagate values from a target node through related constraints.
    // It finds all constraints where `targetNode` is either the left or right node,
    // calculates the value of the other node if unknown, adds it to the queue,
    // and removes the processed constraint.
    // Returns true if propagation continues, false if a conflict is found.
    const propagateValuesFromNode = (targetNode, isTargetLeftNode) => {
        let currentConstraintSearchIndex;
        while (true) {
            // Find the next constraint where targetNode is involved
            if (isTargetLeftNode) {
                currentConstraintSearchIndex = leftNodes.findIndex(node => node === targetNode);
            } else {
                currentConstraintSearchIndex = rightNodes.findIndex(node => node === targetNode);
            }

            if (currentConstraintSearchIndex < 0) {
                // No more constraints involving targetNode in this direction
                break;
            }

            const currentL = leftNodes[currentConstraintSearchIndex];
            const currentR = rightNodes[currentConstraintSearchIndex];
            const currentD = distances[currentConstraintSearchIndex];

            if (isTargetLeftNode) { // targetNode is currentL
                if (nodeValues[currentR] !== undefined) {
                    // If R's value is already known, check for consistency
                    if (nodeValues[currentR] !== nodeValues[currentL] + currentD) {
                        statusContainer.value = "No";
                        return false; // Conflict detected
                    }
                } else {
                    // If R's value is unknown, calculate and add to queue
                    nodeValues[currentR] = nodeValues[currentL] + currentD;
                    processingQueue.push(currentR);
                }
            } else { // targetNode is currentR
                if (nodeValues[currentL] !== undefined) {
                    // If L's value is already known, check for consistency
                    if (nodeValues[currentL] !== nodeValues[currentR] - currentD) {
                        statusContainer.value = "No";
                        return false; // Conflict detected
                    }
                } else {
                    // If L's value is unknown, calculate and add to queue
                    nodeValues[currentL] = nodeValues[currentR] - currentD;
                    processingQueue.push(currentL);
                }
            }

            // Remove the constraint that was just processed
            leftNodes.splice(currentConstraintSearchIndex, 1);
            rightNodes.splice(currentConstraintSearchIndex, 1);
            distances.splice(currentConstraintSearchIndex, 1);

            if (statusContainer.value === "No") {
                return false; // Conflict detected, stop further propagation
            }
        }
        return true; // Propagation successful for this direction
    };

    // Main loop: continues as long as there are unprocessed constraints
    // Each iteration attempts to process a new connected component.
    let currentConstraintIdx = leftNodes.length - 1;
    while (currentConstraintIdx >= 0) {
        if (statusContainer.value === "No") {
            // A conflict was found in a previous component, no need to continue
            break;
        }

        // Get the last constraint to start a new component's processing
        const initialLeftNode = leftNodes[currentConstraintIdx];
        const initialRightNode = rightNodes[currentConstraintIdx];
        const initialDistance = distances[currentConstraintIdx];

        // Establish initial values for the nodes in this component.
        // The first node of the constraint is set to 0, and the second relative to it.
        // This effectively sets a reference point for the component.
        nodeValues[initialLeftNode] = 0;
        nodeValues[initialRightNode] = initialDistance;

        // Initialize the queue with the nodes from the starting constraint
        processingQueue = [initialLeftNode, initialRightNode];

        // Remove the initial constraint from the lists as it's now 'processed'
        leftNodes.pop();
        rightNodes.pop();
        distances.pop();

        // Process nodes in the queue for the current connected component
        let queueReadPointer = 0;
        while (queueReadPointer < processingQueue.length) {
            const nodeToProcess = processingQueue[queueReadPointer];
            queueReadPointer++;

            // Propagate values considering nodeToProcess as a left node
            if (!propagateValuesFromNode(nodeToProcess, true)) {
                break; // Conflict found, exit inner loop
            }
            if (statusContainer.value === "No") { break; } // Check again after first propagation

            // Propagate values considering nodeToProcess as a right node
            if (!propagateValuesFromNode(nodeToProcess, false)) {
                break; // Conflict found, exit inner loop
            }
            if (statusContainer.value === "No") { break; } // Check again after second propagation
        }

        // Update the index for the next iteration of the main loop
        // (i.e., to find the next unprocessed constraint to start a new component)
        currentConstraintIdx = leftNodes.length - 1;
    }

    console.log(statusContainer.value);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
