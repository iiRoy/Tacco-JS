function ProcessInput(rawData) {
  // Divide the incoming raw data string into an array of separate lines.
  const inputLines = rawData.split("\n");

  // Extract the first line, convert it to a numerical value, which represents the total count of nodes.
  const nodeCount = Number(inputLines.shift());

  // Initialize an object to hold specific values or weights for each node.
  // Node identifiers (from 1 up to nodeCount) will serve as keys, with initial values set to zero.
  const vertexValues = {};
  for (let iterator = 1; iterator <= nodeCount; iterator++) {
    vertexValues[iterator] = 0;
  }

  // Iterate through the remaining lines, treating each as an edge definition.
  // The very last line is excluded from this loop as it contains assignment values, not edges.
  for (let lineIndex = 0; lineIndex < inputLines.length - 1; lineIndex++) {
    // Split the current line by spaces to obtain the two node identifiers that form an edge.
    const edgePair = inputLines[lineIndex].split(' ');

    // Increment the counter for both nodes involved in the current edge within the vertexValues object.
    vertexValues[edgePair[0]] = vertexValues[edgePair[0]] + 1;
    vertexValues[edgePair[1]] = vertexValues[edgePair[1]] + 1;
  }

  // Retrieve all the keys (node identifiers) from the vertexValues object.
  // Sort these keys based on their corresponding numerical values stored in vertexValues, in ascending order.
  const orderedNodes = Object.keys(vertexValues).sort((valA, valB) => {
    return vertexValues[valA] - vertexValues[valB];
  });

  // Access the final line of the input, split it by spaces, and then sort the resulting
  // string values numerically in ascending order. These are the values that will be assigned to nodes.
  const assignedValues = inputLines[inputLines.length - 1].split(' ').sort((elem1, elem2) => {
    return Number(elem1) - Number(elem2);
  });

  // Assign the numerically sorted 'assignedValues' to the 'vertexValues' object.
  // The assignment uses the 'orderedNodes' (sorted by their initial counts) as the target keys.
  for (let assignmentIndex = 0; assignmentIndex < orderedNodes.length; assignmentIndex++) {
    vertexValues[orderedNodes[assignmentIndex]] = assignedValues[assignmentIndex];
  }

  // Declare and initialize a variable to accumulate the final computed sum.
  let totalScore = 0;

  // Re-traverse the lines that define edges (again, excluding the last line of input).
  for (let edgeLineIdx = 0; edgeLineIdx < inputLines.length - 1; edgeLineIdx++) {
    // Split the current edge line to extract the two connected node identifiers.
    const currentEdge = inputLines[edgeLineIdx].split(' ');

    // Add the minimum of the re-assigned values of the two connected nodes to the running total score.
    totalScore += Math.min(vertexValues[currentEdge[0]], vertexValues[currentEdge[1]]);
  }

  // Output the first part of the result: the calculated total score.
  // The value is explicitly converted to a string for output consistency.
  console.log(String(totalScore));

  // Construct the second part of the output: a space-separated sequence of the final node values.
  // Begin with the value associated with node 1.
  let nodeValueOutput = vertexValues[1];

  // Append the values for subsequent nodes (from node 2 up to the total number of nodes)
  // to the output string, separated by spaces.
  for (let nodeIdx = 2; nodeIdx <= orderedNodes.length; nodeIdx++) {
    nodeValueOutput = nodeValueOutput + ' ' + vertexValues[nodeIdx];
  }

  // Print the complete space-separated list of final node values.
  console.log(nodeValueOutput);
}

// Read the entire content from standard input as a UTF-8 string, then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
