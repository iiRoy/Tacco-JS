const filesystem = require('fs');
const entireInput = filesystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = entireInput.split('\n');

function checkAcyclic(totalNodes, connectionDetails) {
    const inDegrees = new Array(totalNodes).fill(0);
    const queueForZeroInDegree = [];
    let processedNodeCount = 0;

    for (let u = 0; u < totalNodes; u++) {
        if (connectionDetails.has(u)) {
            for (const v of connectionDetails.get(u)) {
                inDegrees[v]++;
            }
        }
    }

    for (let u = 0; u < totalNodes; u++) {
        if (inDegrees[u] === 0) {
            queueForZeroInDegree.push(u);
        }
    }

    while (queueForZeroInDegree.length > 0) {
        const currentVertex = queueForZeroInDegree.shift();
        processedNodeCount++;

        if (connectionDetails.has(currentVertex)) {
            for (const neighborVertex of connectionDetails.get(currentVertex)) {
                inDegrees[neighborVertex]--;
                if (inDegrees[neighborVertex] === 0) {
                    queueForZeroInDegree.push(neighborVertex);
                }
            }
        }
    }

    return processedNodeCount === totalNodes;
}

let currentLineIndex = 0;

while (processedLines[currentLineIndex] !== '0') {
    const totalNodes = parseInt(processedLines[currentLineIndex++], 10);
    const wordList = [];
    for (let i = 0; i < totalNodes; i++) {
        wordList.push(processedLines[currentLineIndex++]);
    }

    const connectionDetails = new Map();

    for (let i = 0; i < totalNodes; i++) {
        const lastCharOfCurrentWord = wordList[i][wordList[i].length - 1];
        for (let j = 0; j < totalNodes; j++) {
            if (i === j) {
                continue;
            }
            const firstCharOfOtherWord = wordList[j][0];
            if (lastCharOfCurrentWord === firstCharOfOtherWord) {
                if (!connectionDetails.has(i)) {
                    connectionDetails.set(i, new Set());
                }
                connectionDetails.get(i).add(j);
            }
        }
    }

    const isAcyclic = checkAcyclic(totalNodes, connectionDetails);
    console.log(isAcyclic ? 'NG' : 'OK');
}