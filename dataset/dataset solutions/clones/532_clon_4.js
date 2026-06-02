let rawInputBuffer = '';
let currentTokenIndex = 0;

function obtainInputToken(tokenType) {
    if (tokenType === 'string') {
        return rawInputBuffer[currentTokenIndex++];
    } else {
        return Number(rawInputBuffer[currentTokenIndex++]);
    }
}

function outputResult(value) {
    console.log(value);
}

function parseConstraintString(constraintText) {
    const matchResult = constraintText.match(/(\d+)(<=|>=|\*|\+|-)(\d+)(<=|>=|\*|\+|-)(\d+)/);
    if (!matchResult) {
        throw new Error("Constraint string format error: " + constraintText);
    }

    const firstNodeIdx = Number(matchResult[1]) - 1;
    const secondNodeIdx = Number(matchResult[3]) - 1;
    const constraintVal = Number(matchResult[5]);
    const operatorU = matchResult[2];
    const operatorV = matchResult[4];

    let uCategory;
    switch (operatorU) {
        case '<=': uCategory = 0; break;
        case '>=': uCategory = 1; break;
        case '*':  uCategory = 2; break;
        default: throw new Error("Unknown U operator: " + operatorU);
    }

    let vCategory;
    switch (operatorV) {
        case '+': vCategory = 0; break;
        case '-': vCategory = 1; break;
        default: throw new Error("Unknown V operator: " + operatorV);
    }
    return { firstNodeIdx, secondNodeIdx, constraintVal, uCategory, vCategory };
}

function* generateEdgeCombinations(edgePairs) {
    if (edgePairs.length === 0) {
        yield [];
        return;
    }

    const [currentPair, ...remainingPairs] = edgePairs;
    for (const subCombination of generateEdgeCombinations(remainingPairs)) {
        yield [currentPair[0], ...subCombination];
        yield [currentPair[1], ...subCombination];
    }
}

function computeBellmanFordMaxDistance(totalNodes, graphEdges) {
    const nodeDistances = Array(totalNodes).fill(Infinity);
    nodeDistances[0] = 0;

    Array.from({ length: totalNodes }).forEach(() => {
        for (const [sourceNode, targetNode, edgeWeight] of graphEdges) {
            if (nodeDistances[sourceNode] !== Infinity && nodeDistances[sourceNode] + edgeWeight < nodeDistances[targetNode]) {
                nodeDistances[targetNode] = nodeDistances[sourceNode] + edgeWeight;
            }
        }
    });

    if (nodeDistances[0] !== 0) {
        return null;
    }

    return Math.max(...nodeDistances);
}

function executeProgram() {
    const nodeCount = obtainInputToken();
    const constraintCount = obtainInputToken();

    const fixedGraphEdges = [];
    const conditionalGraphEdgePairs = [];

    const edgeConstructionMap = {
        '0_0': ({ firstNodeIdx, secondNodeIdx, constraintVal }) => {
            fixedGraphEdges.push([secondNodeIdx, firstNodeIdx, -constraintVal]);
        },
        '0_1': ({ firstNodeIdx, secondNodeIdx, constraintVal }) => {
            fixedGraphEdges.push([secondNodeIdx, firstNodeIdx, 0]);
            fixedGraphEdges.push([firstNodeIdx, secondNodeIdx, constraintVal]);
        },
        '1_0': ({ firstNodeIdx, secondNodeIdx, constraintVal }) => {
            fixedGraphEdges.push([firstNodeIdx, secondNodeIdx, -constraintVal]);
        },
        '1_1': ({ firstNodeIdx, secondNodeIdx, constraintVal }) => {
            fixedGraphEdges.push([secondNodeIdx, firstNodeIdx, constraintVal]);
            fixedGraphEdges.push([firstNodeIdx, secondNodeIdx, 0]);
        },
        '2_0': ({ firstNodeIdx, secondNodeIdx, constraintVal }) => {
            conditionalGraphEdgePairs.push([[firstNodeIdx, secondNodeIdx, -constraintVal], [secondNodeIdx, firstNodeIdx, -constraintVal]]);
        },
        '2_1': ({ firstNodeIdx, secondNodeIdx, constraintVal }) => {
            fixedGraphEdges.push([secondNodeIdx, firstNodeIdx, constraintVal]);
            fixedGraphEdges.push([firstNodeIdx, secondNodeIdx, constraintVal]);
        }
    };

    Array.from({ length: constraintCount }).forEach(() => {
        const constraintString = obtainInputToken('string');
        const { firstNodeIdx, secondNodeIdx, constraintVal, uCategory, vCategory } = parseConstraintString(constraintString);
        edgeConstructionMap[`${uCategory}_${vCategory}`]({ firstNodeIdx, secondNodeIdx, constraintVal });
    });

    Array.from({ length: nodeCount }).forEach((_, i) => {
        fixedGraphEdges.push([i, 0, 0]);
    });

    let overallMaximumDistance = -Infinity;

    for (const currentConditionalEdges of generateEdgeCombinations(conditionalGraphEdgePairs)) {
        const combinedGraphEdges = [...fixedGraphEdges, ...currentConditionalEdges];
        const currentMaxDistance = computeBellmanFordMaxDistance(nodeCount, combinedGraphEdges);

        if (currentMaxDistance !== null) {
            overallMaximumDistance = Math.max(overallMaximumDistance, currentMaxDistance);
        }
    }

    if (overallMaximumDistance === Infinity) {
        outputResult('inf');
    } else if (overallMaximumDistance === -Infinity) {
        outputResult(-1);
    } else {
        outputResult(overallMaximumDistance);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    executeProgram();
});
