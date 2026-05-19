const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawContent.trim().split("\n");

const dimension = Number(lineSegments.shift());

const adjacencyMatrix = Array.from({ length: dimension }, () => Array(dimension).fill(0));

lineSegments.forEach(currentLine => {
    const [sourceNodeIdentifier, , ...targetNodeIdentifiers] = currentLine.split(" ").map(Number);

    targetNodeIdentifiers.forEach(targetNodeIdentifier => {
        adjacencyMatrix[sourceNodeIdentifier - 1][targetNodeIdentifier - 1] = 1;
    });
});

console.log(adjacencyMatrix.map(row => row.join(" ")).join("\n"));
