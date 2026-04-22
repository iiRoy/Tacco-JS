const graphSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = graphSource.trim().split('\n');
const vertexCount = Number(lineSegments[0]);

const connectedPaths = Array.prototype.slice.call(lineSegments, 1).reduce((accumulatedConnections, currentLine) => {
    const numericParts = currentLine.split(' ').map(Number);
    const originNode = numericParts[0] - 1;
    const destinations = numericParts.slice(2);

    if (!accumulatedConnections.has(originNode)) {
        accumulatedConnections.set(originNode, new Set());
    }
    destinations.forEach(targetNode => accumulatedConnections.get(originNode).add(targetNode - 1));
    return accumulatedConnections;
}, new Map());

const finalMatrix = Array.from({ length: vertexCount }, (_, rowIdx) =>
    Array.from({ length: vertexCount }, (_, colIdx) => {
        const rowConnections = connectedPaths.get(rowIdx);
        return (rowConnections && rowConnections.has(colIdx)) ? 1 : 0;
    })
);

const matrixOutput = finalMatrix.map(row => row.join(' ')).join('\n');

console.log(matrixOutput);