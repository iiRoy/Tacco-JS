let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineData = (rawData.trim()).split("\n");

let matrixSize = lineData.shift() - 0;

let adjacencyMatrix = [];

for (let rowIdx = 0; rowIdx < matrixSize; rowIdx++) {
    adjacencyMatrix[rowIdx] = [];
    for (let colIdx = 0; colIdx < matrixSize; colIdx++) {
        adjacencyMatrix[rowIdx][colIdx] = 0;
    }
}

for (let rowIdx = 0; rowIdx < matrixSize; rowIdx++) {
    const currentLineParts = lineData.shift().split(" ").map(Number);
    const sourceNode = currentLineParts.shift();
    currentLineParts.shift();
    currentLineParts.forEach(function(targetNode) {
        adjacencyMatrix[sourceNode - 1][targetNode - 1] = 1;
    });
}

console.log(adjacencyMatrix.join("\n").replace(/,/g, " "));
