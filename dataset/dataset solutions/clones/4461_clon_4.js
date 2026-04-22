const pathFinder = (inputData) => {
    const dataSegments = inputData.trim().split('\n');
    const [vertexCountString, edgeCountString] = dataSegments[0].split(' ');
    const totalVertices = Number(vertexCountString);
    const totalEdges = Number(edgeCountString);

    const connectionList = dataSegments.slice(1, totalEdges + 1)
                                       .map(line => line.split(' ').map(Number));

    const processingState = {
        originConnected: new Set(), // Stores nodes 'j' for which an edge (1, j) exists
        destinationConnected: new Set(), // Stores nodes 'j' for which an edge (j, totalVertices) exists
        solutionFound: false
    };

    const finalResult = connectionList.reduce((currentProgress, currentLink) => {
        if (currentProgress.solutionFound) {
            return currentProgress; // Optimization: stop processing if path already found
        }

        const [startNode, endNode] = currentLink;

        // Check for paths originating from the first vertex
        if (startNode === 1) {
            // If 'endNode' was previously marked as able to reach 'totalVertices',
            // then a path 1 -> endNode -> totalVertices is complete.
            if (currentProgress.destinationConnected.has(endNode)) {
                return { ...currentProgress, solutionFound: true };
            }
            // Otherwise, mark 'endNode' as reachable from the first vertex.
            currentProgress.originConnected.add(endNode);
        }

        // Check for paths terminating at the last vertex
        if (endNode === totalVertices) {
            // If 'startNode' was previously marked as reachable from 1,
            // then a path 1 -> startNode -> totalVertices is complete.
            if (currentProgress.originConnected.has(startNode)) {
                return { ...currentProgress, solutionFound: true };
            }
            // Otherwise, mark 'startNode' as able to reach the last vertex.
            currentProgress.destinationConnected.add(startNode);
        }

        return currentProgress;
    }, processingState);

    return finalResult.solutionFound ? "POSSIBLE" : "IMPOSSIBLE";
};

const inputFeed = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(pathFinder(inputFeed));