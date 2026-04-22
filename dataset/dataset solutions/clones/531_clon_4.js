let incomingData = '';
let dataPointer = 0;

function acquireToken(kind) {
    if (kind === 'alphanumeric') {
        return incomingData[dataPointer++];
    } else {
        return Number(incomingData[dataPointer++]);
    }
}

function displayResult(value) {
    console.log(value);
}

function performIterations(begin, end, action) {
    if (action === undefined) {
        action = end;
        end = begin;
        begin = 0;
    }
    for (let current = begin; current < end; ++current) {
        action(current);
    }
}

function processConstraints() {
    const nodeQuantity = acquireToken();
    const constraintQuantity = acquireToken();

    const staticEdges = [];
    const dynamicEdgeChoices = [];

    performIterations(constraintQuantity, () => {
        const expressionText = acquireToken('alphanumeric');

        const expressionMatch = expressionText.match(/(\d+)\s*(<=|>=|\*)\s*(\d+)\s*(\+|-)\s*(\d+)/);
        // Error handling for malformed input is omitted as per original's implied behavior
        // (assuming input is always valid based on problem spec).

        const leftNode = Number(expressionMatch[1]) - 1;
        const mainOperator = expressionMatch[2];
        const rightNode = Number(expressionMatch[3]) - 1;
        const secondaryOperator = expressionMatch[4];
        const valueComponent = Number(expressionMatch[5]);

        let mainOpClassification;
        if (mainOperator === '*') {
            mainOpClassification = 2;
        } else if (mainOperator === '<=') {
            mainOpClassification = 1;
        } else { // Implies '>='
            mainOpClassification = 0;
        }

        let secondaryOpClassification;
        if (secondaryOperator === '+') {
            secondaryOpClassification = 0;
        } else { // Implies '-'
            secondaryOpClassification = 1;
        }

        const createEdgeObject = (src, dest, wt) => ({ origin: src, destination: dest, magnitude: wt });

        if (mainOpClassification === 0) { // Corresponds to A >= B op C
            if (secondaryOpClassification === 0) { // Corresponds to A >= B + C
                staticEdges.push(createEdgeObject(rightNode, leftNode, -valueComponent));
            } else { // Corresponds to A >= B - C
                staticEdges.push(createEdgeObject(rightNode, leftNode, 0));
                staticEdges.push(createEdgeObject(leftNode, rightNode, valueComponent));
            }
        } else if (mainOpClassification === 1) { // Corresponds to A <= B op C
            if (secondaryOpClassification === 0) { // Corresponds to A <= B + C
                staticEdges.push(createEdgeObject(leftNode, rightNode, -valueComponent));
            } else { // Corresponds to A <= B - C
                staticEdges.push(createEdgeObject(rightNode, leftNode, valueComponent));
                staticEdges.push(createEdgeObject(leftNode, rightNode, 0));
            }
        } else { // Corresponds to A * B op C
            if (secondaryOpClassification === 0) { // Corresponds to A * B + C
                dynamicEdgeChoices.push([
                    createEdgeObject(leftNode, rightNode, -valueComponent),
                    createEdgeObject(rightNode, leftNode, -valueComponent)
                ]);
            } else { // Corresponds to A * B - C
                staticEdges.push(createEdgeObject(rightNode, leftNode, valueComponent));
                staticEdges.push(createEdgeObject(leftNode, rightNode, valueComponent));
            }
        }
    });

    performIterations(nodeQuantity, (nodeIndex) => {
        staticEdges.push(createEdgeObject(nodeIndex, 0, 0));
    });

    let maximalPotential = -Infinity;

    function exploreCombinations(choiceIndex, currentSelectedEdges) {
        if (choiceIndex === dynamicEdgeChoices.length) {
            const allGraphEdges = [...staticEdges, ...currentSelectedEdges];

            const nodePotentials = new Map();
            performIterations(nodeQuantity, (idx) => {
                nodePotentials.set(idx, Infinity);
            });
            nodePotentials.set(0, 0);

            // Bellman-Ford algorithm
            // N iterations to ensure all paths are relaxed and detect negative cycles
            performIterations(nodeQuantity, () => {
                for (const edge of allGraphEdges) {
                    const potentialFrom = nodePotentials.get(edge.origin);
                    const potentialTo = nodePotentials.get(edge.destination);

                    if (potentialFrom !== Infinity && potentialTo > potentialFrom + edge.magnitude) {
                        nodePotentials.set(edge.destination, potentialFrom + edge.magnitude);
                    }
                }
            });

            // Check for negative cycle involving the source node (node 0)
            if (nodePotentials.get(0) >= 0) {
                const targetNodePotential = nodePotentials.get(nodeQuantity - 1);
                maximalPotential = Math.max(maximalPotential, targetNodePotential);
            }

            return;
        }

        // Recursively explore both options for the current dynamic constraint
        exploreCombinations(choiceIndex + 1, [...currentSelectedEdges, dynamicEdgeChoices[choiceIndex][0]]);
        exploreCombinations(choiceIndex + 1, [...currentSelectedEdges, dynamicEdgeChoices[choiceIndex][1]]);
    }

    exploreCombinations(0, []);

    if (maximalPotential === Infinity) {
        displayResult('inf');
    } else if (maximalPotential === -Infinity) {
        displayResult(-1);
    } else {
        displayResult(maximalPotential);
    }
}

// Standard Node.js input setup
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    incomingData += chunk;
});

process.stdin.on('end', () => {
    incomingData = incomingData.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings
    processConstraints();
});