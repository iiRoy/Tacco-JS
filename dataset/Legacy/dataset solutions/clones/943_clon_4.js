(function(inputData) {
  const rawLines = inputData.trim().split('\n');
  const vertexCount = parseInt(rawLines[0], 10);

  const graphAdjacency = Array.from({ length: vertexCount }, () => []);
  const vertexStatus = Array(vertexCount).fill('UNVISITED');
  const entryTimes = Array(vertexCount).fill(0);
  const exitTimes = Array(vertexCount).fill(0);

  let elapsedTime = 0;

  for (let lineIndex = 1; lineIndex <= vertexCount; lineIndex++) {
    const parts = rawLines[lineIndex].split(' ').map(Number);
    const currentVertex = parts[0] - 1;
    const neighbors = parts.slice(2);
    graphAdjacency[currentVertex] = neighbors;
  }

  const traversalStack = [];
  traversalStack.push({ vertexId: 0, isFinishing: false });

  while (traversalStack.length > 0) {
    const currentTask = traversalStack.pop();
    const currentVertex = currentTask.vertexId;

    if (currentTask.isFinishing) {
      vertexStatus[currentVertex] = 'COMPLETED';
      exitTimes[currentVertex] = ++elapsedTime;
    } else {
      if (vertexStatus[currentVertex] !== 'UNVISITED') {
        continue;
      }

      vertexStatus[currentVertex] = 'VISITING';
      entryTimes[currentVertex] = ++elapsedTime;

      traversalStack.push({ vertexId: currentVertex, isFinishing: true });

      const neighbors = graphAdjacency[currentVertex];
      for (let k = neighbors.length - 1; k >= 0; k--) {
        const neighbor = neighbors[k] - 1;
        if (vertexStatus[neighbor] === 'UNVISITED') {
          traversalStack.push({ vertexId: neighbor, isFinishing: false });
        }
      }
    }
  }

  for (let i = 0; i < vertexCount; i++) {
    console.log([i + 1, entryTimes[i], exitTimes[i]].join(' '));
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
