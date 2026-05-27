function performPostorderTraversal(rootNode) {
  const resultCollector = [];
  if (!rootNode) {
    return resultCollector;
  }

  const processingStack = [];
  const outputStack = [];

  processingStack.push(rootNode);

  while (processingStack.length > 0) {
    const currentElement = processingStack.pop();
    outputStack.push(currentElement);

    if (currentElement.left) {
      processingStack.push(currentElement.left);
    }
    if (currentElement.right) {
      processingStack.push(currentElement.right);
    }
  }

  while (outputStack.length > 0) {
    resultCollector.push(outputStack.pop().val);
  }

  return resultCollector;
}

function constructTreeFromTraversals(preOrderSequence, inOrderSequence) {
  if (!preOrderSequence || preOrderSequence.length === 0 || !inOrderSequence || inOrderSequence.length === 0) {
    return null;
  }

  const inOrderValueToIndexMap = new Map();
  for (let i = 0; i < inOrderSequence.length; i++) {
    inOrderValueToIndexMap.set(inOrderSequence[i], i);
  }

  function buildSubtreeRecursively(preStartIdx, preEndIdx, inStartIdx, inEndIdx) {
    if (preStartIdx > preEndIdx || inStartIdx > inEndIdx) {
      return null;
    }

    const currentRootValue = preOrderSequence[preStartIdx];
    const currentRootNode = { val: currentRootValue, left: null, right: null };

    const rootInOrderIndex = inOrderValueToIndexMap.get(currentRootValue);

    const leftSubtreeLength = rootInOrderIndex - inStartIdx;

    currentRootNode.left = buildSubtreeRecursively(
      preStartIdx + 1,
      preStartIdx + leftSubtreeLength,
      inStartIdx,
      rootInOrderIndex - 1
    );

    currentRootNode.right = buildSubtreeRecursively(
      preStartIdx + leftSubtreeLength + 1,
      preEndIdx,
      rootInOrderIndex + 1,
      inEndIdx
    );

    return currentRootNode;
  }

  return buildSubtreeRecursively(0, preOrderSequence.length - 1, 0, inOrderSequence.length - 1);
}

(function mainExecutionBlock() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const nodeCount = Number(inputLines.shift());
  const preOrderTraversal = inputLines.shift().split(' ').map(Number);
  const inOrderTraversal = inputLines.shift().split(' ').map(Number);

  const reconstructedTreeRoot = constructTreeFromTraversals(preOrderTraversal, inOrderTraversal);

  const postOrderResult = performPostorderTraversal(reconstructedTreeRoot);

  console.log(postOrderResult.join(' '));
})();
