const sourceConfig = { input: '/dev/stdin', newline: '\n' };

const fileContent = require('fs').readFileSync(sourceConfig.input, 'ascii').trim();
const inputLines = fileContent.split(sourceConfig.newline);

const nodeCount = Number(inputLines.shift());

const connectionRegistry = inputLines.reduce((accumulator, currentLine) => {
    const [sourceIdentifier, , ...neighborIdentifiers] = currentLine.split(' ');
    const sourceNode = Number(sourceIdentifier);
    const neighborSet = new Set(neighborIdentifiers.map(Number));
    accumulator.set(sourceNode, neighborSet);
    return accumulator;
}, new Map());

const adjacencyMatrixRows = Array.from({ length: nodeCount }, (_, rowIndex) => {
    const currentSourceNode = rowIndex + 1;
    const currentNeighbors = connectionRegistry.get(currentSourceNode);

    return Array.from({ length: nodeCount }, (_, colIndex) => {
        const currentTargetNode = colIndex + 1;
        return currentNeighbors.has(currentTargetNode) ? 1 : 0;
    }).join(' ');
});

adjacencyMatrixRows.forEach(rowOutput => console.log(rowOutput));
