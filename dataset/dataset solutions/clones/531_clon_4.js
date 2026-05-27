let rawInputBuffer = '';
let readPointer = 0;

function scan(dataType) {
    if (dataType === 'string') {
        return rawInputBuffer[readPointer++];
    } else {
        return +rawInputBuffer[readPointer++];
    }
}

function print(valueToOutput) {
    console.log(valueToOutput);
}

function executeProgram() {
    const nodeCount = scan();
    const constraintCount = scan();

    const directEdges = [];
    const conditionalEdgePairs = [];

    const parseConstraintString = (constraintStr) => {
        const originalSplit = constraintStr.split(/<=|>=|\*|\+|-/);
        const p0 = +originalSplit[0] - 1;
        const p1 = +originalSplit[1] - 1;
        const p2 = +originalSplit[2];

        const opType1 = constraintStr.includes('*') ? 2 : (constraintStr.includes('<=') ? 0 : 1);
        const opType2 = constraintStr.includes('+') ? 0 : 1;

        return { p0, p1, p2, opType1, opType2 };
    };

    Array.from({ length: constraintCount }).forEach(() => {
        const constraintData = parseConstraintString(scan('string'));
        const { p0, p1, p2, opType1, opType2 } = constraintData;

        const opType1Handlers = {
            0: { // opType1 (u) == 0 (<=)
                0: () => { // opType2 (v) == 0 (+)
                    directEdges.push([p1, p0, -p2]);
                },
                1: () => { // opType2 (v) == 1 (-)
                    directEdges.push([p1, p0, 0]);
                    directEdges.push([p0, p1, p2]);
                }
            },
            1: { // opType1 (u) == 1 (>=)
                0: () => { // opType2 (v) == 0 (+)
                    directEdges.push([p0, p1, -p2]);
                },
                1: () => { // opType2 (v) == 1 (-)
                    directEdges.push([p1, p0, p2]);
                    directEdges.push([p0, p1, 0]);
                }
            },
            2: { // opType1 (u) == 2 (*)
                0: () => { // opType2 (v) == 0 (+)
                    conditionalEdgePairs.push([[p0, p1, -p2], [p1, p0, -p2]]);
                },
                1: () => { // opType2 (v) == 1 (-)
                    directEdges.push([p1, p0, p2]);
                    directEdges.push([p0, p1, p2]);
                }
            }
        };
        opType1Handlers[opType1][opType2]();
    });

    Array.from({ length: nodeCount }).forEach((_, i) => {
        directEdges.push([i, 0, 0]);
    });

    let overallMaxDistance = -Infinity;

    const exploreCombinations = (index, currentEdgesForCombination) => {
        if (index === conditionalEdgePairs.length) {
            const combinedGraphEdges = [...directEdges, ...currentEdgesForCombination];

            const distances = Array(nodeCount).fill(Infinity);
            distances[0] = 0;

            for (let iteration = 0; iteration < nodeCount; ++iteration) {
                for (const edge of combinedGraphEdges) {
                    const [source, destination, weight] = edge;
                    if (distances[source] !== Infinity && distances[source] + weight < distances[destination]) {
                        distances[destination] = distances[source] + weight;
                    }
                }
            }

            if (distances[0] >= 0) {
                overallMaxDistance = Math.max(overallMaxDistance, distances[nodeCount - 1]);
            }
            return;
        }

        const [optionA, optionB] = conditionalEdgePairs[index];

        exploreCombinations(index + 1, [...currentEdgesForCombination, optionA]);
        exploreCombinations(index + 1, [...currentEdgesForCombination, optionB]);
    };

    exploreCombinations(0, []);

    if (overallMaxDistance === Infinity) {
        print('inf');
    } else if (overallMaxDistance === -Infinity) {
        print(-1);
    } else {
        print(overallMaxDistance);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    rawInputBuffer += chunk;
});

process.stdin.on('end', () => {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    executeProgram();
});
