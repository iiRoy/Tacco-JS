/**
 * Utility function to parse a string containing space-separated numeric values.
 * It trims whitespace, splits the string, and converts each part to a number.
 * Includes basic validation for non-numeric inputs.
 * @param {string} rawString - The input string, e.g., "  5 2 4  ".
 * @returns {number[]} An array of numerical parameters.
 */
function parseNumericParameters(rawString) {
  // Remove leading/trailing whitespace and split the string by any sequence of whitespace characters.
  const stringTokens = rawString.trim().split(/\s+/);

  // Convert each string token into a number. Using Number() for conversion.
  const numericalValues = stringTokens.map(token => {
    const parsedNum = Number(token);
    // Introduce a guard clause for non-numeric tokens.
    if (Number.isNaN(parsedNum)) {
      console.warn(`Encountered non-numeric input token: "${token}". Defaulting to 0.`);
      return 0; // Return a default value or handle error as appropriate.
    }
    return parsedNum;
  });

  return numericalValues;
}

/**
 * Computes and displays the frequency of various shortest path lengths between all
 * unique pairs of nodes in a linear graph, considering a special "teleport" route.
 * This function processes the input configuration and performs the core distance calculations.
 * @param {string[]} inputDataLines - An array of strings, where the first string holds N, X, Y.
 */
function calculatePathLengthDistributions(inputDataLines) {
  // Validate the overall input structure early.
  if (!Array.isArray(inputDataLines) || inputDataLines.length === 0) {
    console.error("Input data is missing or malformed. Cannot proceed with calculations.");
    return; // Exit if no valid input lines are provided.
  }

  // Parse the graph configuration from the first line of input.
  const graphConfiguration = parseNumericParameters(inputDataLines[0]);

  // Ensure we have the expected number of configuration parameters (N, X, Y).
  if (graphConfiguration.length < 3) {
    console.error("Insufficient configuration parameters. Expected N, X, Y.");
    return; // Exit if critical parameters are missing.
  }

  // Extract and rename the main parameters for improved readability (Type II change).
  const totalNodesInGraph = graphConfiguration[0]; // Corresponds to 'n'
  const specialWaypointA = graphConfiguration[1];   // Corresponds to 'x'
  const specialWaypointB = graphConfiguration[2];   // Corresponds to 'y'

  // Initialize an array to store the counts of path lengths.
  // The maximum possible path length is (totalNodesInGraph - 1).
  // Using Array.prototype.fill() is a Type III structural change for initialization.
  const pathLengthFrequencies = Array(totalNodesInGraph - 1).fill(0);

  // Add a guard clause to check for valid node counts.
  if (totalNodesInGraph <= 1) {
    console.log("Graph must have at least 2 nodes to calculate path lengths.");
    // If totalNodesInGraph is 1, pathLengthFrequencies will be empty, so no output loop needed.
    return;
  }

  // Iterate through all distinct pairs of nodes (firstNode, secondNode).
  // Node indices are 1-based as per the problem description.
  for (let firstNode = 1; firstNode <= totalNodesInGraph; ++firstNode) { // Renamed 'i' to 'firstNode'
    for (let secondNode = firstNode + 1; secondNode <= totalNodesInGraph; ++secondNode) { // Renamed 'j' to 'secondNode'

      // Calculate the direct path length between the two nodes.
      // Using a ternary operator instead of Math.abs for Type III equivalence.
      const directPathLength = (secondNode > firstNode) ? (secondNode - firstNode) : (firstNode - secondNode);

      // Calculate the alternative path length via the special waypoints A and B.
      // This path is: firstNode -> A -> B -> secondNode.
      // Breaking down the calculation into intermediate steps for Type III clarity.
      const distanceToWaypointA = Math.abs(specialWaypointA - firstNode);
      const distanceFromWaypointB = Math.abs(specialWaypointB - secondNode);
      const waypointBridgeLength = 1; // The fixed distance between waypoint A and B.

      const alternativePathLength = distanceToWaypointA + waypointBridgeLength + distanceFromWaypointB;

      // Determine the minimum of the two calculated path lengths.
      // Using a ternary operator for Type III equivalence to Math.min().
      const actualPathLength = (directPathLength < alternativePathLength) ? directPathLength : alternativePathLength;

      // Increment the counter for the determined path length.
      // Path lengths are 1-based, array indices are 0-based, so subtract 1.
      // Add a guard to ensure the path length is within valid bounds before incrementing.
      if (actualPathLength > 0 && actualPathLength <= pathLengthFrequencies.length) {
        pathLengthFrequencies[actualPathLength - 1]++;
      } else {
        // This log serves as a Type III diagnostic addition for unexpected path lengths.
        console.warn(`Calculated path length ${actualPathLength} for nodes (${firstNode},${secondNode}) is out of expected range.`);
      }
    }
  }

  // Output the frequency of each path length.
  // Renamed loop variable 'k' for Type II.
  // Changed loop condition to iterate over array length for Type III.
  for (let k = 0; k < pathLengthFrequencies.length; ++k) {
    console.log(pathLengthFrequencies[k]);
  }
}

/**
 * Orchestrates the input reading from stdin and triggers the main calculation.
 * This function acts as the entry point for the script when run.
 * It uses a robust method for reading from the standard input.
 */
function executeSolution() {
  // Attempt to read the entire content from standard input.
  // The 'require' call is typically global for Node.js scripts.
  try {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Process the raw content: trim leading/trailing whitespace and split into lines.
    // Filtering out empty lines ensures robustness against blank lines in input.
    const processedInputLines = rawInputContent.trim().split(/\r?\n/).filter(line => line.length > 0);

    // Invoke the core logic with the prepared input lines.
    calculatePathLengthDistributions(processedInputLines);
  } catch (error) {
    // Type III addition: comprehensive error handling for input reading.
    console.error("An error occurred while reading or processing input:", error.message);
    // Optionally, could log stack trace or provide more context.
  }
}

// Execute the main solution function to start the program.
executeSolution();