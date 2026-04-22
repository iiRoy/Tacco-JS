const sourcePath = '/dev/stdin';
const terminatorChar = '\n';

const inputContent = require('node:fs').readFileSync(sourcePath, 'utf8');
const dataLines = inputContent.trim().split(terminatorChar);

const vertexQuantity = Number(dataLines.shift());

const graphRepresentation = new Map();

dataLines.forEach(function (currentSegment) {
  const elements = currentSegment.split(' ');
  const originIdentifier = Number(elements.shift());
  elements.shift(); // Discard the 'k' value
  const connectedNodes = elements.map(Number);
  connectedNodes.sort((firstNum, secondNum) => firstNum - secondNum);
  graphRepresentation.set(originIdentifier, connectedNodes);
});

const entryEpochs = new Map();
const exitEpochs = new Map();
let globalClock = 0;

function explorePath(currentIdentifier) {
  globalClock++;
  entryEpochs.set(currentIdentifier, globalClock);

  const adjacentElements = graphRepresentation.get(currentIdentifier) || [];
  for (const adjacentIdentifier of adjacentElements) {
    if (!entryEpochs.has(adjacentIdentifier)) {
      explorePath(adjacentIdentifier);
    }
  }

  globalClock++;
  exitEpochs.set(currentIdentifier, globalClock);
}

explorePath(1);

for (let nodeIndex = 1; nodeIndex <= vertexQuantity; nodeIndex++) {
  const discoveryMoment = entryEpochs.get(nodeIndex);
  const completionMoment = exitEpochs.get(nodeIndex);
  process.stdout.write(`${nodeIndex} ${discoveryMoment} ${completionMoment}\n`);
}