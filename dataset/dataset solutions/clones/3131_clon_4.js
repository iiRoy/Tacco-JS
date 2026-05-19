const fs = require('fs');

let inputTokens = [];
let tokenIndex = 0;

async function readAllInput() {
    return new Promise((resolve, reject) => {
        fs.readFile('/dev/stdin', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function initializeInputProcessor() {
    const rawInputString = await readAllInput();
    inputTokens = rawInputString.split(/\s+/).filter(Boolean);
    tokenIndex = 0;
}

function fetchNextToken() {
    if (tokenIndex >= inputTokens.length) {
        throw new Error("Input exhausted.");
    }
    return inputTokens[tokenIndex++];
}

function retrieveNumericValue() {
    return parseInt(fetchNextToken(), 10);
}

function countBitDifferences(val1, val2, maxBits) {
    let differenceCount = 0;
    for (let bitPosition = 0; bitPosition < maxBits; bitPosition++) {
        if (((val1 >> bitPosition) & 1) !== ((val2 >> bitPosition) & 1)) {
            differenceCount++;
        }
    }
    return differenceCount;
}

function generateReflectedGrayCode(depth, initialConfig, finalConfig) {
    if (depth === 0) {
        return [0];
    }

    const priorSequence = generateReflectedGrayCode(
        depth - 1,
        initialConfig & ((1 << (depth - 1)) - 1),
        finalConfig & ((1 << (depth - 1)) - 1)
    );

    let baseSegment = [...priorSequence];
    if (((initialConfig >> (depth - 1)) & 1) !== ((finalConfig >> (depth - 1)) & 1)) {
        baseSegment.reverse();
    }

    const reflectedSegment = baseSegment.map(value => value | (1 << (depth - 1)));
    reflectedSegment.reverse();

    return baseSegment.concat(reflectedSegment);
}

async function executeMainLogic() {
    await initializeInputProcessor();

    const bitDimension = retrieveNumericValue();
    const startNode = retrieveNumericValue();
    const endNode = retrieveNumericValue();

    if (countBitDifferences(startNode, endNode, bitDimension) !== 1) {
        console.log("NO");
        return;
    }

    const grayPathSequence = generateReflectedGrayCode(bitDimension, startNode, endNode);

    const startNodeIndex = grayPathSequence.indexOf(startNode);
    const pathLength = grayPathSequence.length;

    const getNextInCycle = (idx) => (idx + 1) % pathLength;
    const getPreviousInCycle = (idx) => (idx - 1 + pathLength) % pathLength;

    const nextAdjacentNode = grayPathSequence[getNextInCycle(startNodeIndex)];
    const previousAdjacentNode = grayPathSequence[getPreviousInCycle(startNodeIndex)];

    let resultPath = [];

    if (nextAdjacentNode === endNode) {
        let currentTraversalIndex = startNodeIndex;
        while (currentTraversalIndex !== getNextInCycle(startNodeIndex)) {
            resultPath.push(grayPathSequence[currentTraversalIndex]);
            currentTraversalIndex = getPreviousInCycle(currentTraversalIndex);
        }
        resultPath.push(endNode);
        console.log("YES");
        console.log(resultPath.join(" "));
    } else if (previousAdjacentNode === endNode) {
        let currentTraversalIndex = startNodeIndex;
        while (currentTraversalIndex !== getPreviousInCycle(startNodeIndex)) {
            resultPath.push(grayPathSequence[currentTraversalIndex]);
            currentTraversalIndex = getNextInCycle(currentTraversalIndex);
        }
        resultPath.push(endNode);
        console.log("YES");
        console.log(resultPath.join(" "));
    } else {
        console.log("NO");
    }
}

executeMainLogic();
