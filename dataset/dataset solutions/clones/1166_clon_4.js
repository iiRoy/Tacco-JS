let adjList = [];
let nodeCount, edgeCount;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
  const inputSegments = inputData.split('\n');

  const graphDimensions = inputSegments[0].split(' ').map(Number);
  nodeCount = graphDimensions[0];
  edgeCount = graphDimensions[1];

  for (let i = 0; i < nodeCount; ++i) {
    adjList[i] = [];
  }

  inputSegments.slice(1).filter(Boolean).forEach(segment => {
    const edgeDetails = segment.split(' ').map(Number);
    establishFlowPath(edgeDetails[0], edgeDetails[1], edgeDetails[2]);
  });

  console.log(determineNetworkCapacity(0, nodeCount - 1));
});

class FlowEdge {
  constructor(targetNode, capacityValue, reverseEdgeRef) {
    this.targetNode = targetNode;
    this.capacityValue = capacityValue;
    this.reverseEdgeRef = reverseEdgeRef;
  }
}

function establishFlowPath(origin, destination, flowCapacity) {
  const forwardEdge = new FlowEdge(destination, flowCapacity, null);
  const backwardEdge = new FlowEdge(origin, 0, null);

  forwardEdge.reverseEdgeRef = backwardEdge;
  backwardEdge.reverseEdgeRef = forwardEdge;

  adjList[origin].push(forwardEdge);
  adjList[destination].push(backwardEdge);
}

function findAugmentingPathBFS(sourceNode, terminalNode, totalNodes) {
  const traversalQueue = [];
  const visitedNodes = new Array(totalNodes).fill(false);
  const pathPredecessorEdge = new Array(totalNodes).fill(null);

  traversalQueue.push(sourceNode);
  visitedNodes[sourceNode] = true;

  let pathFound = false;
  while (traversalQueue.length > 0) {
    const currentNode = traversalQueue.shift();

    if (currentNode === terminalNode) {
      pathFound = true;
      break;
    }

    for (const currentPathSegment of adjList[currentNode]) {
      if (!visitedNodes[currentPathSegment.targetNode] && currentPathSegment.capacityValue > 0) {
        visitedNodes[currentPathSegment.targetNode] = true;
        pathPredecessorEdge[currentPathSegment.targetNode] = currentPathSegment;
        traversalQueue.push(currentPathSegment.targetNode);
      }
    }
  }

  if (!pathFound) {
    return 0;
  }

  let pathIncrement = Infinity;
  let current = terminalNode;
  while (current !== sourceNode) {
    const edgeToCurrent = pathPredecessorEdge[current];
    pathIncrement = Math.min(pathIncrement, edgeToCurrent.capacityValue);
    current = edgeToCurrent.reverseEdgeRef.targetNode;
  }

  current = terminalNode;
  while (current !== sourceNode) {
    const edgeToCurrent = pathPredecessorEdge[current];
    edgeToCurrent.capacityValue -= pathIncrement;
    edgeToCurrent.reverseEdgeRef.capacityValue += pathIncrement;
    current = edgeToCurrent.reverseEdgeRef.targetNode;
  }

  return pathIncrement;
}

function determineNetworkCapacity(sourceNode, terminalNode) {
  let accumulatedFlow = 0;

  while (true) {
    const currentPathFlow = findAugmentingPathBFS(sourceNode, terminalNode, nodeCount);

    if (currentPathFlow === 0) {
      break;
    }

    accumulatedFlow += currentPathFlow;
  }

  return accumulatedFlow;
}
