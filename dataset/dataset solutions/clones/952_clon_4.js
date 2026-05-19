(function entryPoint() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const [nodeCount, edgeCount] = inputLines.shift().split(' ').map(Number);

  const connectionMap = Array.from({ length: nodeCount }, () => []);

  let currentSource, currentDestination;
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    [currentSource, currentDestination] = inputLines.shift().split(' ').map(Number);
    connectionMap[currentSource].push(currentDestination);
    connectionMap[currentDestination].push(currentSource);
  }

  function pathChecker(initialNode, finalNode, graphStructure) {
    const visitedNodes = new Set();

    function traverse(currentNode) {
      if (currentNode === finalNode) {
        return true;
      }
      visitedNodes.add(currentNode);

      const adjacentNodes = graphStructure[currentNode] || [];
      for (const neighbor of adjacentNodes) {
        if (!visitedNodes.has(neighbor)) {
          if (traverse(neighbor)) {
            return true;
          }
        }
      }
      return false;
    }

    return traverse(initialNode);
  }

  inputLines.shift();
  console.log(inputLines.map(queryLine => {
    const [queryStart, queryEnd] = queryLine.split(' ').map(Number);
    return pathChecker(queryStart, queryEnd, connectionMap) ? 'yes' : 'no';
  }).join('\n'));
})();
