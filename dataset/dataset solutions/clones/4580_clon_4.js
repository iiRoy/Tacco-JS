const inputRaw = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = inputRaw.split('\n');

const configData = lineSegments[0].split(' ').map(Number);
const numberOfVertices = configData[0];
const numberOfEdges = configData[1];

const initialDegreeMatrix = Array.from({ length: numberOfVertices }, () => 0);

const edgeDefinitions = lineSegments.slice(1, numberOfEdges + 1);

const finalDegreeMatrix = edgeDefinitions.reduce((currentMatrix, edgeSpec) => {
    const connectedVertices = edgeSpec.split(' ').map(Number);
    const vertexA = connectedVertices[0] - 1;
    const vertexB = connectedVertices[1] - 1;

    const nextMatrix = [...currentMatrix];

    nextMatrix[vertexA]++;
    nextMatrix[vertexB]++;

    return nextMatrix;
}, initialDegreeMatrix);

process.stdout.write(finalDegreeMatrix.join('\n') + '\n');