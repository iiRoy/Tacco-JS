const fs = require('fs');

function* lineIterator(inputString) {
    const lines = inputString.split('\n');
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        const currentLine = lines[currentLineIndex++].trim();
        if (currentLine.length > 0) {
            yield currentLine;
        }
    }
}

function processInputData() {
    const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
    const inputLineGenerator = lineIterator(rawInputContent);

    let currentLineValue;
    while ((currentLineValue = inputLineGenerator.next().value) !== undefined) {
        const currentMaxLimit = Number.parseInt(currentLineValue, 10);
        if (currentMaxLimit === 0) {
            break;
        }

        const totalNodesCount = Number.parseInt(inputLineGenerator.next().value, 10);
        
        const displacementValues = Array.from({ length: totalNodesCount }, () => 
            Number.parseInt(inputLineGenerator.next().value, 10)
        );
        
        const nodeDisplacementMap = new Array(totalNodesCount + 2).fill(0);
        displacementValues.forEach((value, index) => {
            nodeDisplacementMap[index + 1] = value;
        });

        console.log(evaluateConnectivity(currentMaxLimit, totalNodesCount, nodeDisplacementMap) ? 'OK' : 'NG');
    }
}

function initializeAdjacencyMatrix(dimensionSize) {
    return Array.from({ length: dimensionSize }, (_, rowIdentifier) =>
        Array.from({ length: dimensionSize }, (_, columnIdentifier) =>
            rowIdentifier === columnIdentifier ? 0 : Infinity
        )
    );
}

function computeAllPairsShortestPaths(distanceMatrix) {
    const graphNodeCount = distanceMatrix.length;

    Array.from({ length: graphNodeCount }, (_, pivotNode) => pivotNode).forEach(pivotNode => {
        Array.from({ length: graphNodeCount }, (_, startNode) => startNode).forEach(startNode => {
            Array.from({ length: graphNodeCount }, (_, endNode) => endNode).forEach(endNode => {
                const pathViaPivot = distanceMatrix[startNode][pivotNode] + distanceMatrix[pivotNode][endNode];
                distanceMatrix[startNode][endNode] = Math.min(distanceMatrix[startNode][endNode], pathViaPivot);
            });
        });
    });
    return distanceMatrix;
}

function evaluateConnectivity(maxJump, totalNodes, displacementData) {
    const graphDimension = totalNodes + 2;
    const adjacencyMatrix = initializeAdjacencyMatrix(graphDimension);

    const deriveTargetPosition = (currentPosition, jumpMagnitude, nValue, dArray) => {
        const intermediatePosition = currentPosition + jumpMagnitude;
        const displacementEffect = (intermediatePosition < nValue + 1) ? dArray[intermediatePosition] : 0;
        const calculatedTarget = intermediatePosition + displacementEffect;
        return Math.min(Math.max(calculatedTarget, 0), nValue + 1);
    };

    const generatedEdges = Array.from({ length: totalNodes + 1 }, (_, currentIdx) =>
        Array.from({ length: maxJump }, (_, jumpOffset) => jumpOffset + 1)
            .map(jump => ({
                source: currentIdx,
                target: deriveTargetPosition(currentIdx, jump, totalNodes, displacementData)
            }))
    ).flat();

    generatedEdges.forEach(edge => {
        if (edge.source !== edge.target) {
            adjacencyMatrix[edge.source][edge.target] = 1;
        }
    });

    const finalDistances = computeAllPairsShortestPaths(adjacencyMatrix);

    const isAnyPathBlocked = Array.from({ length: totalNodes + 1 }, (_, nodeIndex) => nodeIndex)
        .some(intermediateNode =>
            finalDistances[0][intermediateNode] < Infinity &&
            finalDistances[intermediateNode][totalNodes + 1] === Infinity
        );

    return !isAnyPathBlocked;
}

processInputData();
