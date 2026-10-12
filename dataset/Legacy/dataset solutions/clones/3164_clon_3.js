function createComponent(index) {
  return {
    parent: index,
    size: 1,
  };
}

function initializeDisjointSets(numNodes) {
  return Array.from({ length: numNodes }, (_, i) => createComponent(i));
}

function findRoot(nodeIndex, components) {
  let path = [];
  let currentIdx = nodeIndex;

  while (components[currentIdx].parent !== currentIdx) {
    path.push(currentIdx);
    currentIdx = components[currentIdx].parent;
  }

  const rootNodeObject = components[currentIdx];

  for (let i = 0; i < path.length; i++) {
    components[path[i]].parent = currentIdx;
  }
  return rootNodeObject;
}

function areConnected(idxA, idxB, components) {
  const rootB = findRoot(idxB, components);
  const rootA = findRoot(idxA, components);
  return (rootB === rootA);
}

function uniteComponents(idxA, idxB, components) {
  if (areConnected(idxA, idxB, components)) {
    return;
  }

  const rootA = findRoot(idxA, components);
  const rootB = findRoot(idxB, components);

  rootA.size += rootB.size;
  rootB.parent = idxA;
}

function getComponentSize(nodeIndex, components) {
  const componentRoot = findRoot(nodeIndex, components);
  return componentRoot.size;
}

function calculateTotalPairs(n) {
  return n * (n - 1) / 2;
}

function solveProblem(inputString) {
  const lines = inputString.split('\n');
  const firstLine = lines[0].split(' ').map(Number);
  const numNodes = firstLine[0];
  const numEdges = firstLine[1];

  const edgesReversed = lines.slice(1, 1 + numEdges)
                              .map(line => line.split(' ').map(Number))
                              .reverse();

  let components = initializeDisjointSets(numNodes);

  let totalInconvenience = calculateTotalPairs(numNodes);
  const inconvenienceSnapshots = [totalInconvenience];

  for (const currentEdge of edgesReversed) {
    const nodeAIndex = currentEdge[0] - 1;
    const nodeBIndex = currentEdge[1] - 1;

    if (!areConnected(nodeAIndex, nodeBIndex, components)) {
      const sizeA = getComponentSize(nodeAIndex, components);
      const sizeB = getComponentSize(nodeBIndex, components);
      const inconvenienceReduction = sizeA * sizeB;
      totalInconvenience -= inconvenienceReduction;
    }
    
    inconvenienceSnapshots.push(totalInconvenience);

    uniteComponents(nodeAIndex, nodeBIndex, components);
  }

  const finalResults = inconvenienceSnapshots.reverse();

  for (let i = 1; i <= numEdges; i++) {
    console.log(finalResults[i]);
  }
}

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
