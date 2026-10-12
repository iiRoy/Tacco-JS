'use strict';

const MAX_VAL = 900719925474099;
function parseNumbers(lineText) {
    return lineText.split(' ').map((val) => parseInt(val, 10));
}

function solveGraphProblem(rawInput) {
    let inputLines = rawInput.trim().split('\n');
    let parsedLine = parseNumbers(inputLines[0]);
    let nodeCount = parsedLine[0];
    let edgeCount = parsedLine[1];

    let connectionMap = Array.from({ length: nodeCount }, () => []);

    let lineIndex;
    for (lineIndex = 1; lineIndex <= edgeCount; lineIndex++) {
        parsedLine = parseNumbers(inputLines[lineIndex]);
        connectionMap[parsedLine[0] - 1].push(parsedLine[1] - 1);
    }

    parsedLine = parseNumbers(inputLines[edgeCount + 1]);
    let startVertex = parsedLine[0] - 1;
    let endVertex = parsedLine[1] - 1;

    let minPathLengths = Array.from({ length: nodeCount }, () => Array(3).fill(MAX_VAL));

    let bfsQueue = [];

    minPathLengths[startVertex][0] = 0;
    bfsQueue.push([startVertex, 0, 0]);

    let shortestPathToTarget = MAX_VAL;

    let queuePointer = 0;
    while (queuePointer < bfsQueue.length) {
        let [currentVertex, currentLength, currentMod] = bfsQueue[queuePointer++];

        if (currentLength > minPathLengths[currentVertex][currentMod]) {
            continue;
        }

        if (currentVertex === endVertex && currentMod === 0) {
            shortestPathToTarget = currentLength;
            break;
        }

        for (let neighborVertex of connectionMap[currentVertex]) {
            let nextLength = currentLength + 1;
            let nextMod = nextLength % 3;

            if (nextLength < minPathLengths[neighborVertex][nextMod]) {
                minPathLengths[neighborVertex][nextMod] = nextLength;
                bfsQueue.push([neighborVertex, nextLength, nextMod]);
            }
        }
    }

    if (shortestPathToTarget !== MAX_VAL) {
        console.log(shortestPathToTarget / 3);
    } else {
        console.log(-1);
    }
}

solveGraphProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
