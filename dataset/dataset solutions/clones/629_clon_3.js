const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const dataLines = rawInputData.split('\n');

const parseInteger = (str) => parseInt(str, 10);

const firstLineParts = dataLines[0].split(' ');
const numNodes = parseInteger(firstLineParts[0]);
const numEdges = parseInteger(firstLineParts[1]);
const initialWaterHeight = parseInteger(firstLineParts[2]);

let loopIndex1;
const nodeHeights = new Array(numNodes);
const adjacencyList = Array.from({ length: numNodes }, () => []);
const processingQueue = [];

for (loopIndex1 = 0; loopIndex1 < numNodes; loopIndex1++) {
  nodeHeights[loopIndex1] = parseInteger(dataLines[loopIndex1 + 1]);
}

for (loopIndex1 = 0; loopIndex1 < numEdges; loopIndex1++) {
  const edgeDataString = dataLines[loopIndex1 + numNodes + 1].split(' ');
  const nodeAIndex = parseInteger(edgeDataString[0]) - 1;
  const nodeBIndex = parseInteger(edgeDataString[1]) - 1;
  const edgeTravelTime = parseInteger(edgeDataString[2]);

  const edgeToB = {
    destination: nodeBIndex,
    timeCost: edgeTravelTime
  };
  const edgeToA = {
    destination: nodeAIndex,
    timeCost: edgeTravelTime
  };

  adjacencyList[nodeAIndex].push(edgeToB);
  adjacencyList[nodeBIndex].push(edgeToA);
}

processingQueue.push({
  position: 0,
  totalTimeElapsed: 0,
  currentHeight: initialWaterHeight,
  pathHistory: [0]
});

let minTotalTime = Infinity;

while (processingQueue.length > 0) {
  const { position: currentPosIdx, totalTimeElapsed: currentTime, currentHeight: currentWaterLvl, pathHistory: currentPath } = processingQueue.pop();

  const neighborEdges = adjacencyList[currentPosIdx];
  const currentNodeHeight = nodeHeights[currentPosIdx];

  for (loopIndex1 = 0; loopIndex1 < neighborEdges.length; loopIndex1++) {
    const edgeDetails = neighborEdges[loopIndex1];
    const nextNodeIdx = edgeDetails.destination;
    const travelDuration = edgeDetails.timeCost;

    if (currentPath.includes(nextNodeIdx)) {
      continue;
    }
    
    if (currentNodeHeight < travelDuration) {
      continue;
    }

    let nextState;
    const nextNodeHeight = nodeHeights[nextNodeIdx];
    const newPath = currentPath.concat(nextNodeIdx);

    if (nextNodeHeight + travelDuration < currentWaterLvl) {
      nextState = {
        position: nextNodeIdx,
        totalTimeElapsed: currentTime + travelDuration + currentWaterLvl - (nextNodeHeight + travelDuration),
        currentHeight: nextNodeHeight,
        pathHistory: newPath
      };
    } else {
      const problematicConditionBoolean = (nextNodeIdx + travelDuration >= currentWaterLvl && currentWaterLvl >= travelDuration);
      const conditionValue = nodeHeights[problematicConditionBoolean ? 1 : 0];

      if (conditionValue) {
        nextState = {
          position: nextNodeIdx,
          totalTimeElapsed: currentTime + travelDuration,
          currentHeight: currentWaterLvl - travelDuration,
          pathHistory: newPath
        };
      } else {
        nextState = {
          position: nextNodeIdx,
          totalTimeElapsed: currentTime + travelDuration + travelDuration - currentWaterLvl,
          currentHeight: 0,
          pathHistory: newPath
        };
      }
    }
    
    processingQueue.push(nextState);

    const finalDestinationNode = numNodes - 1;
    if (nextNodeIdx === finalDestinationNode) {
      const reachedGoalState = processingQueue.pop();
      const finalNodeHeight = nodeHeights[finalDestinationNode];
      minTotalTime = Math.min(minTotalTime, reachedGoalState.totalTimeElapsed + finalNodeHeight - reachedGoalState.currentHeight);
    }
  }
}

console.log(minTotalTime);
