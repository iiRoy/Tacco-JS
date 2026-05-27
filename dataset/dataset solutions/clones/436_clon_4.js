const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

const initializePathMatrix = (dimension) =>
  Array.from({ length: dimension }, (_, rowIndex) =>
    Array.from({ length: dimension }, (_, colIndex) => (rowIndex === colIndex ? 0 : Infinity))
  );

const calculateAllShortestPaths = (initialCosts, initialTimes, graphSize) => {
  // Create deep copies of the initial matrices to work with
  // The accumulator 'acc' will hold the current state of the cost and time matrices
  const finalMatrices = Array.from({ length: graphSize }).reduce((acc, _, viaNodeIndex) => {
    // For each source node (i)
    Array.from({ length: graphSize }).forEach((_, sourceNodeIndex) => {
      // For each destination node (j)
      Array.from({ length: graphSize }).forEach((_, destNodeIndex) => {
        // Update cost matrix: check if path through viaNodeIndex is shorter
        const potentialCost = acc.costs[sourceNodeIndex][viaNodeIndex] + acc.costs[viaNodeIndex][destNodeIndex];
        if (acc.costs[sourceNodeIndex][destNodeIndex] > potentialCost) {
          acc.costs[sourceNodeIndex][destNodeIndex] = potentialCost;
        }

        // Update time matrix: check if path through viaNodeIndex is shorter
        const potentialTime = acc.times[sourceNodeIndex][viaNodeIndex] + acc.times[viaNodeIndex][destNodeIndex];
        if (acc.times[sourceNodeIndex][destNodeIndex] > potentialTime) {
          acc.times[sourceNodeIndex][destNodeIndex] = potentialTime;
        }
      });
    });
    return acc; // Return the updated accumulator for the next iteration
  }, { costs: initialCosts.map(row => [...row]), times: initialTimes.map(row => [...row]) }); // Initial accumulator state with deep copies

  return { finalCosts: finalMatrices.costs, finalTimes: finalMatrices.times };
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedInputLines = rawInputContent.trim().split("\n");

while (true) {
  const graphParameters = parseNumericLine(processedInputLines.shift());
  const numberOfEdges = graphParameters[0];
  const numberOfNodes = graphParameters[1];

  if (numberOfEdges === 0 && numberOfNodes === 0) break;

  let initialCostMatrix = initializePathMatrix(numberOfNodes);
  let initialTimeMatrix = initializePathMatrix(numberOfNodes);

  // Populate matrices with initial edge weights using functional iteration
  Array.from({ length: numberOfEdges }).forEach(() => {
    const edgeDetails = parseNumericLine(processedInputLines.shift());
    const originNode = edgeDetails[0] - 1;
    const destinationNode = edgeDetails[1] - 1;
    const directCost = edgeDetails[2];
    const directTime = edgeDetails[3];

    initialCostMatrix[originNode][destinationNode] = directCost;
    initialTimeMatrix[originNode][destinationNode] = directTime;
  });

  // Execute the Floyd-Warshall algorithm with the new functional approach
  const { finalCosts, finalTimes } = calculateAllShortestPaths(initialCostMatrix, initialTimeMatrix, numberOfNodes);

  const totalQueries = Number(processedInputLines.shift());

  // Process queries using functional iteration
  Array.from({ length: totalQueries }).forEach(() => {
    const queryRequest = parseNumericLine(processedInputLines.shift());
    const queryOrigin = queryRequest[0] - 1;
    const queryDestination = queryRequest[1] - 1;
    const queryMetricType = queryRequest[2];

    if (queryMetricType === 0) {
      console.log(finalCosts[queryOrigin][queryDestination]);
    } else if (queryMetricType === 1) {
      console.log(finalTimes[queryOrigin][queryDestination]);
    }
  });
}
