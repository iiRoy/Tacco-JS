const fileSystemAccess = require('fs');
const entryPoint = '/dev/stdin';
const lineSeparator = '\n';

const entireContent = fileSystemAccess.readFileSync(entryPoint, 'utf8').trim();
const contentLines = entireContent.split(lineSeparator);

const dimensionString = contentLines.shift();
const graphDimension = parseInt(dimensionString, 10);

const graphStructure = new Map();

contentLines.forEach(function(currentDescription) {
    const segmentArray = currentDescription.split(' ');
    const sourceNodeIdentifier = segmentArray[0];
    const destinationNodeIdentifiers = segmentArray.slice(2);
    graphStructure.set(sourceNodeIdentifier, new Set(destinationNodeIdentifiers));
});

const adjacencySchema = Array.from({ length: graphDimension }, function(_, verticalIndex) {
    const currentSourceId = String(verticalIndex + 1);
    const outgoingConnections = graphStructure.get(currentSourceId) || new Set();

    return Array.from({ length: graphDimension }, function(_, horizontalIndex) {
        const targetId = String(horizontalIndex + 1);
        return outgoingConnections.has(targetId) ? 1 : 0;
    });
});

adjacencySchema.forEach(function(matrixRow) {
    process.stdout.write(matrixRow.join(' ') + lineSeparator);
});