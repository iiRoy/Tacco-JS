const INF_DIST = Infinity;
const NEG_INF_DIST = -Infinity;
const NO_SOLUTION_INDICATOR = -1;
const NODE_ZERO_INDEX = 0;

// Operator types for 'u'
const OP_TYPE_GE = 0; // Corresponds to original 'u == 0' (>=)
const OP_TYPE_LE = 1; // Corresponds to original 'u == 1' (<=)
const OP_TYPE_STAR = 2; // Corresponds to original 'u == 2' (*)

// Sign types for 'v'
const SIGN_TYPE_PLUS = 0; // Corresponds to original 'v == 0' (+)
const SIGN_TYPE_MINUS = 1; // Corresponds to original 'v == 1' (-)

function parseConstraintString(constraintString) {
    const parts = constraintString.split(/<=|>=|\*|\+|-/);
    const nodeA = +parts[0] - 1;
    const nodeB = +parts[1] - 1;
    const weight = +parts[2];

    let operatorKind;
    if (constraintString.includes('*')) {
        operatorKind = OP_TYPE_STAR;
    } else {
        operatorKind = constraintString.includes('<=') ? OP_TYPE_LE : OP_TYPE_GE;
    }

    const signKind = constraintString.includes('+') ? SIGN_TYPE_PLUS : SIGN_TYPE_MINUS;

    return { nodeA, nodeB, weight, operatorKind, signKind };
}

function performBellmanFord(numNodes, graphEdges, startNode) {
    const distances = new Array(numNodes).fill(INF_DIST);
    distances[startNode] = 0;

    // Perform 'numNodes' relaxation passes as per original logic
    iterateRange(numNodes, () => {
        for (const currentEdge of graphEdges) {
            const [sourceNode, targetNode, edgeWeight] = currentEdge;
            if (distances[sourceNode] !== INF_DIST) {
                const newDistance = distances[sourceNode] + edgeWeight;
                if (newDistance < distances[targetNode]) {
                    distances[targetNode] = newDistance;
                }
            }
        }
    });
    return distances;
}

function main() {
    const nodeCount = readInputToken();
    const edgeCount = readInputToken();

    const fixedEdges = []; // Corresponds to original 'e'
    const conditionalEdgePairs = []; // Corresponds to original 'f'

    iterateRange(edgeCount, () => {
        const inputConstraintString = readInputToken('string');
        const { nodeA, nodeB, weight, operatorKind, signKind } = parseConstraintString(inputConstraintString);

        const negatedWeight = -weight;

        if (operatorKind === OP_TYPE_GE) { // Original 'u == 0' (>=)
            if (signKind === SIGN_TYPE_PLUS) { // Original 'v == 0' (+)
                fixedEdges.push([nodeB, nodeA, negatedWeight]);
            } else { // Original 'v == 1' (-)
                fixedEdges.push([nodeB, nodeA, 0]);
                fixedEdges.push([nodeA, nodeB, weight]);
            }
        } else if (operatorKind === OP_TYPE_LE) { // Original 'u == 1' (<=)
            if (signKind === SIGN_TYPE_PLUS) { // Original 'v == 0' (+)
                fixedEdges.push([nodeA, nodeB, negatedWeight]);
            } else { // Original 'v == 1' (-)
                fixedEdges.push([nodeB, nodeA, weight]);
                fixedEdges.push([nodeA, nodeB, 0]);
            }
        } else { // Original 'u == 2' (*)
            if (signKind === SIGN_TYPE_PLUS) { // Original 'v == 0' (+)
                conditionalEdgePairs.push([[nodeA, nodeB, negatedWeight], [nodeB, nodeA, negatedWeight]]);
            } else { // Original 'v == 1' (-)
                fixedEdges.push([nodeB, nodeA, weight]);
                fixedEdges.push([nodeA, nodeB, weight]);
            }
        }
    });

    let resultValue = NEG_INF_DIST;
    const numCombinations = 1 << conditionalEdgePairs.length;

    iterateRange(numCombinations, (combinationIndex) => {
        const currentGraphEdges = [...fixedEdges]; // Create a new array by copying fixed edges

        iterateRange(conditionalEdgePairs.length, (pairIndex) => {
            const selectedEdge = conditionalEdgePairs[pairIndex][(combinationIndex >> pairIndex) & 1];
            currentGraphEdges.push(selectedEdge);
        });

        const distances = performBellmanFord(nodeCount, currentGraphEdges, NODE_ZERO_INDEX);

        // If distance to node 0 is still 0 after 'nodeCount' relaxations,
        // it implies no negative cycle reachable from 0 affects node 0.
        if (distances[NODE_ZERO_INDEX] === 0) {
            const maxDistanceInCurrentGraph = Math.max(...distances);
            resultValue = Math.max(resultValue, maxDistanceInCurrentGraph);
        }
    });

    if (resultValue === INF_DIST) {
        outputValue('inf');
    } else if (resultValue === NEG_INF_DIST) {
        outputValue(NO_SOLUTION_INDICATOR);
    } else {
        outputValue(resultValue);
    }
}
 
// Renamed 'rep' to 'iterateRange'
function iterateRange(startOrEnd, endOrFunc, func) {
    let start = 0;
    let end;
    let callback;

    if (func === undefined) {
        end = startOrEnd;
        callback = endOrFunc;
    } else {
        start = startOrEnd;
        end = endOrFunc;
        callback = func;
    }

    for (let loopIdx = start; loopIdx < end; ++loopIdx) {
        callback(loopIdx);
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let allInputData = ''; // Renamed 'input' to 'allInputData'
let inputTokenIndex = 0; // Renamed 'input_index' to 'inputTokenIndex'
 
// Renamed 'scan' to 'readInputToken'
function readInputToken(tokenType) {
    if (tokenType === 'string') {
        return allInputData[inputTokenIndex++];
    } else {
        return +allInputData[inputTokenIndex++];
    }
}
 
// Renamed 'print' to 'outputValue'
function outputValue(outputData) { // Renamed 'val' to 'outputData'
    console.log(outputData);
}
 
process.stdin.on('data', function(dataChunk) { // Renamed 'chunk' to 'dataChunk'
    allInputData += dataChunk;
});
process.stdin.on('end', function() {
    allInputData = allInputData.split(/\s+/);
    main();
});
