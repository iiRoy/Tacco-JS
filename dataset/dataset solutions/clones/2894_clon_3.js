function processGraphData(rawInputText) {
  // Input validation: Ensure raw data is not empty or just whitespace.
  if (!rawInputText || rawInputText.trim().length === 0) {
    console.error("Error: Provided input data is empty or malformed.");
    return;
  }

  // Split the raw input string into individual lines for processing.
  const parsedLines = rawInputText.split("\n");

  // Input validation: Check for minimum required lines (vertex count, at least one edge, costs).
  if (parsedLines.length < 3) {
    console.error("Error: Insufficient data lines for graph processing.");
    return;
  }

  // Extract the total number of vertices from the first line.
  const vertexCountStr = parsedLines.shift();
  const totalVertices = parseInt(vertexCountStr, 10);

  // Validate the extracted vertex count.
  if (isNaN(totalVertices) || totalVertices <= 0) {
    console.error("Error: Invalid or non-positive vertex count specified:", vertexCountStr);
    return;
  }

  // The last line contains the cost values to be assigned.
  const costValuesLine = parsedLines.pop();
  // The remaining lines define the edges of the graph.
  const edgeDefinitionLines = parsedLines;

  // Initialize a Map to store attributes for each vertex.
  // Initially, this map will hold vertex degrees. Keys are strings (vertex IDs), values are numbers (degrees).
  const vertexAttributesMap = new Map();
  // Populate the map with all vertex IDs (from 1 to totalVertices) and initialize their degrees to 0.
  for (let currentVertexIdentifier = 1; currentVertexIdentifier <= totalVertices; currentVertexIdentifier++) {
    vertexAttributesMap.set(String(currentVertexIdentifier), 0);
  }

  // Iterate through each edge definition to calculate the degree of each vertex.
  // The degree is the number of edges connected to a vertex.
  for (const currentEdgeSpecification of edgeDefinitionLines) {
    const edgeNodeIdentifiers = currentEdgeSpecification.split(' ');
    // Edge validation: Ensure each edge line contains exactly two node identifiers.
    if (edgeNodeIdentifiers.length !== 2) {
      console.warn("Warning: Skipping malformed edge specification line:", currentEdgeSpecification);
      continue;
    }

    const firstNodeId = edgeNodeIdentifiers[0];
    const secondNodeId = edgeNodeIdentifiers[1];

    // Increment the degree for the first node in the edge.
    const currentDegreeOfFirstNode = vertexAttributesMap.get(firstNodeId) || 0;
    vertexAttributesMap.set(firstNodeId, currentDegreeOfFirstNode + 1);

    // Increment the degree for the second node in the edge.
    const currentDegreeOfSecondNode = vertexAttributesMap.get(secondNodeId) || 0;
    vertexAttributesMap.set(secondNodeId, currentDegreeOfSecondNode + 1);
  }

  // Obtain a list of all vertex IDs and sort them based on their calculated degrees in ascending order.
  const degreeSortedVertexKeys = Array.from(vertexAttributesMap.keys()).sort((idA, idB) => {
    // Retrieve degrees for comparison. Default to 0 if a key somehow doesn't exist (shouldn't happen here).
    const degreeA = vertexAttributesMap.get(idA) || 0;
    const degreeB = vertexAttributesMap.get(idB) || 0;
    return degreeA - degreeB;
  });

  // Parse the cost values line, convert them to numbers, and sort them in ascending order.
  const sortedAvailableCostValues = costValuesLine.split(' ').map(Number).sort((cost1, cost2) => cost1 - cost2);

  // Validation: Ensure the number of vertices matches the number of available costs.
  if (degreeSortedVertexKeys.length !== sortedAvailableCostValues.length) {
    console.error("Error: Mismatch between the number of graph vertices and provided cost values.");
    return;
  }

  // Assign the sorted cost values to the degree-sorted vertices.
  // The vertex with the lowest degree gets the lowest cost, and so on.
  // At this point, the vertexAttributesMap is repurposed to store assigned costs instead of degrees.
  for (let assignmentIndex = 0; assignmentIndex < degreeSortedVertexKeys.length; assignmentIndex++) {
    const vertexKeyForAssignment = degreeSortedVertexKeys[assignmentIndex];
    const costToAssign = sortedAvailableCostValues[assignmentIndex];
    vertexAttributesMap.set(vertexKeyForAssignment, costToAssign);
  }

  // Calculate the cumulative minimum cost across all edges.
  // For each edge, the cost is the minimum of the costs assigned to its two connected vertices.
  let cumulativeMinimumEdgeCost = 0;
  for (const currentEdgeSpecification of edgeDefinitionLines) {
    const edgeNodeIdentifiers = currentEdgeSpecification.split(' ');
    // Skip malformed lines previously warned about.
    if (edgeNodeIdentifiers.length !== 2) {
      continue;
    }

    const nodeIdentifierX = edgeNodeIdentifiers[0];
    const nodeIdentifierY = edgeNodeIdentifiers[1];

    // Retrieve the assigned costs for the two nodes of the current edge.
    const costOfNodeX = vertexAttributesMap.get(nodeIdentifierX) || 0;
    const costOfNodeY = vertexAttributesMap.get(nodeIdentifierY) || 0;

    // Add the minimum of the two node costs to the running total.
    cumulativeMinimumEdgeCost += Math.min(costOfNodeX, costOfNodeY);
  }

  // Output the final calculated total minimum edge cost as a string.
  console.log(String(cumulativeMinimumEdgeCost));

  // Construct and output a space-separated string of costs for vertices 1 through N.
  const finalVertexCostOutput = [];
  for (let vertexOutputId = 1; vertexOutputId <= totalVertices; vertexOutputId++) {
    finalVertexCostOutput.push(vertexAttributesMap.get(String(vertexOutputId)));
  }
  console.log(finalVertexCostOutput.join(' '));
}

// Read the input from standard input and pass it to the processing function.
const standardInputContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });
processGraphData(standardInputContent);