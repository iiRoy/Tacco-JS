function ProcessInput( rawData ) {
    // Split the entire raw input string into an array of lines.
    let lines = rawData.split("\n");

    // Parse the first line to get graph dimensions.
    // The first line contains two space-separated integers.
    const graphDimensions = lines[0].split(" ").map( (strVal) => parseInt(strVal, 10) );

    // Extract the total number of nodes (N) from the dimensions.
    const totalNodes = graphDimensions[0];

    // Extract the number of constraints (M) from the dimensions.
    let numConstraints = graphDimensions[1];

    // Initialize an array to store all positional constraints.
    // Each constraint is an array [node1, node2, difference].
    const positionalConstraints = [];

    // Loop through the remaining lines to populate the constraints array.
    for (let currentIdx = 0; currentIdx < numConstraints; currentIdx++) {
        // Parse each constraint line.
        positionalConstraints[currentIdx] = lines[currentIdx + 1].split(" ").map( (numericStr) => parseInt(numericStr, 10) );
    }

    // Initialize an array to track visited/processed nodes.
    // A value of 1 means visited, 0 means not yet visited.
    const visitedNodes = new Array(totalNodes + 1).fill(0);

    // Initialize an array to store the computed positions of each node.
    const nodeCoordinates = new Array(totalNodes + 1).fill(0);

    // Mark nodes 0 and 1 as initially visited.
    // This often implies node 1 is the reference point.
    visitedNodes[0] = 1;
    visitedNodes[1] = 1;

    // Declare loop counters and a starting reference point.
    let loopCounter1, loopCounter2;
    const startPoint = 1; // This variable mirrors the structure but is not actively used in the logic.

    // Initialize the overall result status.
    let consistencyStatus = "Yes";

    // Main processing loop: continues as long as there are constraints to process.
    processingLoop:
    while (positionalConstraints.length > 0) {
        // Initialize loop counters with the current number of constraints.
        loopCounter1 = loopCounter2 = positionalConstraints.length;

        // Iterate backwards through the constraints array.
        while (loopCounter1--) {
            // Check if both nodes involved in the current constraint have been visited.
            if (visitedNodes[positionalConstraints[loopCounter1][0]] && visitedNodes[positionalConstraints[loopCounter1][1]]) {
                // If both are visited, check for consistency.
                // The difference in their computed coordinates must match the constraint.
                if (nodeCoordinates[positionalConstraints[loopCounter1][1]] - nodeCoordinates[positionalConstraints[loopCounter1][0]] !== positionalConstraints[loopCounter1][2]) {
                    // Inconsistency detected: set status to "No" and exit all loops.
                    consistencyStatus = "No";
                    break processingLoop;
                } else {
                    // Consistency found: remove this constraint as it's satisfied.
                    positionalConstraints.splice(loopCounter1, 1);
                    continue; // Move to the next constraint.
                }
            }

            // If only the first node of the constraint is visited.
            if (visitedNodes[positionalConstraints[loopCounter1][0]]) {
                // Mark the second node as visited.
                visitedNodes[positionalConstraints[loopCounter1][1]] = 1;
                // Compute the position of the second node based on the first.
                nodeCoordinates[positionalConstraints[loopCounter1][1]] = nodeCoordinates[positionalConstraints[loopCounter1][0]] + positionalConstraints[loopCounter1][2];
                // Remove this constraint as it has been used to determine a node's position.
                positionalConstraints.splice(loopCounter1, 1);
            }
            // If only the second node of the constraint is visited.
            else if (visitedNodes[positionalConstraints[loopCounter1][1]]) {
                // Mark the first node as visited.
                visitedNodes[positionalConstraints[loopCounter1][0]] = 1;
                // Compute the position of the first node based on the second.
                nodeCoordinates[positionalConstraints[loopCounter1][0]] = nodeCoordinates[positionalConstraints[loopCounter1][1]] - positionalConstraints[loopCounter1][2];
                // Remove this constraint.
                positionalConstraints.splice(loopCounter1, 1);
            }
        }

        // If no constraints were processed in the inner loop (i.e., no progress was made).
        if (loopCounter2 === positionalConstraints.length) {
            // Find the first unvisited node to start a new component.
            loopCounter1 = visitedNodes.findIndex( (status) => status === 0 );
            // Mark it as visited.
            visitedNodes[loopCounter1] = 1;
        }
    }

    // Output the final consistency status.
    console.log(consistencyStatus);
}

// Invoke the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));