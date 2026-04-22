let systemSettings = {
  dataFile: '/dev/stdin',
  lineBreakChar: '\n'
};

let dataRecords = require('fs').readFileSync(systemSettings.dataFile, 'ascii')
  .trim()
  .split(systemSettings.lineBreakChar);

dataRecords.shift();

const nodeCollection = {};

for (let recIdx in dataRecords) {
  let lineParts = dataRecords[recIdx].split(' ');
  nodeCollection[lineParts[0]] = {
    leftRef: lineParts[1],
    rightRef: lineParts[2],
    isPrimary: true
  };
}

for (let recIdx in nodeCollection) {
  const currentEntry = nodeCollection[recIdx];
  if (currentEntry.leftRef !== 'NO_CHILD') {
    nodeCollection[currentEntry.leftRef].isPrimary = false;
  }
  if (currentEntry.rightRef !== 'NO_CHILD') {
    nodeCollection[currentEntry.rightRef].isPrimary = false;
  }
}

let masterNodeKey = null;
for (let recIdx in nodeCollection)
  if (nodeCollection[recIdx].isPrimary) masterNodeKey = recIdx;


function performPreOrderTraversal(nodeIdentifier) {
  const currentNodeData = nodeCollection[nodeIdentifier];
  const leftLinkRef = currentNodeData.leftRef;
  const rightLinkRef = currentNodeData.rightRef;
  let traversalPath = [nodeIdentifier];
  if (leftLinkRef !== 'NO_CHILD') {
    traversalPath = traversalPath.concat(performPreOrderTraversal(leftLinkRef));
  }
  if (rightLinkRef !== 'NO_CHILD') {
    traversalPath = traversalPath.concat(performPreOrderTraversal(rightLinkRef));
  }
  return traversalPath;
}

console.log('Preorder Walk');
console.log(' ' + performPreOrderTraversal(masterNodeKey).join(' '));

function performInOrderTraversal(nodeIdentifier) {
  const currentNodeData = nodeCollection[nodeIdentifier];
  const leftLinkRef = currentNodeData.leftRef;
  const rightLinkRef = currentNodeData.rightRef;
  let traversalPath = [];
  if (leftLinkRef !== 'NO_CHILD') {
    traversalPath = traversalPath.concat(performInOrderTraversal(leftLinkRef));
  }
  traversalPath.push(nodeIdentifier);
  if (rightLinkRef !== 'NO_CHILD') {
    traversalPath = traversalPath.concat(performInOrderTraversal(rightLinkRef));
  }
  return traversalPath;
}

console.log('Inorder Walk');
console.log(' ' + performInOrderTraversal(masterNodeKey).join(' '));

function performPostOrderTraversal(nodeIdentifier) {
  const currentNodeData = nodeCollection[nodeIdentifier];
  const leftLinkRef = currentNodeData.leftRef;
  const rightLinkRef = currentNodeData.rightRef;
  let traversalPath = [];
  if (leftLinkRef !== 'NO_CHILD') {
    traversalPath = traversalPath.concat(performPostOrderTraversal(leftLinkRef));
  }
  if (rightLinkRef !== 'NO_CHILD') {
    traversalPath = traversalPath.concat(performPostOrderTraversal(rightLinkRef));
  }
  traversalPath.push(nodeIdentifier);
  return traversalPath;
}

console.log('Postorder Walk');
console.log(' ' + performPostOrderTraversal(masterNodeKey).join(' '));