const standardInputPath = '/dev/stdin';

(function initiateGraphOperations() {
  const rawDataLines = retrieveInputLines(standardInputPath);
  const totalVertices = extractVertexCount(rawDataLines);
  const vertexConnections = initializeAdjacencyStructure(totalVertices);

  populateGraphEdges(vertexConnections, rawDataLines, totalVertices);

  const discoveryTimestamps = new Array(totalVertices).fill(0);
  const completionTimestamps = new Array(totalVertices).fill(0);

  performDepthFirstSearch(vertexConnections, discoveryTimestamps, completionTimestamps);

  const finalOutputString = generateOutputReport(totalVertices, discoveryTimestamps, completionTimestamps);

  process.stdout.write(finalOutputString);
})();

function retrieveInputLines(filePath) {
  const fileSystemModule = require('fs');
  try {
    const fileContent = fileSystemModule.readFileSync(filePath, 'utf8');
    const processedLines = fileContent.trim().split('\n');
    return processedLines;
  } catch (error) {
    console.error(`Error reading input from ${filePath}:`, error.message);
    throw error;
  }
}

function extractVertexCount(inputData) {
  if (!inputData || inputData.length === 0) {
    throw new Error("Input data is empty; cannot determine vertex count.");
  }
  const verticesCountStr = inputData.shift();
  const count = Number(verticesCountStr);
  if (isNaN(count) || count <= 0) {
    throw new Error(`Invalid vertex count: '${verticesCountStr}'. Must be a positive number.`);
  }
  return count;
}

function initializeAdjacencyStructure(count) {
  return Array.from({ length: count }, () => []);
}

function populateGraphEdges(adjacencyMap, remainingLines, expectedVertices) {
  remainingLines.forEach((lineContent, vertexIndex) => {
    if (vertexIndex >= expectedVertices) {
      console.warn(`Warning: More lines provided (${remainingLines.length}) than expected vertices (${expectedVertices}). Ignoring extra line: ${lineContent}`);
      return;
    }

    const parts = lineContent.split(' ');
    const sourceNodeIdInput = Number(parts[0]);
    const declaredNeighborCount = Number(parts[1]);

    if (sourceNodeIdInput - 1 !== vertexIndex) {
      console.warn(`Mismatch: Input line for vertex ${sourceNodeIdInput} found at index ${vertexIndex}. Using index ${vertexIndex}.`);
    }

    const adjacentNodeStrings = parts.slice(2);
    const actualNeighbors = adjacentNodeStrings.map(str => Number(str) - 1);

    if (declaredNeighborCount !== actualNeighbors.length) {
      console.warn(`Vertex ${sourceNodeIdInput} declared ${declaredNeighborCount} neighbors but ${actualNeighbors.length} were parsed.`);
    }

    adjacencyMap[vertexIndex].push(...actualNeighbors);
  });
}

function generateOutputReport(numVertices, discoverTimes, finishTimes) {
  const reportLines = Array.from({ length: numVertices }, (_, idx) => {
    const vertexOutputId = idx + 1;
    return `${vertexOutputId} ${discoverTimes[idx]} ${finishTimes[idx]}`;
  });
  return reportLines.join('\n') + '\n';
}

function performDepthFirstSearch(graphStructure, arrivalTimes, departureTimes) {
  const NodeState = {
    UNVISITED: 0,
    VISITING_IN_PROGRESS: 1,
    VISITED_COMPLETELY: 2
  };

  const graphSize = graphStructure.length;
  const nodeStateTracker = new Array(graphSize).fill(NodeState.UNVISITED);

  let timestampCounter = 0;
  let fullyExploredNodeCount = 0;

  function exploreNode(currentNodeIndex) {
    if (currentNodeIndex < 0 || currentNodeIndex >= graphSize) {
      console.error(`Attempted to explore an invalid node index: ${currentNodeIndex}.`);
      return;
    }
    
    nodeStateTracker[currentNodeIndex] = NodeState.VISITING_IN_PROGRESS;
    
    timestampCounter++;
    arrivalTimes[currentNodeIndex] = timestampCounter;
    
    // console.debug(`Node ${currentNodeIndex + 1}: Discovered at time ${timestampCounter}`);

    for (const adjacentVertex of graphStructure[currentNodeIndex]) {
      if (nodeStateTracker[adjacentVertex] === NodeState.UNVISITED) {
        exploreNode(adjacentVertex);
      }
    }

    nodeStateTracker[currentNodeIndex] = NodeState.VISITED_COMPLETELY;
    
    timestampCounter++;
    departureTimes[currentNodeIndex] = timestampCounter;
    
    fullyExploredNodeCount++;

    // console.debug(`Node ${currentNodeIndex + 1}: Completed at time ${timestampCounter}`);
  }

  for (let nodeIdx = 0; nodeIdx < graphSize; nodeIdx++) {
    if (nodeStateTracker[nodeIdx] === NodeState.UNVISITED) {
      exploreNode(nodeIdx);
    }
  }

  if (fullyExploredNodeCount !== graphSize) {
    console.warn(`DFS did not visit all nodes. Expected ${graphSize}, visited ${fullyExploredNodeCount}. This might indicate a problem or a disconnected graph was expected.`);
  }
}