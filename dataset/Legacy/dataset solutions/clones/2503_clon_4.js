const fileSystem = require("fs");

const calculateAllPairsShortestPaths = (graphAdjacencyMatrix) => {
    const nodeQuantity = graphAdjacencyMatrix.length;
    const pathDistances = graphAdjacencyMatrix.map(rowContent => [...rowContent]);

    Array.from({ length: nodeQuantity }, (_, intermediateNodeIndex) => intermediateNodeIndex).forEach(intermediateNodeIndex => {
        Array.from({ length: nodeQuantity }, (_, sourceNodeIndex) => sourceNodeIndex).forEach(sourceNodeIndex => {
            Array.from({ length: nodeQuantity }, (_, destinationNodeIndex) => destinationNodeIndex).forEach(destinationNodeIndex => {
                const pathThroughIntermediate = pathDistances[sourceNodeIndex][intermediateNodeIndex] + pathDistances[intermediateNodeIndex][destinationNodeIndex];
                if (pathDistances[sourceNodeIndex][destinationNodeIndex] > pathThroughIntermediate) {
                    pathDistances[sourceNodeIndex][destinationNodeIndex] = pathThroughIntermediate;
                }
            });
        });
    });
    return pathDistances;
};

const createInputProcessor = (rawInputString) => {
    const inputTokens = rawInputString.trim().split(/\s+/g);
    let currentTokenPosition = 0;

    const fetchNextToken = () => inputTokens[currentTokenPosition++];
    const fetchNextInteger = () => parseInt(fetchNextToken(), 10);

    return { fetchNextToken, fetchNextInteger };
};

const executeGraphAnalysis = (inputAccessors) => {
    const INFINITY_VALUE = 99999999999;

    const totalNodes = inputAccessors.fetchNextInteger();
    const totalEdges = inputAccessors.fetchNextInteger();
    const maxAllowedDirectDistance = inputAccessors.fetchNextInteger();

    let initialAdjacencyMatrix = Array.from({ length: totalNodes }, (_, rowIndex) =>
        Array.from({ length: totalNodes }, (_, colIndex) => (rowIndex === colIndex ? 0 : INFINITY_VALUE))
    );

    Array.from({ length: totalEdges }).forEach(() => {
        const startVertex = inputAccessors.fetchNextInteger() - 1;
        const endVertex = inputAccessors.fetchNextInteger() - 1;
        const edgeWeight = inputAccessors.fetchNextInteger();

        initialAdjacencyMatrix[startVertex][endVertex] = edgeWeight;
        initialAdjacencyMatrix[endVertex][startVertex] = edgeWeight;
    });

    const originalShortestPaths = calculateAllPairsShortestPaths(initialAdjacencyMatrix);

    const conditionalGraphMatrix = Array.from({ length: totalNodes }, (_, rowIdx) =>
        Array.from({ length: totalNodes }, (_, colIdx) => {
            if (rowIdx === colIdx) return 0;
            return originalShortestPaths[rowIdx][colIdx] <= maxAllowedDirectDistance ? 1 : INFINITY_VALUE;
        })
    );

    const finalShortestPaths = calculateAllPairsShortestPaths(conditionalGraphMatrix);

    const numberOfQueries = inputAccessors.fetchNextInteger();
    const queryResults = Array.from({ length: numberOfQueries }).map(() => {
        const queryStartNode = inputAccessors.fetchNextInteger() - 1;
        const queryEndNode = inputAccessors.fetchNextInteger() - 1;

        const pathLengthInConditionalGraph = finalShortestPaths[queryStartNode][queryEndNode];

        return pathLengthInConditionalGraph === INFINITY_VALUE ? -1 : pathLengthInConditionalGraph - 1;
    });

    console.log(queryResults.join("\n"));
};

const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputProcessor = createInputProcessor(standardInputContent);
executeGraphAnalysis(inputProcessor);
