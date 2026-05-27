const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = sourceData.trim().split('\n');
const nodeCount = Number(lines.shift());
const adjacencyList = lines.map((lineStr) => lineStr.split(' ').map(Number));

const nodeRegistry = Array.from({ length: nodeCount }, (_, idx) => ({
  identifier: idx,
  childIdentifiers: [],
  parentIdentifier: -1,
  currentDepth: 0,
  kind: '',
}));

adjacencyList.forEach(([parentNodeId, numChildren, ...childIdList]) => {
  nodeRegistry[parentNodeId].childIdentifiers = childIdList;
  childIdList.forEach((childId) => {
    nodeRegistry[childId].parentIdentifier = parentNodeId;
  });
});

let rootNodeIdentifier = -1;
for (let i = 0; i < nodeCount; i++) {
  if (nodeRegistry[i].parentIdentifier === -1) {
    rootNodeIdentifier = i;
    break;
  }
}

const processingQueue = [];
processingQueue.push(rootNodeIdentifier);
nodeRegistry[rootNodeIdentifier].currentDepth = 0;

let head = 0;
while (head < processingQueue.length) {
  const currentIdentifier = processingQueue[head++];
  const currentDepthValue = nodeRegistry[currentIdentifier].currentDepth;

  nodeRegistry[currentIdentifier].childIdentifiers.forEach((childId) => {
    nodeRegistry[childId].currentDepth = currentDepthValue + 1;
    processingQueue.push(childId);
  });
}

for (let i = 0; i < nodeCount; i++) {
  const currentEntry = nodeRegistry[i];
  if (currentEntry.parentIdentifier === -1) {
    currentEntry.kind = 'root';
  } else if (currentEntry.childIdentifiers.length > 0) {
    currentEntry.kind = 'internal node';
  } else {
    currentEntry.kind = 'leaf';
  }
}

for (let i = 0; i < nodeCount; i++) {
  const entry = nodeRegistry[i];
  const parentOutput = 'parent = ' + (entry.parentIdentifier !== -1 ? entry.parentIdentifier : -1);
  const depthOutput = 'depth = ' + entry.currentDepth;
  const typeOutput = entry.kind;
  const childrenOutput = '[' + entry.childIdentifiers.join(', ') + ']';

  console.log(
    'node ' +
      entry.identifier +
      ': ' +
      [parentOutput, depthOutput, typeOutput, childrenOutput].join(', ')
  );
}
