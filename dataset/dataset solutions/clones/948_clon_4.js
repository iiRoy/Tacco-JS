(function graphProcessor() {
  const fileSystem = require('fs');
  const inputDataLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  const nodeCount = Number(inputDataLines.shift());

  const neighborConnections = inputDataLines.map((lineContent) => {
    return lineContent.split(' ').slice(2).map(element => Number(element) - 1);
  });

  const discoveryTimestamps = Array(nodeCount).fill(0);
  const completionTimestamps = Array(nodeCount).fill(0);

  traverseGraphDepthFirst(neighborConnections, discoveryTimestamps, completionTimestamps);

  const outputBuffer = Array.from({ length: nodeCount }, (_, idx) => {
    return `${idx + 1} ${discoveryTimestamps[idx]} ${completionTimestamps[idx]}`;
  }).join('\n') + '\n';

  process.stdout.write(outputBuffer);
})();

function traverseGraphDepthFirst(nodeConnections, discoveryTimestamps, completionTimestamps) {
  const UNVISITED_STATE = 0;
  const EXPLORING_STATE = 1;
  const COMPLETED_STATE = 2;
  const graphSize = nodeConnections.length;
  const nodeStatus = Array(graphSize).fill(UNVISITED_STATE);

  let globalTimer = 0;
  const processingStack = [];

  for (let currentNodeIdx = 0; currentNodeIdx < graphSize; currentNodeIdx++) {
    if (nodeStatus[currentNodeIdx] === UNVISITED_STATE) {
      processingStack.push({ node: currentNodeIdx, stage: 'discover' });

      while (processingStack.length > 0) {
        const { node: current, stage } = processingStack.pop();

        if (stage === 'discover') {
          if (nodeStatus[current] === UNVISITED_STATE) {
            nodeStatus[current] = EXPLORING_STATE;
            globalTimer++;
            discoveryTimestamps[current] = globalTimer;

            processingStack.push({ node: current, stage: 'finish' });

            const neighbors = nodeConnections[current];
            for (let i = neighbors.length - 1; i >= 0; i--) {
              const neighbor = neighbors[i];
              if (nodeStatus[neighbor] === UNVISITED_STATE) {
                processingStack.push({ node: neighbor, stage: 'discover' });
              }
            }
          }
        } else if (stage === 'finish') {
          if (nodeStatus[current] === EXPLORING_STATE) {
            nodeStatus[current] = COMPLETED_STATE;
            globalTimer++;
            completionTimestamps[current] = globalTimer;
          }
        }
      }
    }
  }
}
