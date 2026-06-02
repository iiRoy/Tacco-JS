const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataRows = rawData.split('\n');

const numNodes = Number(dataRows[0].split(' ')[0]);
const numEdges = Number(dataRows[0].split(' ')[1]);
const initialWaterLevel = Number(dataRows[0].split(' ')[2]);

let idxA, idxB, idxC; // Loop counters, idxB and idxC are unused in this specific logic.
const nodeHeights = Array(numNodes); // Stores the height associated with each node.

const adjList = Array(numNodes); // Adjacency list for the graph.
const processingQueue = []; // Queue for managing states during the search.

// Initialize node heights and adjacency lists.
for (idxA = 0; idxA < numNodes; idxA++) {
  nodeHeights[idxA] = Number(dataRows[idxA + 1]);
  adjList[idxA] = [];
}

let edgeData, nodeU, nodeV, travelDuration; // Variables for parsing edge details.

// Populate the adjacency list with edge information.
for (idxA = 0; idxA < numEdges; idxA++) {
   edgeData = dataRows[idxA + numNodes + 1].split(' ');
   nodeU = Number(edgeData[0]) - 1; // Convert to 0-indexed.
   nodeV = Number(edgeData[1]) - 1; // Convert to 0-indexed.
   travelDuration = Number(edgeData[2]); // Time to traverse this edge.

   // Add edges for an undirected graph.
   adjList[nodeU].push({
     destination: nodeV,
     duration: travelDuration
   });
   adjList[nodeV].push({
     destination: nodeU,
     duration: travelDuration
   });
}

// Push the initial state onto the processing queue.
processingQueue.push({
  currentPoint: 0, // Starting node index.
  elapsedTime: 0, // Time elapsed so far.
  currentWaterLevel: initialWaterLevel, // Current water level.
  pathTaken: [0] // History of visited nodes in this path.
});

let currentNodeState, nextNodeIdx, edgeInfo, finalPathState;
let minimumTime = Infinity; // Initialize minimum time to reach destination.

// Main search loop.
while (processingQueue.length > 0){
  currentNodeState = processingQueue.pop(); // Get the next state to process.

  // If current path's time already exceeds or equals the minimum found, skip.
  if (currentNodeState.elapsedTime >= minimumTime) {
    continue;
  }

  // Explore neighbors of the current node.
  for (idxA = 0; idxA < adjList[currentNodeState.currentPoint].length; idxA++) {
    edgeInfo = adjList[currentNodeState.currentPoint][idxA];
    nextNodeIdx = edgeInfo.destination;

    // If the next node is already in the current path, skip to avoid cycles.
    if (currentNodeState.pathTaken.indexOf(nextNodeIdx) !== -1) {
      continue;
    }
    
    // Check if the current node's height is sufficient for traversal.
    if (nodeHeights[currentNodeState.currentPoint] < edgeInfo.duration) {
      continue;
    }

    // Determine the next state based on water level conditions.
    if (nodeHeights[nextNodeIdx] + edgeInfo.duration < currentNodeState.currentWaterLevel ) {
      processingQueue.push({
        currentPoint: nextNodeIdx,
        elapsedTime: currentNodeState.elapsedTime + edgeInfo.duration + currentNodeState.currentWaterLevel - (nodeHeights[nextNodeIdx] + edgeInfo.duration),
        currentWaterLevel: nodeHeights[nextNodeIdx],
        pathTaken: currentNodeState.pathTaken.concat(nextNodeIdx)
      });
    } else {
      // Replicating the original code's potentially buggy indexing:
      // `h[next + obj.t >= node.height && node.height >= obj.t]`
      // This evaluates the boolean expression `(nextNodeIdx + edgeInfo.duration >= currentNodeState.currentWaterLevel) && (currentNodeState.currentWaterLevel >= edgeInfo.duration)`
      // and uses its numeric equivalent (0 for false, 1 for true) as an index for `nodeHeights`.
      const conditionResult = (nextNodeIdx + edgeInfo.duration >= currentNodeState.currentWaterLevel) && (currentNodeState.currentWaterLevel >= edgeInfo.duration);
      if (nodeHeights[Number(conditionResult)]) {
        processingQueue.push({
          currentPoint: nextNodeIdx,
          elapsedTime: currentNodeState.elapsedTime + edgeInfo.duration,
          currentWaterLevel: currentNodeState.currentWaterLevel - edgeInfo.duration,
          pathTaken: currentNodeState.pathTaken.concat(nextNodeIdx)
        });
      } else {
        processingQueue.push({
          currentPoint: nextNodeIdx,
          elapsedTime: currentNodeState.elapsedTime + edgeInfo.duration + edgeInfo.duration - currentNodeState.currentWaterLevel,
          currentWaterLevel: 0,
          pathTaken: currentNodeState.pathTaken.concat(nextNodeIdx)
        });
      }
    }
    
    // If the destination node (numNodes - 1) is reached, update minimum time.
    if(nextNodeIdx === numNodes - 1) {
      // Replicating the original code's behavior of popping from the queue here.
      // This might remove an unrelated element from the queue, depending on its state.
      finalPathState = processingQueue.pop();
      minimumTime = Math.min(minimumTime, finalPathState.elapsedTime + nodeHeights[numNodes - 1] - finalPathState.currentWaterLevel);
    }
  }
  // Sort the processing queue in descending order of elapsed time.
  // This ensures that `pop()` retrieves the element with the smallest `elapsedTime`.
  processingQueue.sort(function (pathA, pathB) {
    return pathB.elapsedTime - pathA.elapsedTime;
  });
}

// Output the final result.
if (minimumTime === Infinity) {
  console.log(-1); // Destination was unreachable.
} else {
  console.log(minimumTime); // The calculated minimum time.
}
