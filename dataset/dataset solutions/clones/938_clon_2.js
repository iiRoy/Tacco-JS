let cfg = {
    sourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const fileSystem = require('fs');
let inputLines = fileSystem.readFileSync(cfg.sourcePath, 'ascii')
    .trim()
    .split(cfg.lineSeparator);

let nodeCount = Number(inputLines.shift());

let adjacencyMap = {};

for (let currentLineIndex in inputLines) {
    let temporaryArray = inputLines[currentLineIndex].split(' ');
    let sourceNodeIdentifier = temporaryArray.shift();
    temporaryArray.shift();
    adjacencyMap[sourceNodeIdentifier] = temporaryArray;
}

for (let rowNodeId = 1; rowNodeId <= nodeCount; rowNodeId++) {
    let outputRow = [];
    for (let colNodeId = 1; colNodeId <= nodeCount; colNodeId++) {
        if (adjacencyMap[rowNodeId].indexOf(String(colNodeId)) !== -1) {
            outputRow.push(1);
        } else {
            outputRow.push(0);
        }
    }
    console.log(outputRow.join(' '));
}
