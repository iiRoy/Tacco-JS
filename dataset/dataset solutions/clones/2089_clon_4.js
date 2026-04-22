function processGraphSolution() {
  const totalVertices = nextInt();
  const vertexRegistry = new Map();

  for (let i = 0; i < totalVertices; i++) {
    vertexRegistry.set(i, {
      neighbors: new Set(),
      currentLayer: null,
      explored: false,
      assignedOutcome: null
    });
  }

  for (let i = 0; i < totalVertices - 1; i++) {
    const edgePair = nextIntArray();
    const u = edgePair[0] - 1;
    const v = edgePair[1] - 1;
    vertexRegistry.get(u).neighbors.add(v);
    vertexRegistry.get(v).neighbors.add(u);
  }

  const firstSeriesGen = createSeriesGenerator(1);
  const secondSeriesGen = createSeriesGenerator(2);
  const thirdSeriesGen = createSeriesGenerator(3);

  const { oddLayerCount, evenLayerCount } = discoverLayersAndCounts(vertexRegistry, totalVertices);

  applyPrimaryArrangement(vertexRegistry, totalVertices, oddLayerCount, evenLayerCount, firstSeriesGen, secondSeriesGen, thirdSeriesGen);

  finalizeArrangement(vertexRegistry, totalVertices, firstSeriesGen, secondSeriesGen, thirdSeriesGen);

  const finalArrangement = Array.from({ length: totalVertices }, (_, i) => vertexRegistry.get(i).assignedOutcome);
  myout(myconv(finalArrangement, 8));
}

function createSeriesGenerator(initialValue) {
  let internalValue = initialValue;
  return {
    peek: function() { return internalValue; },
    pull: function() {
      const result = internalValue;
      internalValue += 3;
      return result;
    }
  };
}

function discoverLayersAndCounts(vertexCollection, totalPoints) {
  const nodeQueue = [0];
  const initialNode = vertexCollection.get(0);
  initialNode.explored = true;
  initialNode.currentLayer = 1;

  let oddLayers = 0;
  let evenLayers = 0;

  while (nodeQueue.length > 0) {
    const currentNodeId = nodeQueue.shift();
    const currentNodeData = vertexCollection.get(currentNodeId);

    if (currentNodeData.currentLayer % 2 === 1) {
      oddLayers++;
    } else {
      evenLayers++;
    }

    for (const adjacentNodeId of currentNodeData.neighbors) {
      const adjacentNodeData = vertexCollection.get(adjacentNodeId);
      if (!adjacentNodeData.explored) {
        adjacentNodeData.explored = true;
        adjacentNodeData.currentLayer = currentNodeData.currentLayer + 1;
        nodeQueue.push(adjacentNodeId);
      }
    }
  }
  return { oddLayerCount: oddLayers, evenLayerCount: evenLayers };
}

function applyPrimaryArrangement(vertexCollection, totalPoints, oddLayerCount, evenLayerCount, genA, genB, genC) {
  const thresholdFraction = totalPoints / 3;
  if (oddLayerCount > thresholdFraction && evenLayerCount > thresholdFraction) {
    for (let i = 0; i < totalPoints; i++) {
      const nodeInfo = vertexCollection.get(i);
      if (nodeInfo.currentLayer % 2 === 1) {
        nodeInfo.assignedOutcome = genA.pull();
      } else {
        nodeInfo.assignedOutcome = genB.pull();
      }
    }
  } else {
    for (let i = 0; i < totalPoints; i++) {
      const nodeInfo = vertexCollection.get(i);
      if (oddLayerCount < evenLayerCount) {
        if (nodeInfo.currentLayer % 2 === 1) {
          nodeInfo.assignedOutcome = genC.pull();
        }
      } else {
        if (nodeInfo.currentLayer % 2 === 0) {
          nodeInfo.assignedOutcome = genC.pull();
        }
      }
    }
  }
}

function finalizeArrangement(vertexCollection, totalPoints, genA, genB, genC) {
  for (let i = 0; i < totalPoints; i++) {
    const nodeInfo = vertexCollection.get(i);
    if (nodeInfo.assignedOutcome === null) {
      if (genA.peek() <= totalPoints) {
        nodeInfo.assignedOutcome = genA.pull();
      } else if (genB.peek() <= totalPoints) {
        nodeInfo.assignedOutcome = genB.pull();
      } else if (genC.peek() <= totalPoints) {
        nodeInfo.assignedOutcome = genC.pull();
      }
    }
  }
}