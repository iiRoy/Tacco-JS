// This module processes raw input data to identify specific connectivity patterns.
function processInput(rawData) {
    // Split the entire input string into an array of individual text lines.
    var inputRows = rawData.split('\n');

    // Parse the initial configuration parameters from the first line.
    var firstRowParts = inputRows[0].split(' ');
    var numEntities = parseInt(firstRowParts[0], 10); // Represents 'N' from original
    var numRelations = parseInt(firstRowParts[1], 10); // Represents 'M' from original

    // Extract and convert entity properties from the second line.
    var entityProperties = inputRows[1].split(' ');
    // Convert string representations of properties to integer values.
    for (let itemIdx = 0; itemIdx < entityProperties.length; itemIdx++) {
        entityProperties[itemIdx] = parseInt(entityProperties[itemIdx], 10);
    }

    // Initialize a data structure to hold all defined connections.
    var connections = [];
    // Populate the connections array from the subsequent input lines.
    // Each connection is represented as a pair of integers.
    for (let itemIdx = 0; itemIdx < numRelations; itemIdx++) {
        connections[itemIdx] = inputRows[itemIdx + 2].split(' ');
        connections[itemIdx][0] = parseInt(connections[itemIdx][0], 10);
        connections[itemIdx][1] = parseInt(connections[itemIdx][1], 10);
    }

    // Initialize a counter for the final aggregated result.
    var totalMatches = 0;

    // Iterate through each entity to perform a connectivity search.
    for (let itemIdx = 0; itemIdx < numEntities; itemIdx++) {
        var continueSearch = true; // A flag to control the inner iterative search.
        var previousActiveNodes = []; // Stores the set of active nodes from the prior iteration.
        var activeNodes = [itemIdx + 1]; // The current set of nodes being explored, starting with the current entity.
        var discoveredNeighbors = []; // A temporary list for newly found connected nodes in the current pass.
        var allVisitedInSearch = [itemIdx + 1]; // Keeps track of all nodes encountered during the current entity's search.
        var targetProperty = entityProperties[itemIdx]; // The specific property value to locate within connected components.

        // Execute a breadth-first-like traversal to find connected components.
        do {
            // Iterate over each node in the current set of active nodes.
            for (let compIdx = 0; compIdx < activeNodes.length; compIdx++) {
                // Examine every defined connection.
                for (let relIdx = 0; relIdx < numRelations; relIdx++) {
                    // Check if the first node of a connection matches the current active node.
                    if (connections[relIdx][0] === activeNodes[compIdx]) {
                        // If the second node is not already in active or visited lists, add it.
                        if (activeNodes.indexOf(connections[relIdx][1]) === -1 && allVisitedInSearch.indexOf(connections[relIdx][1]) === -1) {
                            discoveredNeighbors.push(connections[relIdx][1]);
                            allVisitedInSearch.push(connections[relIdx][1]);
                        }
                    }
                    // Check if the second node of a connection matches the current active node.
                    else if (connections[relIdx][1] === activeNodes[compIdx]) {
                        // If the first node is not already in active or visited lists, add it.
                        if (activeNodes.indexOf(connections[relIdx][0]) === -1 && allVisitedInSearch.indexOf(connections[relIdx][0]) === -1) {
                            discoveredNeighbors.push(connections[relIdx][0]);
                            allVisitedInSearch.push(connections[relIdx][0]);
                        }
                    }
                    // If the target property is found within the current active nodes, break early.
                    if (activeNodes.indexOf(targetProperty) >= 0) {
                        break;
                    }
                }
                // Re-check if the target property was found after the inner loop.
                if (activeNodes.indexOf(targetProperty) >= 0) {
                    break;
                }
            }

            // If the target property was successfully located in the current active nodes.
            if (activeNodes.indexOf(targetProperty) >= 0) {
                totalMatches += 1; // Increment the overall match counter.
                continueSearch = false; // Terminate the search for this specific entity.
            }

            // Check for a termination condition: if no new progress is made (i.e., active nodes haven't changed).
            if (previousActiveNodes === activeNodes) { // This comparison checks for reference equality.
                continueSearch = false; // Stop if the set of active nodes is identical to the previous iteration.
            } else {
                // Prepare the next set of active nodes for the subsequent iteration.
                var nextActiveNodes = [];
                for (let compIdx = 0; compIdx < discoveredNeighbors.length; compIdx++) {
                    // Filter to include only truly new nodes that were not in the previous active set.
                    if (activeNodes.indexOf(discoveredNeighbors[compIdx]) === -1) {
                        nextActiveNodes.push(discoveredNeighbors[compIdx]);
                    }
                }
                // Update the active nodes for the next pass.
                activeNodes = nextActiveNodes;
                // Store the current active nodes to compare in the next iteration.
                previousActiveNodes = activeNodes; // This assignment also maintains reference equality for the check above.
            }
            // console.log(activeNodes); // Original debug output, kept commented.
        } while (continueSearch === true); // Continue the loop as long as the search flag is active.
    }

    // Output the final calculated total number of matches to the console.
    console.log(totalMatches);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
