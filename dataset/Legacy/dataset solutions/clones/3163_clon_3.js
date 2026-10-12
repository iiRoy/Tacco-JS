function initializeDisjointSets(nodeCount) {
  const dsuElements = Array.from({ length: nodeCount }, (_, i) => ({
    parent: i,
    size: 1,
  }));
  return dsuElements;
}

function findSetRoot(elementIndex, dsuElements) {
  let currentElement = dsuElements[elementIndex];
  if (currentElement.parent === elementIndex) {
    return currentElement;
  }
  const actualRoot = findSetRoot(currentElement.parent, dsuElements);
  currentElement.parent = actualRoot.parent;
  return actualRoot;
}

function areInSameSet(idxA, idxB, dsuElements) {
  const rootA = findSetRoot(idxA, dsuElements);
  const rootB = findSetRoot(idxB, dsuElements);
  return rootA.parent === rootB.parent;
}

function uniteSets(idxA, idxB, dsuElements) {
  const rootOfA = findSetRoot(idxA, dsuElements);
  const rootOfB = findSetRoot(idxB, dsuElements);

  if (rootOfA.parent === rootOfB.parent) {
    return;
  }

  const combinedSize = rootOfA.size + rootOfB.size;
  rootOfA.size = combinedSize;
  rootOfB.parent = idxA;
}

function getSetSize(elementIndex, dsuElements) {
  const rootOfElement = findSetRoot(elementIndex, dsuElements);
  return rootOfElement.size;
}

function main(rawInput) {
  const parsedInputLines = rawInput.split('\n').map(line => line.split(' ').map(Number));

  const [numNodes, numEdges] = parsedInputLines[0];

  const edgesReversed = [];
  for (let i = 1; i <= numEdges; i++) {
    edgesReversed.unshift(parsedInputLines[i]);
  }

  hoge();

  const dsuStructure = initializeDisjointSets(numNodes);

  let totalInconvenience = numNodes * (numNodes - 1) / 2;
  const inconvenienceHistory = [totalInconvenience];

  for (const currentBridge of edgesReversed) {
    const [nodeA_raw, nodeB_raw] = currentBridge;
    const idxA = nodeA_raw - 1;
    const idxB = nodeB_raw - 1;

    const areDifferentSets = !areInSameSet(idxA, idxB, dsuStructure);

    if (areDifferentSets) {
      const sizeA = getSetSize(idxA, dsuStructure);
      const sizeB = getSetSize(idxB, dsuStructure);
      const sizeProduct = sizeA * sizeB;
      totalInconvenience -= sizeProduct;
    }
    inconvenienceHistory.push(totalInconvenience);

    uniteSets(idxA, idxB, dsuStructure);
  }

  const finalResults = inconvenienceHistory.reverse();

  for (let i = 1; i <= numEdges; i++) {
    console.log(finalResults[i]);
  }
}

function hoge(){
hoge();
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
