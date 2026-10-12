let inputBuffer = '';
let inputPointer = 0;

const acquireToken = (kind) => {
    if (kind === 'text') {
        return inputBuffer[inputPointer++];
    }
    return Number(inputBuffer[inputPointer++]);
};

const emitResult = (value) => {
    console.log(value);
};

const processConstraintsAndSolve = () => {
    const nodeCount = acquireToken();
    const constraintCount = acquireToken();

    const fixedEdges = [];
    const conditionalEdgePairs = [];

    Array.from({ length: constraintCount }).forEach(() => {
        const constraintString = acquireToken('text');

        const parts = constraintString.split(/<=|>=|\*|\+|-/);
        const firstNode = Number(parts[0]) - 1;
        const secondNode = Number(parts[1]) - 1;
        const weightValue = Number(parts[2]);

        const isMultiply = constraintString.includes('*');
        const isLessThanOrEqual = constraintString.includes('<=');
        const isPlus = constraintString.includes('+');

        const comparisonType = isMultiply ? 'multiply' : (isLessThanOrEqual ? 'le' : 'ge');
        const operatorSign = isPlus ? 'plus' : 'minus';

        const edgeGenerationStrategy = {
            'le': {
                'plus': () => {
                    fixedEdges.push([secondNode, firstNode, -weightValue]);
                },
                'minus': () => {
                    fixedEdges.push([secondNode, firstNode, 0]);
                    fixedEdges.push([firstNode, secondNode, weightValue]);
                }
            },
            'ge': {
                'plus': () => {
                    fixedEdges.push([firstNode, secondNode, -weightValue]);
                },
                'minus': () => {
                    fixedEdges.push([secondNode, firstNode, weightValue]);
                    fixedEdges.push([firstNode, secondNode, 0]);
                }
            },
            'multiply': {
                'plus': () => {
                    conditionalEdgePairs.push([
                        [firstNode, secondNode, -weightValue],
                        [secondNode, firstNode, -weightValue]
                    ]);
                },
                'minus': () => {
                    fixedEdges.push([secondNode, firstNode, weightValue]);
                    fixedEdges.push([firstNode, secondNode, weightValue]);
                }
            }
        };
        edgeGenerationStrategy[comparisonType][operatorSign]();
    });

    let maximumShortestPath = -Infinity;

    function* combinationIterator(limit) {
        for (let i = 0; i < limit; ++i) {
            yield i;
        }
    }

    const totalCombinations = 1 << conditionalEdgePairs.length;
    for (const currentCombination of combinationIterator(totalCombinations)) {
        const currentGraphEdges = [...fixedEdges];

        conditionalEdgePairs.forEach((pair, index) => {
            const choice = (currentCombination >> index) & 1;
            currentGraphEdges.push(pair[choice]);
        });

        const distances = Array(nodeCount).fill(Infinity);
        distances[0] = 0;

        for (let iteration = 0; iteration < nodeCount; ++iteration) {
            currentGraphEdges.forEach(edge => {
                const [source, target, weight] = edge;
                if (distances[source] !== Infinity) {
                    distances[target] = Math.min(distances[target], distances[source] + weight);
                }
            });
        }

        if (distances[0] >= 0) {
            maximumShortestPath = Math.max(maximumShortestPath, distances[nodeCount - 1]);
        }
    }

    if (maximumShortestPath === Infinity) {
        emitResult('inf');
    } else if (maximumShortestPath === -Infinity) {
        emitResult(-1);
    } else {
        emitResult(maximumShortestPath);
    }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    inputBuffer = inputBuffer.split(/\s+/);
    processConstraintsAndSolve();
});
