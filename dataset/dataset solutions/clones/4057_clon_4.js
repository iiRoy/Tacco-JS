function processRelativePositions(inputData) {
    const dataSegments = inputData.split("\n");

    const configurationDetails = dataSegments[0].split(" ").map(Number);
    const maximumPoints = configurationDetails[0];
    const relationCount = configurationDetails[1];

    const allRelations = [];
    for (let currentRelationIndex = 1; currentRelationIndex <= relationCount; currentRelationIndex++) {
        const relationComponents = dataSegments[currentRelationIndex].split(" ").map(Number);
        const initialPoint = relationComponents[0];
        const finalPoint = relationComponents[1];
        const valueDifference = relationComponents[2];

        if (initialPoint === finalPoint) {
            return 'No';
        }
        allRelations.push({ origin: initialPoint, destination: finalPoint, offset: valueDifference });
    }

    const adjacencyStructure = new Map();
    allRelations.forEach(rel => {
        if (!adjacencyStructure.has(rel.origin)) adjacencyStructure.set(rel.origin, []);
        if (!adjacencyStructure.has(rel.destination)) adjacencyStructure.set(rel.destination, []);
        adjacencyStructure.get(rel.origin).push({ connectedTo: rel.destination, displacement: rel.offset });
        adjacencyStructure.get(rel.destination).push({ connectedTo: rel.origin, displacement: -rel.offset });
    });

    const determinedCoordinates = new Map();
    let globalMaximumCoordinate = 0;

    const allInvolvedPoints = new Set();
    allRelations.forEach(rel => {
        allInvolvedPoints.add(rel.origin);
        allInvolvedPoints.add(rel.destination);
    });

    for (const componentStartingNode of allInvolvedPoints) {
        if (!determinedCoordinates.has(componentStartingNode)) {
            const componentTraversalQueue = [componentStartingNode];
            determinedCoordinates.set(componentStartingNode, 0);

            let componentMinimumValue = 0;
            let componentMaximumValue = 0;

            let queuePointer = 0;
            while(queuePointer < componentTraversalQueue.length) {
                const currentVertex = componentTraversalQueue[queuePointer++];
                const currentVertexCoordinate = determinedCoordinates.get(currentVertex);

                componentMinimumValue = Math.min(componentMinimumValue, currentVertexCoordinate);
                componentMaximumValue = Math.max(componentMaximumValue, currentVertexCoordinate);

                const adjacentVertices = adjacencyStructure.get(currentVertex) || [];
                for (const { connectedTo, displacement } of adjacentVertices) {
                    const anticipatedNeighborCoordinate = currentVertexCoordinate + displacement;

                    if (!determinedCoordinates.has(connectedTo)) {
                        determinedCoordinates.set(connectedTo, anticipatedNeighborCoordinate);
                        componentTraversalQueue.push(connectedTo);
                    } else if (determinedCoordinates.get(connectedTo) !== anticipatedNeighborCoordinate) {
                        return 'No';
                    }
                }
            }

            const normalizationShift = 1 - componentMinimumValue;
            globalMaximumCoordinate = Math.max(globalMaximumCoordinate, componentMaximumValue + normalizationShift);
        }
    }

    if (globalMaximumCoordinate - 1 > 1000000001) {
        return 'No';
    }

    return 'Yes';
}

function executionEntry(rawInput) {
    console.log(processRelativePositions(rawInput));
}

executionEntry(require("fs").readFileSync("/dev/stdin", "utf8"));