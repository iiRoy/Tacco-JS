function processConstraints() {
    var nodeCount = readToken();
    var constraintCount = readToken();

    var fixedEdges = [];
    var conditionalEdges = [];

    const OPERATOR_LE = 0;
    const OPERATOR_GE = 1;
    const OPERATOR_MULTIPLY = 2;

    const SIGN_POSITIVE = 0;
    const SIGN_NEGATIVE = 1;

    function parseConstraintString(constraintInput) {
        const parts = constraintInput.split(/<=|>=|\*|\+|-/);
        const firstNodeIdx = +parts[0] - 1;
        const secondNodeIdx = +parts[1] - 1;
        const edgeWeight = +parts[2];

        let currentOperatorType;
        if (constraintInput.includes('*')) {
            currentOperatorType = OPERATOR_MULTIPLY;
        } else {
            currentOperatorType = +(constraintInput.includes('<=') === false);
        }

        let currentSignType;
        currentSignType = +(constraintInput.includes('+') === false);

        return {
            node1: firstNodeIdx,
            node2: secondNodeIdx,
            weight: edgeWeight,
            opType: currentOperatorType,
            sgnType: currentSignType
        };
    }

    iterateRange(constraintCount, function() {
        var constraintString = readToken('string');
        const parsedData = parseConstraintString(constraintString);

        const { node1, node2, weight, opType, sgnType } = parsedData;

        if (opType === OPERATOR_LE) {
            if (sgnType === SIGN_POSITIVE) {
                fixedEdges.push([node2, node1, -weight]);
            } else {
                fixedEdges.push([node2, node1, 0]);
                fixedEdges.push([node1, node2, weight]);
            }
        } else if (opType === OPERATOR_GE) {
            if (sgnType === SIGN_POSITIVE) {
                fixedEdges.push([node1, node2, -weight]);
            } else {
                fixedEdges.push([node2, node1, weight]);
                fixedEdges.push([node1, node2, 0]);
            }
        } else {
            if (sgnType === SIGN_POSITIVE) {
                conditionalEdges.push([[node1, node2, -weight], [node2, node1, -weight]]);
            } else {
                fixedEdges.push([node2, node1, weight]);
                fixedEdges.push([node1, node2, weight]);
            }
        }
    });

    iterateRange(nodeCount, function(idx) {
        fixedEdges.push([idx, 0, 0]);
    });

    var finalResult = -Infinity;
    const numConditionalEdges = conditionalEdges.length;
    const totalCombinations = 1 << numConditionalEdges;

    iterateRange(totalCombinations, function(combinationIndex) {
        var currentEdges = [].concat(fixedEdges);
        iterateRange(numConditionalEdges, function(idx) {
            const selectedOption = (combinationIndex >> idx) & 1;
            currentEdges.push(conditionalEdges[idx][selectedOption]);
        });

        var distances = [];
        iterateRange(nodeCount, function(idx) {
            distances[idx] = Infinity;
        });
        distances[0] = 0;

        for (let k = 0; k < nodeCount; ++k) {
            for (let j = 0; j < currentEdges.length; ++j) {
                const currentEdge = currentEdges[j];
                const sourceNode = currentEdge[0];
                const destNode = currentEdge[1];
                const edgeWeight = currentEdge[2];

                const potentialNewDistance = distances[sourceNode] + edgeWeight;
                if (potentialNewDistance < distances[destNode]) {
                    distances[destNode] = potentialNewDistance;
                }
            }
        }

        if (distances[0] >= 0) {
            finalResult = Math.max(finalResult, distances[nodeCount - 1]);
        }
    });

    if (finalResult === Infinity) {
        outputValue('inf');
    } else if (finalResult === -Infinity) {
        outputValue(-1);
    } else {
        outputValue(finalResult);
    }
}
 
function iterateRange(start, end, callbackFn) {
    if (callbackFn == null) {
        callbackFn = end;
        end = start;
        start = 0;
    }
    for (var i = start; i < end; ++i) {
        callbackFn(i);
    }
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawInputBuffer = '';
var inputTokenIndex = 0;
 
function readToken(desiredType) {
    if (desiredType === 'string') {
        return rawInputBuffer[inputTokenIndex++];
    } else {
        return +rawInputBuffer[inputTokenIndex++];
    }
}
 
function outputValue(outputVal) {
    console.log(outputVal);
}
 
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    processConstraints();
});
