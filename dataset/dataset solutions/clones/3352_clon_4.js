const primeModulus = 1000000007;

const makeGraphData = (vertexCount, edgePairs) => {
  const graphStructure = new Map();
  Array.from({ length: vertexCount }, (_, k) => k + 1).forEach(nodeId => graphStructure.set(nodeId, new Set()));

  edgePairs.forEach(([firstNode, secondNode]) => {
    graphStructure.get(firstNode).add(secondNode);
    graphStructure.get(secondNode).add(firstNode);
  });
  return graphStructure;
};

const calculateTreeScores = (currentNode, structure, seenNodes) => {
  seenNodes.add(currentNode);

  let currentAccumulatedScores = { not_in: 1, in: 1 };

  for (const neighbor of structure.get(currentNode)) {
    if (!seenNodes.has(neighbor)) {
      const neighborScores = calculateTreeScores(neighbor, structure, seenNodes);

      currentAccumulatedScores.not_in = (currentAccumulatedScores.not_in * (neighborScores.not_in + neighborScores.in)) % primeModulus;
      currentAccumulatedScores.in = (currentAccumulatedScores.in * neighborScores.not_in) % primeModulus;
    }
  }
  return currentAccumulatedScores;
};

const computeSolution = (totalNodes, edgeCollection) => {
  const graphRepresentation = makeGraphData(totalNodes, edgeCollection);

  // The original 'solve' function contains commented-out code that would
  // utilize the graph and tree score calculation. To match the original's
  // current (uncommented) functionality, the final return is 0.
  // However, for Type IV cloning, the underlying logic is still implemented.
  if (totalNodes > 0 && graphRepresentation.has(1)) { // Assuming starting node 1 as per original's commented code
    const explorationPath = new Set();
    const finalTreeResult = calculateTreeScores(1, graphRepresentation, explorationPath);
    // If the original 'solve' was fully active, it might return something like:
    // return (finalTreeResult.not_in + finalTreeResult.in) % primeModulus;
  }

  return 0; // Strictly adheres to the provided 'solve' function's current return value.
};

const initiateProcessing = (programInput) => {
  const inputSegments = programInput.split('\n');
  const totalNodes = Number(inputSegments[0]);
  const edgeCollection = inputSegments.slice(1).map(segment =>
    segment.split(' ').map(val => Number(val))
  );

  const finalOutcome = computeSolution(totalNodes, edgeCollection);
  console.log(finalOutcome);
};

const runApplication = () => {
  const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
  initiateProcessing(fileContent);
};

runApplication();