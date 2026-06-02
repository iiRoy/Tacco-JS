function ProcessInput(inputString) {
    const valueIterator = (function* (text) {
        const tokens = text.replace(/\r/g, '').split(/ |\n/g).filter(Boolean);
        for (const token of tokens) {
            yield parseInt(token, 10);
        }
    })(inputString);

    const retrieveNext = () => valueIterator.next().value;

    const totalNodes = retrieveNext();
    const totalEdges = retrieveNext();

    const adjacencyRegistry = new Map(); // Maps a source node to a Set of its direct neighbors
    const edgeWeightRegistry = new Map(); // Maps a source node to a Map of its neighbors and their weights

    for (let i = 0; i < totalEdges; ++i) {
        const originNode = retrieveNext();
        const destinationNode = retrieveNext();
        const connectionValue = retrieveNext();

        if (!adjacencyRegistry.has(originNode)) {
            adjacencyRegistry.set(originNode, new Set());
        }
        adjacencyRegistry.get(originNode).add(destinationNode);

        if (!edgeWeightRegistry.has(originNode)) {
            edgeWeightRegistry.set(originNode, new Map());
        }
        edgeWeightRegistry.get(originNode).set(destinationNode, connectionValue);
    }

    let peakPathScore = 0;
    const traversalQueue = []; // Stores [currentNode, currentAccumulatedScore, visitedNodesSetForThisPath]

    // Initialize traversal from node 0
    traversalQueue.push([0, 0, new Set([0])]);

    while (traversalQueue.length > 0) {
        const [currentPoint, currentPathSum, pathTrace] = traversalQueue.pop();

        peakPathScore = Math.max(peakPathScore, currentPathSum);

        if (adjacencyRegistry.has(currentPoint)) {
            for (const nextPoint of adjacencyRegistry.get(currentPoint)) {
                if (!pathTrace.has(nextPoint)) {
                    const extendedPathTrace = new Set(pathTrace);
                    extendedPathTrace.add(nextPoint);
                    const newAccumulatedScore = currentPathSum + edgeWeightRegistry.get(currentPoint).get(nextPoint);
                    traversalQueue.push([nextPoint, newAccumulatedScore, extendedPathTrace]);
                }
            }
        }
    }

    console.log(peakPathScore);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
