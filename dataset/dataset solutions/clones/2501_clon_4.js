const fileSystem = require('fs');

function* inputTokenizer(rawText) {
    const tokens = rawText.trim().split(/\s+/g);
    for (const token of tokens) {
        yield token;
    }
}

function retrieveNumericValue(tokenGen) {
    return parseInt(tokenGen.next().value, 10);
}

function calculateMinimumTraversalCosts(adjacencyMatrixFlat, dimensionSize) {
    const costMatrix = Array.from(adjacencyMatrixFlat);
    const infiniteCost = 9999999999;

    for (let intermediateVertex = 0; intermediateVertex < dimensionSize; intermediateVertex++) {
        for (let sourceVertex = 0; sourceVertex < dimensionSize; sourceVertex++) {
            for (let targetVertex = 0; targetVertex < dimensionSize; targetVertex++) {
                const directCost = costMatrix[sourceVertex * dimensionSize + targetVertex];
                const indirectCost = costMatrix[sourceVertex * dimensionSize + intermediateVertex] + costMatrix[intermediateVertex * dimensionSize + targetVertex];
                if (directCost > indirectCost) {
                    costMatrix[sourceVertex * dimensionSize + targetVertex] = indirectCost;
                }
            }
        }
    }
    return costMatrix;
}

function processNetworkQueries(inputContent) {
    const tokenStream = inputTokenizer(inputContent);
    const unreachableValue = 9999999999;

    const vertexCount = retrieveNumericValue(tokenStream);
    const edgeCount = retrieveNumericValue(tokenStream);
    const proximityThreshold = retrieveNumericValue(tokenStream);

    const initialNetwork = Array(vertexCount * vertexCount).fill(unreachableValue);
    for (let i = 0; i < vertexCount; i++) {
        initialNetwork[i * vertexCount + i] = 0;
    }

    for (let currentEdge = 0; currentEdge < edgeCount; currentEdge++) {
        const firstEndpoint = retrieveNumericValue(tokenStream) - 1;
        const secondEndpoint = retrieveNumericValue(tokenStream) - 1;
        const connectionWeight = retrieveNumericValue(tokenStream);
        initialNetwork[firstEndpoint * vertexCount + secondEndpoint] = Math.min(initialNetwork[firstEndpoint * vertexCount + secondEndpoint], connectionWeight);
        initialNetwork[secondEndpoint * vertexCount + firstEndpoint] = Math.min(initialNetwork[secondEndpoint * vertexCount + firstEndpoint], connectionWeight);
    }

    const originalShortestPaths = calculateMinimumTraversalCosts(initialNetwork, vertexCount);

    const transformedNetwork = Array(vertexCount * vertexCount).fill(unreachableValue);
    for (let i = 0; i < vertexCount; i++) {
        transformedNetwork[i * vertexCount + i] = 0;
    }

    for (let rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
        for (let colIdx = 0; colIdx < vertexCount; colIdx++) {
            if (originalShortestPaths[rowIdx * vertexCount + colIdx] <= proximityThreshold) {
                transformedNetwork[rowIdx * vertexCount + colIdx] = 1;
            }
        }
    }

    const finalTraversalCosts = calculateMinimumTraversalCosts(transformedNetwork, vertexCount);

    const numberOfQueries = retrieveNumericValue(tokenStream);

    for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
        const queryOrigin = retrieveNumericValue(tokenStream) - 1;
        const queryDestination = retrieveNumericValue(tokenStream) - 1;
        const computedCost = finalTraversalCosts[queryOrigin * vertexCount + queryDestination];

        if (computedCost === unreachableValue) {
            console.log(-1);
        } else {
            console.log(computedCost - 1);
        }
    }
}

module.exports = function() {
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    processNetworkQueries(standardInputContent);
};
