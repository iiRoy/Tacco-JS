const fileSystem = require('fs');
const inputLength = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(inputLength);
const readBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, inputLength, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, readBytes).split('\n');

(function calculateShortestPath() {
  const [nodeCountStr, edgeCountStr, startNodeStr, goal1Str, goal2Str] = rawInputLines.shift().split(' ');
  const nodeCount = Number(nodeCountStr);
  const edgeCount = Number(edgeCountStr);
  const startNode = Number(startNodeStr) - 1;
  const firstGoal = Number(goal1Str) - 1;
  const secondGoal = Number(goal2Str) - 1;

  let distanceMatrix = Array.from({ length: nodeCount }, (_, rowIdx) =>
    Array.from({ length: nodeCount }, (_, colIdx) =>
      rowIdx === colIdx ? 0 : Infinity
    )
  );

  rawInputLines.slice(0, edgeCount).forEach(edgeLine => {
    const [fromNodeStr, toNodeStr, weightStr] = edgeLine.split(' ');
    const fromNode = Number(fromNodeStr) - 1;
    const toNode = Number(toNodeStr) - 1;
    const weight = Number(weightStr);
    distanceMatrix[fromNode][toNode] = weight;
  });

  Array.from({ length: nodeCount }).forEach((_, intermediateNode) => {
    distanceMatrix = Array.from({ length: nodeCount }, (_, sourceNode) =>
      Array.from({ length: nodeCount }, (_, destNode) =>
        Math.min(
          distanceMatrix[sourceNode][destNode],
          distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode]
        )
      )
    );
  });

  const finalMinCost = Array.from({ length: nodeCount })
    .map((_, commonMeetingPoint) =>
      distanceMatrix[startNode][commonMeetingPoint] +
      distanceMatrix[commonMeetingPoint][firstGoal] +
      distanceMatrix[commonMeetingPoint][secondGoal]
    )
    .reduce((minVal, currentVal) => Math.min(minVal, currentVal), Infinity);

  console.log(finalMinCost);
})();
