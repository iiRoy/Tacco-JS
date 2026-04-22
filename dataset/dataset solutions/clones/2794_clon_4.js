const MAX_INTEGER_VALUE = Number.MAX_SAFE_INTEGER;

function parseNumericLine(textualLine) {
    return textualLine.split(' ').map(entry => parseInt(entry, 10));
}

function SolveJourney(graphInput) {
    const inputRecords = graphInput.trim().split('\n');

    const dimensions = parseNumericLine(inputRecords[0]);
    const numberOfVertices = dimensions[0];
    const numberOfEdges = dimensions[1];

    const graphConnections = Array.from({ length: numberOfVertices }, () => []);

    for (let edgeIndex = 1; edgeIndex <= numberOfEdges; edgeIndex++) {
        const connectionData = parseNumericLine(inputRecords[edgeIndex]);
        graphConnections[connectionData[0] - 1].push(connectionData[1] - 1);
    }

    const journeyPoints = parseNumericLine(inputRecords[numberOfEdges + 1]);
    const entryPoint = journeyPoints[0] - 1;
    const exitPoint = journeyPoints[1] - 1;

    // This 2D array stores the minimum steps to reach a state (vertex, steps_mod_3_remainder)
    // stateDistances[vertexIndex][remainder]
    const stateDistances = Array.from({ length: numberOfVertices }, () => Array(3).fill(MAX_INTEGER_VALUE));

    const traversalQueue = []; // Used as a BFS queue

    // Initialize for the starting node, with 0 steps, so remainder is 0
    stateDistances[entryPoint][0] = 0;
    traversalQueue.push([entryPoint, 0]); // Queue stores [current_vertex, current_remainder]

    let finalPathLength = -1;

    while (traversalQueue.length > 0) {
        const [currentVertex, currentRemainder] = traversalQueue.shift(); // Dequeue the next state

        const currentPathSteps = stateDistances[currentVertex][currentRemainder];

        // Iterate through all neighbors connected from the current vertex
        for (const connectedVertex of graphConnections[currentVertex]) {
            const nextRemainder = (currentRemainder + 1) % 3;
            const potentialNewSteps = currentPathSteps + 1;

            // If we found a shorter path to this new state (connectedVertex, nextRemainder)
            if (potentialNewSteps < stateDistances[connectedVertex][nextRemainder]) {
                stateDistances[connectedVertex][nextRemainder] = potentialNewSteps;
                traversalQueue.push([connectedVertex, nextRemainder]); // Enqueue the new state
            }
        }
    }

    // The result is the shortest path to the exitPoint with a remainder of 0 (i.e., path length is a multiple of 3)
    finalPathLength = stateDistances[exitPoint][0];

    if (finalPathLength === MAX_INTEGER_VALUE) {
        console.log(-1); // No path found
    } else {
        console.log(finalPathLength / 3);
    }
}

SolveJourney(require("fs").readFileSync("/dev/stdin", "utf8"));