function ProcessConstraints(rawData) {
    const inputLines = rawData.split("\n");
    const headerParts = inputLines[0].split(" ");
    const elementCount = Number(headerParts[0]);
    const constraintCount = Number(headerParts[1]);

    const constraintDefinitions = [];
    for (let k = 1; k <= constraintCount; k++) {
        const lineParts = inputLines[k].split(" ");
        const leftPoint = Number(lineParts[0]);
        const rightPoint = Number(lineParts[1]);
        const distanceValue = Number(lineParts[2]);

        if (leftPoint === rightPoint) {
            console.log('No');
            return;
        }
        constraintDefinitions.push({ source: leftPoint, target: rightPoint, diff: distanceValue });
    }

    // Graph representation: adjacency list using a Map
    // Each entry: node_index -> Array<{ connectedNode: number, relativeOffset: number }>
    const positionalGraph = new Map();

    // Populate the graph with bidirectional edges
    for (const definition of constraintDefinitions) {
        const u = definition.source - 1; // Convert to 0-indexed
        const v = definition.target - 1; // Convert to 0-indexed
        const d = definition.diff;

        if (!positionalGraph.has(u)) positionalGraph.set(u, []);
        positionalGraph.get(u).push({ connectedNode: v, relativeOffset: d });

        if (!positionalGraph.has(v)) positionalGraph.set(v, []);
        positionalGraph.get(v).push({ connectedNode: u, relativeOffset: -d });
    }

    const absoluteCoordinates = new Map(); // Stores node_index -> absolute_coordinate
    let maximumCoordinate = 1;
    let finalOutcome = 'Yes';

    // The original code anchors the first L[0]-1 to position 1.
    // We replicate this by starting our traversal from the source of the first constraint.
    if (constraintDefinitions.length > 0) {
        const initialAnchorNode = constraintDefinitions[0].source - 1;
        const traversalQueue = [];

        absoluteCoordinates.set(initialAnchorNode, 1);
        traversalQueue.push(initialAnchorNode);
        maximumCoordinate = Math.max(maximumCoordinate, 1);

        while (traversalQueue.length > 0) {
            const currentNode = traversalQueue.shift();
            const currentAbsoluteCoord = absoluteCoordinates.get(currentNode);

            const neighbors = positionalGraph.get(currentNode) || [];
            for (const { connectedNode, relativeOffset } of neighbors) {
                const projectedNeighborCoord = currentAbsoluteCoord + relativeOffset;

                if (absoluteCoordinates.has(connectedNode)) {
                    // Check for consistency with already determined coordinate
                    if (absoluteCoordinates.get(connectedNode) !== projectedNeighborCoord) {
                        finalOutcome = 'No';
                        traversalQueue.length = 0; // Clear queue to halt traversal
                        break; // Exit inner loop
                    }
                } else {
                    // Coordinate not yet determined, set it and add to queue for further exploration
                    absoluteCoordinates.set(connectedNode, projectedNeighborCoord);
                    traversalQueue.push(connectedNode);
                    maximumCoordinate = Math.max(maximumCoordinate, projectedNeighborCoord);
                }
            }
            if (finalOutcome === 'No') break; // Exit outer loop if contradiction found
        }
    }

    // Final check for maximum coordinate value
    if (finalOutcome === 'Yes' && maximumCoordinate - 1 > 1000000001) {
        finalOutcome = 'No';
    }

    console.log(finalOutcome);
}

ProcessConstraints(require("fs").readFileSync("/dev/stdin", "utf8"));
