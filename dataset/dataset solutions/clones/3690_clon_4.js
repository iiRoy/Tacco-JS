class MinHeap {
    #elements;

    constructor() {
        this.#elements = [];
    }

    insert(itemPair) { // itemPair is [value, priority]
        this.#elements.push(itemPair);
        this.#bubbleUp(this.#elements.length - 1);
    }

    extractMinNode() { // Returns the value part (node index) of the item with the smallest priority
        if (this.#elements.length === 0) return undefined;
        if (this.#elements.length === 1) return this.#elements.pop()[0];

        const minimumValue = this.#elements[0][0]; // Get the value part (node index)
        this.#elements[0] = this.#elements.pop(); // Move last element to root
        this.#sinkDown(0); // Restore heap property
        return minimumValue;
    }

    isEmpty() {
        return this.#elements.length === 0;
    }

    #bubbleUp(currentIdx) {
        const itemToPlace = this.#elements[currentIdx];
        while (currentIdx > 0) {
            let parentIdx = Math.floor((currentIdx - 1) / 2);
            let parentItem = this.#elements[parentIdx];
            if (itemToPlace[1] >= parentItem[1]) break; // Compare priorities
            this.#elements[currentIdx] = parentItem; // Move parent down
            currentIdx = parentIdx;
        }
        this.#elements[currentIdx] = itemToPlace; // Place item in its final position
    }

    #sinkDown(currentIdx) {
        const totalLength = this.#elements.length;
        const itemToSink = this.#elements[currentIdx];

        while (true) {
            let leftChildPosition = 2 * currentIdx + 1;
            let rightChildPosition = 2 * currentIdx + 2;
            let leftChildItem, rightChildItem;
            let swapCandidateIdx = null;

            if (leftChildPosition < totalLength) {
                leftChildItem = this.#elements[leftChildPosition];
                if (leftChildItem[1] < itemToSink[1]) {
                    swapCandidateIdx = leftChildPosition;
                }
            }
            if (rightChildPosition < totalLength) {
                rightChildItem = this.#elements[rightChildPosition];
                if (
                    (swapCandidateIdx === null && rightChildItem[1] < itemToSink[1]) ||
                    (swapCandidateIdx !== null && rightChildItem[1] < leftChildItem[1])
                ) {
                    swapCandidateIdx = rightChildPosition;
                }
            }

            if (swapCandidateIdx === null) break; // No swap needed, item is in place
            this.#elements[currentIdx] = this.#elements[swapCandidateIdx]; // Move child up
            this.#elements[swapCandidateIdx] = itemToSink; // Move item down
            currentIdx = swapCandidateIdx;
        }
    }
}

const computeShortestPaths = (totalNodes, allEdges, initialNode, getEdgeWeight) => {
    // Adjacency list: Map<sourceNode, Map<targetNode, weight>>
    const adjacencyStructure = new Map();
    for (let currentVertex = 0; currentVertex < totalNodes; ++currentVertex) {
        adjacencyStructure.set(currentVertex, new Map());
    }

    for (const connection of allEdges) {
        const weight = getEdgeWeight(connection);
        // Assuming undirected graph based on original code
        adjacencyStructure.get(connection.initial).set(connection.final, weight);
        adjacencyStructure.get(connection.final).set(connection.initial, weight);
    }

    const currentDistances = new Array(totalNodes).fill(Infinity);
    currentDistances[initialNode] = 0;

    const visitedNodes = new Set();

    const pathHeap = new MinHeap();
    pathHeap.insert([initialNode, 0]); // [nodeIndex, distance]

    while (!pathHeap.isEmpty()) {
        const currentNodeIndex = pathHeap.extractMinNode();

        if (visitedNodes.has(currentNodeIndex)) {
            continue;
        }
        visitedNodes.add(currentNodeIndex);

        const currentAccumulatedDistance = currentDistances[currentNodeIndex];

        const neighborsMap = adjacencyStructure.get(currentNodeIndex);
        if (neighborsMap) {
            neighborsMap.forEach((neighborEdgeWeight, neighborNodeIndex) => {
                const tentativeNewDistance = currentAccumulatedDistance + neighborEdgeWeight;
                if (tentativeNewDistance < currentDistances[neighborNodeIndex]) {
                    currentDistances[neighborNodeIndex] = tentativeNewDistance;
                    pathHeap.insert([neighborNodeIndex, tentativeNewDistance]);
                }
            });
        }
    }
    return currentDistances;
};

const processInput = (rawText) => {
    const lineSegments = rawText.split('\n');

    const [numVertices, numEdges, firstStartNode, secondStartNode] = lineSegments[0].split(' ').map(Number);

    const edgeDescriptions = [];
    for (let currentLine = 1; currentLine <= numEdges; ++currentLine) {
        const [sourceVertex, destVertex, alphaWeight, betaWeight] = lineSegments[currentLine].split(' ').map(Number);
        edgeDescriptions.push({
            initial: sourceVertex - 1, // Convert to 0-indexed
            final: destVertex - 1,     // Convert to 0-indexed
            alphaCost: alphaWeight,
            betaCost: betaWeight
        });
    }

    const alphaPathCosts = computeShortestPaths(numVertices, edgeDescriptions, firstStartNode - 1, (edge) => edge.alphaCost);
    const betaPathCosts = computeShortestPaths(numVertices, edgeDescriptions, secondStartNode - 1, (edge) => edge.betaCost);

    const largeMagnitude = 1e15;
    const intermediateCalculations = new Array(numVertices);

    for (let nodeIdentifier = 0; nodeIdentifier < numVertices; ++nodeIdentifier) {
        intermediateCalculations[nodeIdentifier] = largeMagnitude - alphaPathCosts[nodeIdentifier] - betaPathCosts[nodeIdentifier];
    }

    const finalOutputValues = intermediateCalculations.reduceRight((accumulator, currentValue, currentPosition) => {
        if (currentPosition === numVertices - 1) {
            accumulator[currentPosition] = currentValue;
        } else {
            accumulator[currentPosition] = Math.max(currentValue, accumulator[currentPosition + 1]);
        }
        return accumulator;
    }, new Array(numVertices)); // Initialize accumulator with correct size

    console.log(finalOutputValues.join('\n'));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));