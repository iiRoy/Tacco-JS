const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineBuffer = dataStream.trim().split("\n");

let currentLineIndex = 0;
const outputCollector = [];

function processGameBlock() {
    const dimensionsLine = lineBuffer[currentLineIndex++];
    if (dimensionsLine === "0 0") {
        console.log(outputCollector.join('\n'));
        return;
    }

    const parsedDims = dimensionsLine.split(" ").map(Number);
    const rowCount = parsedDims[0];
    const colCount = parsedDims[1];

    const playerScores = [];
    for (let cIdx = 0; cIdx < colCount; cIdx++) {
        playerScores.push([0, cIdx + 1]);
    }

    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
        const rowData = lineBuffer[currentLineIndex++].split(" ").map(Number);
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
            playerScores[cIdx][0] += rowData[cIdx];
        }
    }

    playerScores.sort((entityA, entityB) => {
        const sumA = entityA[0];
        const sumB = entityB[0];
        return sumB - sumA; // Descending order of sum
    });

    const resultOrder = playerScores.map(entity => entity[1]);

    outputCollector.push(resultOrder.join(" "));

    processGameBlock();
}

processGameBlock();