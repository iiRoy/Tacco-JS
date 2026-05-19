class InputProcessor {
    constructor() {
        this.buffer = '';
        this.cursor = 0;
        this.tokens = [];
    }

    appendChunk(chunk) {
        this.buffer += chunk;
    }

    finalizeBuffer() {
        this.tokens = this.buffer.split(/\s+/).filter(Boolean);
    }

    fetchNumber() {
        if (this.cursor >= this.tokens.length) {
            throw new Error("Not enough input tokens for number.");
        }
        return +this.tokens[this.cursor++];
    }

    fetchString() {
        if (this.cursor >= this.tokens.length) {
            throw new Error("Not enough input tokens for string.");
        }
        return this.tokens[this.cursor++];
    }
}

const displayOutput = (value) => {
    console.log(value);
};

function* generateEdgeSelections(edgeOptionPairs) {
    const pairCount = edgeOptionPairs.length;
    for (let i = 0; i < (1 << pairCount); ++i) {
        const currentSelection = [];
        for (let j = 0; j < pairCount; ++j) {
            currentSelection.push(edgeOptionPairs[j][(i >> j) & 1]);
        }
        yield currentSelection;
    }
}

const solveGraphProblem = () => {
    const nodeQuantity = inputHandler.fetchNumber();
    const constraintQuantity = inputHandler.fetchNumber();

    const definiteEdges = [];
    const alternativeEdgeSets = [];

    const constraintPattern = /^(\d+)\s*(<=|>=|\*)\s*(\d+)\s*(\+|-)\s*(\d+)$/;

    const edgeConstructionMap = {
        '<=': {
            '+': (n1, n2, c) => [[n2, n1, -c]], // N1 <= N2 + C  => d[N1] - d[N2] <= -C
            '-': (n1, n2, c) => [[n2, n1, 0], [n1, n2, c]] // N1 <= N2 - C => d[N1] <= d[N2] and d[N2] <= d[N1] + C
        },
        '>=': {
            '+': (n1, n2, c) => [[n1, n2, -c]], // N1 >= N2 + C => d[N2] - d[N1] <= -C
            '-': (n1, n2, c) => [[n2, n1, c], [n1, n2, 0]] // N1 >= N2 - C => d[N1] <= d[N2] + C and d[N2] <= d[N1]
        },
        '*': {
            '+': (n1, n2, c) => [[[n1, n2, -c], [n2, n1, -c]]], // N1 * N2 + C => |d[N1] - d[N2]| = C
            '-': (n1, n2, c) => [[n2, n1, c], [n1, n2, c]] // N1 * N2 - C => |d[N1] - d[N2]| <= C
        }
    };

    for (let k = 0; k < constraintQuantity; ++k) {
        const currentConstraintString = inputHandler.fetchString();
        const matchResult = currentConstraintString.match(constraintPattern);

        const nodeIdxA = +matchResult[1] - 1;
        const nodeIdxB = +matchResult[3] - 1;
        const constantValC = +matchResult[5];
        const comparisonOperator = matchResult[2];
        const arithmeticOperator = matchResult[4];

        const generatedEdges = edgeConstructionMap[comparisonOperator][arithmeticOperator](nodeIdxA, nodeIdxB, constantValC);

        if (comparisonOperator === '*' && arithmeticOperator === '+') {
            alternativeEdgeSets.push(generatedEdges[0]);
        } else {
            definiteEdges.push(...generatedEdges);
        }
    }

    let overallMaximumDistance = Number.NEGATIVE_INFINITY;

    for (const chosenAlternativeEdges of generateEdgeSelections(alternativeEdgeSets)) {
        const currentGraphEdges = [...definiteEdges, ...chosenAlternativeEdges];

        const nodeDistances = Array(nodeQuantity).fill(Number.POSITIVE_INFINITY);
        nodeDistances[0] = 0;

        for (let iteration = 0; iteration < nodeQuantity; ++iteration) {
            for (const [sourceNode, targetNode, edgeWeight] of currentGraphEdges) {
                if (nodeDistances[sourceNode] !== Number.POSITIVE_INFINITY &&
                    nodeDistances[sourceNode] + edgeWeight < nodeDistances[targetNode]) {
                    nodeDistances[targetNode] = nodeDistances[sourceNode] + edgeWeight;
                }
            }
        }

        if (nodeDistances[0] === 0) {
            const currentMaxDistance = Math.max(...nodeDistances);
            overallMaximumDistance = Math.max(overallMaximumDistance, currentMaxDistance);
        }
    }

    if (overallMaximumDistance === Number.POSITIVE_INFINITY) {
        displayOutput('inf');
    } else if (overallMaximumDistance === Number.NEGATIVE_INFINITY) {
        displayOutput(-1);
    } else {
        displayOutput(overallMaximumDistance);
    }
};

const inputHandler = new InputProcessor();

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    inputHandler.appendChunk(chunk);
});

process.stdin.on('end', () => {
    inputHandler.finalizeBuffer();
    solveGraphProblem();
});
