"use strict"; // Enforce strict parsing and error handling

// Function to process incoming raw data
function ProcessInputData(rawDataString) {
  // Split the entire input string into an array of individual line segments
  let lineSegments = rawDataString.split("\n");

  // Initialize an array to store numeric pairs representing node connections
  let nodeConnections = [];

  // Define a constant for the number of connection pairs expected
  const NUM_CONNECTIONS = 3;

  // Loop through the first few lines to parse connection data
  for (let idx = 0; idx < NUM_CONNECTIONS; idx++) {
    // For each line, split by whitespace, then convert each part to a number
    // and add the resulting pair to our connections list
    nodeConnections.push(
      lineSegments[idx]
        .split(/\s/)
        .map((strVal) => Number(strVal)) // Explicitly convert string to number
    );
  }

  // Define a constant for the initial degree count
  const INITIAL_DEGREE = 0;
  // Initialize an array to keep track of the degree (number of connections) for each node.
  // Assuming node IDs are 0-4, so an array of size 5 (indices 0-4) is needed.
  const MAX_NODE_ID_PLUS_ONE = 5;
  let nodeDegreeCounts = new Array(MAX_NODE_ID_PLUS_ONE).fill(INITIAL_DEGREE);

  // Define a constant for incrementing degree counts
  const DEGREE_INCREMENT = 1;

  // Iterate through the parsed node connections to tally degrees
  for (let rowIdx = 0; rowIdx < NUM_CONNECTIONS; rowIdx++) {
    // Increment the degree count for the first node in the current pair
    nodeDegreeCounts[nodeConnections[rowIdx][0]] += DEGREE_INCREMENT;

    // Increment the degree count for the second node in the current pair
    nodeDegreeCounts[nodeConnections[rowIdx][1]] += DEGREE_INCREMENT;
  }

  // Define the degree value that is considered forbidden
  const FORBIDDEN_DEGREE = 3;

  // Check if every node's degree count is NOT equal to the forbidden degree
  let allDegreesValid = nodeDegreeCounts.every(function (currentDegree) {
    return currentDegree !== FORBIDDEN_DEGREE;
  });

  // Define response strings
  const POSITIVE_RESPONSE = "YES";
  const NEGATIVE_RESPONSE = "NO";

  // Output the result based on the degree validation
  console.log(allDegreesValid ? POSITIVE_RESPONSE : NEGATIVE_RESPONSE);
}

// Execute the main processing function by reading input from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));