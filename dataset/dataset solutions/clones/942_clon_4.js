const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const textLines = dataSource.trim().split('\n');

const totalNodes = Number(textLines.shift());

const connectionRegistry = new Map(); // Map<nodeIdentifier, Set<neighborIdentifier>>

textLines.forEach((lineEntry) => {
    const numericParts = lineEntry.split(' ').map(Number);
    const primaryIdentifier = numericParts[0];
    const linkedIdentifiers = numericParts.slice(2); // Skip count of neighbors

    if (!connectionRegistry.has(primaryIdentifier)) {
        connectionRegistry.set(primaryIdentifier, new Set());
    }

    linkedIdentifiers.forEach(secondaryIdentifier => {
        // Establish connection from primary to secondary
        connectionRegistry.get(primaryIdentifier).add(secondaryIdentifier);

        // Establish connection from secondary to primary for bidirectional traversal
        if (!connectionRegistry.has(secondaryIdentifier)) {
            connectionRegistry.set(secondaryIdentifier, new Set());
        }
        connectionRegistry.get(secondaryIdentifier).add(primaryIdentifier);
    });
});

// Convert the registry to a final adjacency list with sorted neighbors
const graphMap = new Map(); // Map<nodeIdentifier, number[]>
for (let idIndex = 1; idIndex <= totalNodes; idIndex++) {
    const associatedSet = connectionRegistry.get(idIndex);
    if (associatedSet) {
        graphMap.set(idIndex, Array.from(associatedSet).sort((a, b) => a - b));
    } else {
        // Ensure all nodes from 1 to totalNodes are represented, even if isolated
        graphMap.set(idIndex, []);
    }
}

const timeMeasurements = new Map(); // Map<nodeIdentifier, { entry: number, exit: number }>
const traversalTrack = []; // Stores [nodeIdentifier, currentNeighborIndexToProcess]
const visitedMarkers = new Set(); // Stores nodeIdentifiers of nodes whose 'entry' time has been set
let globalTimeTicker = 0;

const initialNodeIdentifier = 1;
if (graphMap.has(initialNodeIdentifier)) {
    globalTimeTicker++;
    timeMeasurements.set(initialNodeIdentifier, { entry: globalTimeTicker, exit: 0 });
    visitedMarkers.add(initialNodeIdentifier);
    traversalTrack.push([initialNodeIdentifier, 0]); // [nodeId, index of next neighbor to process]
}

// Perform iterative Depth-First Search
while (traversalTrack.length > 0) {
    let [currentIdentifier, neighborProcessIndex] = traversalTrack[traversalTrack.length - 1];
    const currentNeighbors = graphMap.get(currentIdentifier) || [];

    if (neighborProcessIndex < currentNeighbors.length) {
        // More neighbors to explore for the current node
        const nextAdjacentIdentifier = currentNeighbors[neighborProcessIndex];
        traversalTrack[traversalTrack.length - 1][1]++; // Advance neighbor index for this node

        if (!visitedMarkers.has(nextAdjacentIdentifier)) {
            // Unvisited neighbor found, push it to stack and record entry time
            globalTimeTicker++;
            timeMeasurements.set(nextAdjacentIdentifier, { entry: globalTimeTicker, exit: 0 });
            visitedMarkers.add(nextAdjacentIdentifier);
            traversalTrack.push([nextAdjacentIdentifier, 0]);
        }
    } else {
        // All neighbors of currentIdentifier have been processed (or none exist)
        // Pop the node and record its exit time
        traversalTrack.pop();
        globalTimeTicker++;
        const currentRecord = timeMeasurements.get(currentIdentifier);
        if (currentRecord) {
            currentRecord.exit = globalTimeTicker;
        }
    }
}

// Format and output results
const formattedResults = [];
for (let id = 1; id <= totalNodes; id++) {
    const currentTiming = timeMeasurements.get(id);
    if (currentTiming) {
        formattedResults.push(`${id} ${currentTiming.entry} ${currentTiming.exit}`);
    } else {
        // Node was not reachable from the starting node (1)
        // Output 'undefined' for times, matching original behavior
        formattedResults.push(`${id} undefined undefined`);
    }
}

console.log(formattedResults.join('\n'));