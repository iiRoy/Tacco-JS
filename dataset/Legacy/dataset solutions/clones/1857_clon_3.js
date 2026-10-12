function main(rawInput) {
  const inputLines = rawInput.trim().split('\n');
  const [nodeCountStr, edgeCountStr] = inputLines[0].split(' ');
  const nodeCount = Number(nodeCountStr);
  const edgeCount = Number(edgeCountStr);

  const adjList = Array.from({ length: nodeCount }, () => []);

  for (let i = 1; i <= edgeCount; i++) {
    const edgeInput = inputLines[i].split(' ');
    const nodeA = Number(edgeInput[0]) - 1;
    const nodeB = Number(edgeInput[1]) - 1;
    adjList[nodeA].push(nodeB);
    adjList[nodeB].push(nodeA);
  }

  const visitedNodes = new Set();
  const levelsData = [];
  let nodesInCurrentLevel = [0];
  visitedNodes.add(0);
  let currentLevelIndex = 0;

  while (nodesInCurrentLevel.length > 0) {
    const nodesInNextLevel = [];
    levelsData.push([]);

    for (const currentNode of nodesInCurrentLevel) {
      for (const connectedNode of adjList[currentNode]) {
        if (!visitedNodes.has(connectedNode)) {
          visitedNodes.add(connectedNode);
          nodesInNextLevel.push(connectedNode);
          levelsData[currentLevelIndex].push(connectedNode);
        }
      }
    }
    currentLevelIndex++;
    nodesInCurrentLevel = nodesInNextLevel;
  }

  const resultLevels = new Array(nodeCount).fill(0);
  for (let i = 0; i < levelsData.length; i++) {
    for (const nodeIndex of levelsData[i]) {
      resultLevels[nodeIndex] = i;
    }
  }
  resultLevels.shift();

  if (visitedNodes.size !== nodeCount) {
    console.log('No');
  } else {
    console.log('Yes');
    for (let i = 0; i < resultLevels.length; i++) {
      console.log(resultLevels[i] + 1);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
