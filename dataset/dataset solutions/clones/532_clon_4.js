let globalInputSource = '';
let globalInputPointer = 0;

function acquireToken(desiredFormat) {
    if (desiredFormat === 'text') {
        return globalInputSource[globalInputPointer++];
    } else {
        return +globalInputSource[globalInputPointer++];
    }
}

function processGraphConstraints() {
    const nodeCount = acquireToken();
    const constraintQuantity = acquireToken();

    const staticEdgeList = [];
    const flexibleEdgeChoices = [];

    Array.from({ length: constraintQuantity }).forEach(() => {
        const expressionString = acquireToken('text');

        // Extract components from the expression string using a regex match
        const expressionMatch = expressionString.match(/(\d+)\s*(<=|>=|\*)\s*(\d+)\s*([\+\-])?\s*(\d+)?/);
        const nodeAIndex = +expressionMatch[1] - 1;
        const nodeBIndex = +expressionMatch[3] - 1;
        const comparisonOperator = expressionMatch[2]; // <=, >=, *
        const valueSign = expressionMatch[4]; // +, - or undefined
        const constantMagnitude = +expressionMatch[5]; // The numerical value, will be NaN if not present

        // Determine the primary constraint type (analogous to 'u' in original)
        let primaryConstraintType;
        if (comparisonOperator === '*') {
            primaryConstraintType = 'EQUIVALENCE_CONSTRAINT'; // u = 2
        } else if (comparisonOperator === '<=') {
            primaryConstraintType = 'LESS_OR_EQUAL'; // u = 0
        } else { // Must be '>='
            primaryConstraintType = 'GREATER_OR_EQUAL'; // u = 1
        }

        // Determine the value modifier type (analogous to 'v' in original)
        let modifierType;
        if (valueSign === '+') {
            modifierType = 'POSITIVE_MODIFIER'; // v = 0
        } else { // -, or no explicit sign
            modifierType = 'NEGATIVE_OR_NO_MODIFIER'; // v = 1
        }

        // Construct graph edges based on constraint types
        switch (primaryConstraintType) {
            case 'LESS_OR_EQUAL': // Original u=0
                if (modifierType === 'POSITIVE_MODIFIER') { // Original v=0
                    // Original: e.push([p[1], p[0], -p[2]])
                    staticEdgeList.push([nodeBIndex, nodeAIndex, -constantMagnitude]);
                } else { // Original v=1
                    // Original: e.push([p[1], p[0], 0]); e.push([p[0], p[1], p[2]])
                    staticEdgeList.push([nodeBIndex, nodeAIndex, 0]);
                    staticEdgeList.push([nodeAIndex, nodeBIndex, constantMagnitude]);
                }
                break;
            case 'GREATER_OR_EQUAL': // Original u=1
                if (modifierType === 'POSITIVE_MODIFIER') { // Original v=0
                    // Original: e.push([p[0], p[1], -p[2]])
                    staticEdgeList.push([nodeAIndex, nodeBIndex, -constantMagnitude]);
                } else { // Original v=1
                    // Original: e.push([p[1], p[0], p[2]]); e.push([p[0], p[1], 0])
                    staticEdgeList.push([nodeBIndex, nodeAIndex, constantMagnitude]);
                    staticEdgeList.push([nodeAIndex, nodeBIndex, 0]);
                }
                break;
            case 'EQUIVALENCE_CONSTRAINT': // Original u=2
                if (modifierType === 'POSITIVE_MODIFIER') { // Original v=0
                    // Original: f.push([[p[0], p[1], -p[2]], [p[1], p[0], -p[2]]])
                    flexibleEdgeChoices.push([
                        [nodeAIndex, nodeBIndex, -constantMagnitude],
                        [nodeBIndex, nodeAIndex, -constantMagnitude]
                    ]);
                } else { // Original v=1
                    // Original: e.push([p[1], p[0], p[2]]); e.push([p[0], p[1], p[2]])
                    staticEdgeList.push([nodeBIndex, nodeAIndex, constantMagnitude]);
                    staticEdgeList.push([nodeAIndex, nodeBIndex, constantMagnitude]);
                }
                break;
        }
    });

    // Add baseline constraints: all nodes are non-negative relative to node 0
    Array.from({ length: nodeCount }).forEach((_, currentIdx) => {
        staticEdgeList.push([currentIdx, 0, 0]); // d[0] <= d[currentIdx] + 0
    });

    let overallMaximumPotential = -Infinity;

    // Iterate through all possible combinations for flexible constraints
    const totalChoiceCombinations = 1 << flexibleEdgeChoices.length;
    for (let selectionIndex = 0; selectionIndex < totalChoiceCombinations; ++selectionIndex) {
        const currentIterationEdges = [...staticEdgeList]; // Start with all static edges

        Array.from({ length: flexibleEdgeChoices.length }).forEach((_, choiceOptionIdx) => {
            const chosenEdge = flexibleEdgeChoices[choiceOptionIdx][(selectionIndex >> choiceOptionIdx) & 1];
            currentIterationEdges.push(chosenEdge);
        });

        const nodeValuePotentials = Array(nodeCount).fill(Infinity);
        nodeValuePotentials[0] = 0; // Initialize potential of reference node (node 0) to 0

        // Bellman-Ford-like relaxation process
        // Run nodeCount iterations to ensure all paths up to length nodeCount-1 are found
        // The last iteration checks for negative cycles affecting node 0
        for (let relaxIteration = 0; relaxIteration < nodeCount; ++relaxIteration) {
            for (const currentEdge of currentIterationEdges) {
                const source = currentEdge[0];
                const destination = currentEdge[1];
                const weight = currentEdge[2];

                if (nodeValuePotentials[source] !== Infinity &&
                    nodeValuePotentials[destination] > nodeValuePotentials[source] + weight) {
                    nodeValuePotentials[destination] = nodeValuePotentials[source] + weight;
                }
            }
        }

        // Check if the reference node's potential remained 0 (no negative cycle affecting it)
        if (nodeValuePotentials[0] === 0) {
            const currentMaximum = Math.max(...nodeValuePotentials);
            overallMaximumPotential = Math.max(overallMaximumPotential, currentMaximum);
        }
    }

    // Output the final result based on the calculated maximum potential
    if (overallMaximumPotential === Infinity) {
        console.log('inf');
    } else if (overallMaximumPotential === -Infinity) {
        console.log(-1);
    } else {
        console.log(overallMaximumPotential);
    }
}

// Setup input stream processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
    globalInputSource += dataChunk;
});

process.stdin.on('end', function() {
    globalInputSource = globalInputSource.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings
    processGraphConstraints();
});