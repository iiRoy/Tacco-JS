(function(inputRecords) {
    const recordLines = inputRecords.trim().split(/\r?\n/);
    const totalVertices = Number(recordLines.shift());

    const networkData = new Map(); // Stores { connections: [], status: 0, entryInstant: 0, exitInstant: 0 }
                                   // status: 0=unvisited, 1=visiting, 2=visited
    let globalTimer = 0;

    // Initialize networkData for all nodes
    for (let currentEntity = 1; currentEntity <= totalVertices; currentEntity++) {
        networkData.set(currentEntity, {
            connections: [],
            status: 0,
            entryInstant: 0,
            exitInstant: 0
        });
    }

    // Parse adjacency lists from input
    recordLines.forEach(function(connectionRecord) {
        const componentParts = connectionRecord.split(' ').map(Number);
        const originEntity = componentParts[0];
        const connectedEntities = componentParts.slice(2);
        networkData.get(originEntity).connections = connectedEntities;
    });

    // Iterative Depth-First Search function
    const traverseGraph = function(initialEntityIdentifier) {
        const explorationStack = [];
        explorationStack.push({ entityId: initialEntityIdentifier, activityPhase: 'discover' });

        while (explorationStack.length > 0) {
            const { entityId: currentEntity, activityPhase: currentPhase } = explorationStack.pop();
            const entityDetails = networkData.get(currentEntity);

            if (currentPhase === 'discover') {
                if (entityDetails.status === 0) { // If unvisited
                    entityDetails.status = 1; // Mark as visiting
                    globalTimer++;
                    entityDetails.entryInstant = globalTimer;

                    // Push current node back to mark its finish time later
                    explorationStack.push({ entityId: currentEntity, activityPhase: 'complete' });

                    // Push unvisited neighbors in reverse order to simulate recursive DFS
                    const adjacentLinks = entityDetails.connections;
                    for (let j = adjacentLinks.length - 1; j >= 0; j--) {
                        const neighborLink = adjacentLinks[j];
                        if (networkData.get(neighborLink).status === 0) { // If neighbor is unvisited
                            explorationStack.push({ entityId: neighborLink, activityPhase: 'discover' });
                        }
                    }
                }
            } else if (currentPhase === 'complete') {
                globalTimer++;
                entityDetails.exitInstant = globalTimer;
                entityDetails.status = 2; // Mark as visited
            }
        }
    };

    // Start graph traversal from entity 1
    traverseGraph(1);

    // Collect results for output
    const resultCollector = [];
    for (let currentEntity = 1; currentEntity <= totalVertices; currentEntity++) {
        const entityDetails = networkData.get(currentEntity);
        resultCollector.push(`${currentEntity} ${entityDetails.entryInstant} ${entityDetails.exitInstant}`);
    }

    // Display final output
    console.log(resultCollector.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));