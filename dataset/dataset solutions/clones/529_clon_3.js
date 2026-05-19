var rawInputBuffer = '';
var inputBufferPointer = 0;

function readInput(dataType) {
    if (dataType === 'string') {
        return rawInputBuffer[inputBufferPointer++];
    } else {
        return Number(rawInputBuffer[inputBufferPointer++]);
    }
}

function outputResult(value) {
    console.log(value);
}

function iterateRange(startValue, endValue, iterationCallback) {
    if (iterationCallback === undefined) {
        iterationCallback = endValue;
        endValue = startValue;
        startValue = 0;
    }
    for (let currentIdx = startValue; currentIdx < endValue; ++currentIdx) {
        iterationCallback(currentIdx);
    }
}

function parseConstraintString(constraintString) {
    const constraintParts = constraintString.split(/<=|>=|\*|\+|-/);
    const sourceNode = Number(constraintParts[0]) - 1;
    const targetNode = Number(constraintParts[1]) - 1;
    const edgeWeight = Number(constraintParts[2]);

    let comparisonTypeIndicator;
    if (constraintString.includes('*')) {
        comparisonTypeIndicator = 2; // Represents '*'
    } else {
        comparisonTypeIndicator = Number(constraintString.includes('<=') === false); // 0 for '<=', 1 for '>='
    }

    let operatorTypeIndicator;
    operatorTypeIndicator = Number(constraintString.includes('+') === false); // 0 for '+', 1 for '-'

    return {
        sourceNode,
        targetNode,
        edgeWeight,
        comparisonTypeIndicator,
        operatorTypeIndicator
    };
}

function calculateShortestPaths(numNodes, edgesList, startNode) {
    const distances = new Array(numNodes).fill(Number.POSITIVE_INFINITY);
    distances[startNode] = 0;

    // Perform V relaxations to find shortest paths and detect negative cycles
    iterateRange(numNodes, () => {
        iterateRange(edgesList.length, (edgeIndex) => {
            const currentEdge = edgesList[edgeIndex];
            const fromNode = currentEdge[0];
            const toNode = currentEdge[1];
            const weight = currentEdge[2];

            if (distances[fromNode] !== Number.POSITIVE_INFINITY) {
                const potentialNewDistance = distances[fromNode] + weight;
                if (potentialNewDistance < distances[toNode]) {
                    distances[toNode] = potentialNewDistance;
                }
            }
        });
    });
    return distances;
}


function main() {
    const nodeCount = readInput();
    const edgeCount = readInput();

    const fixedEdges = [];
    const conditionalEdgeGroups = [];

    iterateRange(edgeCount, () => {
        const inputConstraintString = readInput('string');
        const parsedConstraintData = parseConstraintString(inputConstraintString);

        const { sourceNode, targetNode, edgeWeight, comparisonTypeIndicator, operatorTypeIndicator } = parsedConstraintData;

        const currentConstraintEdges = [];

        if (comparisonTypeIndicator === 0) { // Constraint type: '<='
            if (operatorTypeIndicator === 0) { // Operator type: '+'
                currentConstraintEdges.push([targetNode, sourceNode, -edgeWeight]);
            } else { // Operator type: '-'
                currentConstraintEdges.push([targetNode, sourceNode, 0]);
                currentConstraintEdges.push([sourceNode, targetNode, edgeWeight]);
            }
        } else if (comparisonTypeIndicator === 1) { // Constraint type: '>='
            if (operatorTypeIndicator === 0) { // Operator type: '+'
                currentConstraintEdges.push([sourceNode, targetNode, -edgeWeight]);
            } else { // Operator type: '-'
                currentConstraintEdges.push([targetNode, sourceNode, edgeWeight]);
                currentConstraintEdges.push([sourceNode, targetNode, 0]);
            }
        } else { // Constraint type: '*'
            if (operatorTypeIndicator === 0) { // Operator type: '+'
                conditionalEdgeGroups.push([[sourceNode, targetNode, -edgeWeight], [targetNode, sourceNode, -edgeWeight]]);
            } else { // Operator type: '-'
                currentConstraintEdges.push([targetNode, sourceNode, edgeWeight]);
                currentConstraintEdges.push([sourceNode, targetNode, edgeWeight]);
            }
        }

        // Add generated edges to the list of fixed edges if they are not part of a conditional group
        if (comparisonTypeIndicator !== 2 || operatorTypeIndicator !== 0) {
            fixedEdges.push(...currentConstraintEdges);
        }
    });

    let maxDistance = Number.NEGATIVE_INFINITY;

    const totalCombinations = 1 << conditionalEdgeGroups.length;
    iterateRange(totalCombinations, (combinationIndex) => {
        const currentEdgesForBellmanFord = [...fixedEdges];

        iterateRange(conditionalEdgeGroups.length, (groupIndex) => {
            const selectedConditionalEdge = conditionalEdgeGroups[groupIndex][(combinationIndex >> groupIndex) & 1];
            currentEdgesForBellmanFord.push(selectedConditionalEdge);
        });

        const distancesFromSource = calculateShortestPaths(nodeCount, currentEdgesForBellmanFord, 0);

        const distanceToSelfFromSource = distancesFromSource[0];
        if (distanceToSelfFromSource >= 0) { // Check for negative cycle reachable from source
            maxDistance = Math.max(maxDistance, distancesFromSource[nodeCount - 1]);
        }
    });

    if (maxDistance === Number.POSITIVE_INFINITY) {
        outputResult('inf');
    } else if (maxDistance === Number.NEGATIVE_INFINITY) {
        outputResult(-1);
    } else {
        outputResult(maxDistance);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    main();
});
