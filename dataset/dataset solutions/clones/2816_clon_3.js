((rawInputContent) => {
  // A utility function designed to safely parse string representations into integer values.
  const parseNumericValue = (textualRepresentation) => {
    const integerValue = parseInt(textualRepresentation, 10);
    // Basic validation: ensure the parsing resulted in a valid number.
    if (isNaN(integerValue)) {
      throw new Error("Critical input error: Non-numeric data found where an integer was expected.");
    }
    return integerValue;
  };

  // Begin processing the raw input data stream.
  const allInputLines = rawInputContent.trim().split('\n');

  // Guard clause: If no input lines are provided, signal an error state.
  if (allInputLines.length === 0) {
    console.log('-1');
    return;
  }

  // Extract the first meaningful line and tokenize it by whitespace.
  const initialParameters = allInputLines[0].split(/\s+/).filter(Boolean);

  // Guard clause: Ensure the expected number of parameters (N and K) are present.
  if (initialParameters.length < 2) {
    console.log('-1');
    return;
  }

  // Parse the total count of graph nodes (vertices) from the input.
  const totalGraphNodes = parseNumericValue(initialParameters[0]);
  // Parse the desired number of node pairs that should have a shortest path of exactly two.
  const targetPathLengthTwoPairs = parseNumericValue(initialParameters[1]);

  // Handle trivial cases where a graph cannot be formed as required.
  // A graph with 2 or fewer nodes cannot have any path of length 2 between distinct non-1 nodes.
  if (totalGraphNodes <= 2) {
    console.log('-1');
    return;
  }

  // Calculate the maximum possible number of node pairs (excluding node 1)
  // that would naturally have a shortest path of two in a star-shaped graph
  // where node 1 is connected to all other nodes.
  // This is equivalent to "N-1 choose 2", i.e., combinations of 2 nodes from the N-1 non-1 nodes.
  const potentialMaxPathTwoPairs = ((totalGraphNodes - 1) * (totalGraphNodes - 2)) / 2;

  // Validate if the requested number of path-2 pairs is actually achievable.
  // If the target exceeds the theoretical maximum, it's an impossible scenario.
  if (targetPathLengthTwoPairs > potentialMaxPathTwoPairs) {
    console.log('-1');
    return;
  }

  // Initialize an array to store the list of all graph edges (connections).
  const graphEdgeList = [];

  // Step 1: Construct the base star graph.
  // Connect node 1 to every other node (from 2 up to totalGraphNodes).
  // This creates a central hub and ensures all nodes are connected.
  for (let currentVertex = 2; currentVertex <= totalGraphNodes; ++currentVertex) {
    graphEdgeList.push([1, currentVertex]);
  }

  // Determine how many path-2 pairs need to be converted to path-1 pairs
  // by adding direct edges between them.
  // Each such added edge reduces the count of path-2 pairs by one.
  const requiredEdgeAdditions = potentialMaxPathTwoPairs - targetPathLengthTwoPairs;

  // Step 2: Add supplementary edges to adjust the count of path-2 pairs.
  // These edges are added sequentially between consecutive non-1 nodes,
  // starting with (2,3), then (3,4), and so on, for the required number of times.
  for (let edgeAdditionIndex = 0; edgeAdditionIndex < requiredEdgeAdditions; ++edgeAdditionIndex) {
    const firstNodeInPair = 2 + edgeAdditionIndex;
    const secondNodeInPair = 3 + edgeAdditionIndex;
    graphEdgeList.push([firstNodeInPair, secondNodeInPair]);
  }

  // Output the total count of edges in the constructed graph.
  console.log(graphEdgeList.length);

  // Iterate through the final list of edges and print each one on a new line,
  // with the two connected nodes separated by a space.
  graphEdgeList.forEach(activeEdge => {
    console.log(`${activeEdge[0]} ${activeEdge[1]}`);
  });

})(
  // Read the entire content of the standard input stream as UTF-8 encoded text.
  require("fs").readFileSync("/dev/stdin", "utf8")
);