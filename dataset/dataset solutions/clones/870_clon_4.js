class DataParser {
    #tokens;
    #currentIndex;

    constructor(sourceText, splitterChars) {
        const splitRegex = new RegExp(`[${splitterChars}]`, 'g');
        this.#tokens = sourceText.replace(/\r/g, '').split(splitRegex).filter(t => t !== '');
        this.#currentIndex = 0;
    }

    hasMoreTokens() {
        return this.#currentIndex < this.#tokens.length;
    }

    extractNextToken() {
        if (!this.hasMoreTokens()) {
            throw new Error("Input error: No more tokens available.");
        }
        return this.#tokens[this.#currentIndex++];
    }

    getNextInteger() {
        const token = this.extractNextToken();
        const numericValue = parseInt(token, 10);
        if (isNaN(numericValue)) {
            throw new TypeError(`Input error: Token '${token}' cannot be converted to an integer.`);
        }
        return numericValue;
    }
}

function ProcessInput(sourceData) {
    "use strict";

    const outputResult = console.log;
    const inputReader = new DataParser(sourceData, " \n");

    const totalVertices = inputReader.getNextInteger();
    const totalEdges = inputReader.getNextInteger();

    const outgoingLinks = new Map(); // Map: Node ID -> Set<Node ID> of neighbors
    const costRegistry = new Map();  // Map: Node ID -> Map<Node ID, Edge Cost>

    // Initialize graph structures for all vertices (0 to totalVertices - 1)
    for (let vertexIndex = 0; vertexIndex < totalVertices; ++vertexIndex) {
        outgoingLinks.set(vertexIndex, new Set());
        costRegistry.set(vertexIndex, new Map());
    }

    // Populate graph data from input
    for (let edgeCounter = 0; edgeCounter < totalEdges; ++edgeCounter) {
        const originPoint = inputReader.getNextInteger();
        const destinationPoint = inputReader.getNextInteger();
        const travelCost = inputReader.getNextInteger();

        outgoingLinks.get(originPoint).add(destinationPoint);
        costRegistry.get(originPoint).set(destinationPoint, travelCost);
    }

    // Recursive function to determine the maximum value of a simple path
    // A simple path means no repeated vertices. This implementation uses a functional style
    // by creating new Sets for visited locations in each recursive call,
    // avoiding mutation of shared state, and using array methods for processing neighbors.
    const CalculateMaximumRouteValue = (currentPoint, accumulatedValue, visitDepth, visitedLocations) => {
        const neighborsOfCurrent = outgoingLinks.get(currentPoint);

        // Base case 1: If the current point has no outgoing connections
        // or if it's not even registered in our graph (though initialization prevents the latter)
        if (!neighborsOfCurrent || neighborsOfCurrent.size === 0) {
            return accumulatedValue;
        }

        // Filter for neighbors that have not been visited in the current path
        const eligibleNextPoints = Array.from(neighborsOfCurrent).filter(
            (neighborId) => !visitedLocations.has(neighborId)
        );

        // Base case 2: If all neighbors have already been visited in the current path
        if (eligibleNextPoints.length === 0) {
            return accumulatedValue;
        }

        // Recursively explore all eligible paths using map to generate potential values
        const potentialRouteValues = eligibleNextPoints.map((nextPoint) => {
            const nextAccumulatedValue = accumulatedValue + costRegistry.get(currentPoint).get(nextPoint);
            // Create a new Set for each branch to maintain path independence and avoid side effects
            const newVisitedLocations = new Set(visitedLocations).add(nextPoint);
            return CalculateMaximumRouteValue(nextPoint, nextAccumulatedValue, visitDepth + 1, newVisitedLocations);
        });

        // Return the highest value found among all explored branches
        return Math.max(...potentialRouteValues);
    };

    // Start the path calculation from node 0 with an initial value of 0, depth 0, and an empty set of visited locations.
    outputResult(CalculateMaximumRouteValue(0, 0, 0, new Set()));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));