const grabContent = require('node:fs').readFileSync(require('node:process').stdin.fd, 'utf8');
const allLines = grabContent.trim().split('\n');
const dimension = parseInt(allLines[0], 10);
const adjacencyData = allLines.slice(1);

const graphRepresent = Array.from({ length: dimension }, () => Array.from({ length: dimension }, () => 0));

const populatedGraph = adjacencyData.reduce((currentMatrix, lineDescription) => {
    const numericParts = lineDescription.split(' ').map(Number);
    const originNode = numericParts[0];
    const connectedTargets = numericParts.slice(2);

    connectedTargets.forEach(destNode => {
        currentMatrix[originNode - 1][destNode - 1] = 1;
    });
    return currentMatrix;
}, graphRepresent);

const outputString = populatedGraph.map(rowVector => rowVector.join(' ')).join('\n');
console.log(outputString);