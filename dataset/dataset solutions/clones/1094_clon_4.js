class NodeElement {
  constructor(dataValue) {
    this.dataValue = dataValue;
    this.leftElement = null;
    this.rightElement = null;
  }
}

let inOrderIndexMap;

function reconstructStructure(preSequence, inSequence) {
  inOrderIndexMap = new Map();
  for (let k = 0; k < inSequence.length; k++) {
    inOrderIndexMap.set(inSequence[k], k);
  }

  function buildSubtree(preStart, preEnd, inStart, inEnd) {
    if (preStart > preEnd || inStart > inEnd) {
      return null;
    }

    let currentRootValue = preSequence[preStart];
    let currentRoot = new NodeElement(currentRootValue);

    let inRootIdx = inOrderIndexMap.get(currentRootValue);
    let leftSubtreeSize = inRootIdx - inStart;

    currentRoot.leftElement = buildSubtree(
      preStart + 1,
      preStart + leftSubtreeSize,
      inStart,
      inRootIdx - 1
    );

    currentRoot.rightElement = buildSubtree(
      preStart + leftSubtreeSize + 1,
      preEnd,
      inRootIdx + 1,
      inEnd
    );

    return currentRoot;
  }

  return buildSubtree(0, preSequence.length - 1, 0, inSequence.length - 1);
}

function obtainTailOrder(rootNode) {
  let outputList = [];
  if (!rootNode) {
    return outputList;
  }

  let stackA = [];
  let stackB = [];

  stackA.push(rootNode);

  while (stackA.length > 0) {
    let currentElement = stackA.pop();
    stackB.push(currentElement.dataValue);

    if (currentElement.leftElement) {
      stackA.push(currentElement.leftElement);
    }
    if (currentElement.rightElement) {
      stackA.push(currentElement.rightElement);
    }
  }

  while (stackB.length > 0) {
    outputList.push(stackB.pop());
  }

  return outputList;
}

(function primaryOperation(){
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalNodes = Number(inputData.shift());
  const initialOrder = inputData.shift().split(' ').map(Number);
  const centralOrder = inputData.shift().split(' ').map(Number);

  let constructedRoot = reconstructStructure(initialOrder, centralOrder);
  console.log(obtainTailOrder(constructedRoot).join(' '));
})();