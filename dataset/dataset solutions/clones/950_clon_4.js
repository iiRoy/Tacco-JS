(function graphProcessor() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const inputLines = fileContent.split('\n');

  const extractNumericPair = () => inputLines.shift().split(' ').map(Number);

  const [nodeQuantity, connectionCount] = extractNumericPair();

  const componentRoots = Array.from({ length: nodeQuantity }, (_, idx) => idx);
  const componentSizes = Array.from({ length: nodeQuantity }, () => 1);

  function locateRoot(elementIndex) {
    if (componentRoots[elementIndex] === elementIndex) {
      return elementIndex;
    }
    componentRoots[elementIndex] = locateRoot(componentRoots[elementIndex]);
    return componentRoots[elementIndex];
  }

  function unifySets(firstElement, secondElement) {
    let rootA = locateRoot(firstElement);
    let rootB = locateRoot(secondElement);

    if (rootA !== rootB) {
      if (componentSizes[rootA] < componentSizes[rootB]) {
        [rootA, rootB] = [rootB, rootA];
      }
      componentRoots[rootB] = rootA;
      componentSizes[rootA] += componentSizes[rootB];
      return true;
    }
    return false;
  }

  for (let k = 0; k < connectionCount; k++) {
    const [nodeOne, nodeTwo] = extractNumericPair();
    unifySets(nodeOne, nodeTwo);
  }

  inputLines.shift();

  const outcomeList = [];
  for (const queryEntry of inputLines) {
    const [queryOrigin, queryTarget] = queryEntry.split(' ').map(Number);
    const areConnected = locateRoot(queryOrigin) === locateRoot(queryTarget);
    outcomeList.push(areConnected ? 'yes' : 'no');
  }

  console.log(outcomeList.join('\n'));
})();
