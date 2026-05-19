let allInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  allInput += chunk;
});
process.stdin.on('end', () => {
  processInput();
});

function processInput() {
  const dataLines = allInput.split('\n');

  const [nodeQuantityStr, pathQuantityStr, initialEnergyStr] = dataLines[0].split(' ');
  const nodeQuantity = Number(nodeQuantityStr);
  const pathQuantity = Number(pathQuantityStr);
  const startingEnergy = Number(initialEnergyStr);

  const elevationLevels = new Array(nodeQuantity);
  for (let i = 0; i < nodeQuantity; i++) {
    elevationLevels[i] = Number(dataLines[i + 1]);
  }

  const connectionDetails = new Array(pathQuantity);
  const adjacencyMap = new Map();

  for (let i = 0; i < nodeQuantity; i++) {
    adjacencyMap.set(i, []);
  }

  for (let i = 0; i < pathQuantity; i++) {
    const [sourceStr, targetStr, travelCostStr] = dataLines[i + nodeQuantity + 1].split(' ');
    const sourceNode = Number(sourceStr) - 1;
    const targetNode = Number(targetStr) - 1;
    const edgeCost = Number(travelCostStr);

    adjacencyMap.get(sourceNode).push({ neighbor: targetNode, cost: edgeCost });
    adjacencyMap.get(targetNode).push({ neighbor: sourceNode, cost: edgeCost });
    connectionDetails[i] = { u: sourceNode, v: targetNode, w: edgeCost };
  }

  function computeReversePathCosts(vertexCount, destinationNode, graphEdges, nodeElevations) {
    const shortestDistances = new Array(vertexCount).fill(Infinity);
    shortestDistances[destinationNode] = 0;

    for (let iter = 0; iter < vertexCount - 1; iter++) {
      let anyUpdate = false;
      for (const { u, v, w } of graphEdges) {
        if (shortestDistances[u] !== Infinity && nodeElevations[v] >= w) {
          if (shortestDistances[v] > shortestDistances[u] + w) {
            shortestDistances[v] = shortestDistances[u] + w;
            anyUpdate = true;
          }
        }
        if (shortestDistances[v] !== Infinity && nodeElevations[u] >= w) {
          if (shortestDistances[u] > shortestDistances[v] + w) {
            shortestDistances[u] = shortestDistances[v] + w;
            anyUpdate = true;
          }
        }
      }
      if (!anyUpdate) break;
    }
    return shortestDistances;
  }

  const reverseCosts = computeReversePathCosts(nodeQuantity, nodeQuantity - 1, connectionDetails, elevationLevels);

  class MinPriorityQueue {
    constructor() {
      this.heap = [];
    }

    push(item, priority) {
      this.heap.push({ item, priority });
      this._bubbleUp(this.heap.length - 1);
    }

    pop() {
      if (this.isEmpty()) return undefined;
      const min = this.heap[0];
      const last = this.heap.pop();
      if (!this.isEmpty()) {
        this.heap[0] = last;
        this._sinkDown(0);
      }
      return min.item;
    }

    isEmpty() {
      return this.heap.length === 0;
    }

    _bubbleUp(index) {
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        if (this.heap[index].priority < this.heap[parentIndex].priority) {
          [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
          index = parentIndex;
        } else {
          break;
        }
      }
    }

    _sinkDown(index) {
      const lastIndex = this.heap.length - 1;
      while (true) {
        const leftChildIndex = 2 * index + 1;
        const rightChildIndex = 2 * index + 2;
        let smallestIndex = index;

        if (leftChildIndex <= lastIndex && this.heap[leftChildIndex].priority < this.heap[smallestIndex].priority) {
          smallestIndex = leftChildIndex;
        }
        if (rightChildIndex <= lastIndex && this.heap[rightChildIndex].priority < this.heap[smallestIndex].priority) {
          smallestIndex = rightChildIndex;
        }

        if (smallestIndex !== index) {
          [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
          index = smallestIndex;
        } else {
          break;
        }
      }
    }
  }

  const pathQueue = new MinPriorityQueue();
  let minimumTotalTime = Infinity;

  const initialPathState = { currentIdx: 0, elapsed: 0, remainingEnergy: startingEnergy };
  pathQueue.push(initialPathState, 0);

  const visitedPathStates = new Map();
  for (let i = 0; i < nodeQuantity; i++) {
    visitedPathStates.set(i, []);
  }
  visitedPathStates.get(0).push({ time: 0, energy: startingEnergy });

  const calculateNextState = (current, edge) => {
    const { currentIdx, elapsed, remainingEnergy } = current;
    const { neighbor, cost } = edge;

    if (elevationLevels[currentIdx] < cost) {
      return null;
    }

    let nextElapsed, nextEnergy;
    const nextNodeElevation = elevationLevels[neighbor];

    if (nextNodeElevation + cost < remainingEnergy) {
      nextElapsed = elapsed + cost + (remainingEnergy - (nextNodeElevation + cost));
      nextEnergy = nextNodeElevation;
    } else if (nextNodeElevation + cost >= remainingEnergy && remainingEnergy >= cost) {
      nextElapsed = elapsed + cost;
      nextEnergy = remainingEnergy - cost;
    } else {
      nextElapsed = elapsed + cost + (cost - remainingEnergy);
      nextEnergy = 0;
    }

    return { currentIdx: neighbor, elapsed: nextElapsed, remainingEnergy: nextEnergy };
  };

  while (!pathQueue.isEmpty()) {
    const currentPath = pathQueue.pop();
    const { currentIdx, elapsed, remainingEnergy } = currentPath;

    if (elapsed + reverseCosts[currentIdx] * 2 - remainingEnergy >= minimumTotalTime) {
      continue;
    }

    if (currentIdx === nodeQuantity - 1) {
      minimumTotalTime = Math.min(minimumTotalTime, elapsed + elevationLevels[nodeQuantity - 1] - remainingEnergy);
      continue;
    }

    const currentAdjacencies = adjacencyMap.get(currentIdx);
    for (const connection of currentAdjacencies) {
      const nextPathState = calculateNextState(currentPath, connection);

      if (nextPathState === null) {
        continue;
      }

      const { currentIdx: nextNode, elapsed: nextTime, remainingEnergy: nextEnergy } = nextPathState;

      if (nextNode === nodeQuantity - 1) {
        minimumTotalTime = Math.min(minimumTotalTime, nextTime + elevationLevels[nodeQuantity - 1] - nextEnergy);
      } else {
        let isDominated = false;
        const existingStates = visitedPathStates.get(nextNode);
        for (const existing of existingStates) {
          if (existing.time < nextTime && existing.energy >= nextEnergy) {
            isDominated = true;
            break;
          }
        }

        if (!isDominated) {
          existingStates.push({ time: nextTime, energy: nextEnergy });
          pathQueue.push(nextPathState, nextTime);
        }
      }
    }
  }

  if (minimumTotalTime === Infinity) {
    console.log(-1);
  } else {
    console.log(minimumTotalTime);
  }
}
