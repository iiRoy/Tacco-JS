(function(inputData) {
  const rawLines = inputData.trim().split('\n');

  const [nodeCount, edgeCount] = rawLines.shift().split(' ').map(Number);

  const representative = Array(nodeCount).fill(0).map((_, idx) => idx);
  const componentSize = Array(nodeCount).fill(1);

  const locateRoot = (elementIndex) => {
    if (representative[elementIndex] === elementIndex) {
      return elementIndex;
    }
    representative[elementIndex] = locateRoot(representative[elementIndex]);
    return representative[elementIndex];
  };

  const mergeSets = (firstElement, secondElement) => {
    let rootA = locateRoot(firstElement);
    let rootB = locateRoot(secondElement);

    if (rootA !== rootB) {
      if (componentSize[rootA] < componentSize[rootB]) {
        [rootA, rootB] = [rootB, rootA];
      }
      representative[rootB] = rootA;
      componentSize[rootA] += componentSize[rootB];
      return true;
    }
    return false;
  };

  for (let k = 0; k < edgeCount; k++) {
    const [u, v] = rawLines.shift().split(' ').map(Number);
    mergeSets(u, v);
  }

  const queryCount = parseInt(rawLines.shift(), 10);

  rawLines.forEach(queryLine => {
    const [node1, node2] = queryLine.split(' ').map(Number);
    if (locateRoot(node1) === locateRoot(node2)) {
      console.log('yes');
    } else {
      console.log('no');
    }
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
