const fileSystem = require("fs");

// Utility function to parse a space-separated string of numbers into an array of numbers.
// This replaces the functionality of `myconv(line, 4)` from the original.
const extractNumericSequence = (rawText) => rawText.split(" ").map(Number);

// The main function encapsulating the program's logic.
// This replaces the `Main()` function from the original.
function evaluateSolution() {
  // Read all input from standard in at once and split it into individual lines.
  // This replaces the custom iterator `obj` and its `next()` method.
  const dataLines = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");

  // Parse the first line to get the total node count (N) and edge count (M).
  // This replaces `var one = nextIntArray(); var N = one[0]; var M = one[1];`
  const [nodeCount, edgeCount] = extractNumericSequence(dataLines[0]);

  // Use plain JavaScript objects as hash maps to store connections.
  // This provides similar O(1) average-case lookup performance as `Set`,
  // but uses a different syntax and underlying data structure.
  // This replaces `var fromOne = new Set();`
  const initialConnections = {}; // Stores nodes 'X' reachable directly from node 1 (i.e., (1, X)).
  // This replaces `var toN = new Set();`
  const terminalConnections = {}; // Stores nodes 'X' that can reach the target node N (i.e., (X, N)).

  // Iterate through the lines describing the edges.
  // This replaces the `for(var i = 0; i < M; i++)` loop in the original.
  for (let edgeIndex = 1; edgeIndex <= edgeCount; edgeIndex++) {
    // Parse each edge line into its start and end nodes.
    // This replaces `var tmp = nextIntArray();`
    const [startNode, endNode] = extractNumericSequence(dataLines[edgeIndex]);

    // Populate the connection hash maps based on the edge's properties.
    if (startNode === 1) {
      initialConnections[endNode] = true; // Mark 'endNode' as reachable from 1.
    }
    if (endNode === nodeCount) {
      terminalConnections[startNode] = true; // Mark 'startNode' as able to reach N.
    }
  }

  let directPathExists = false; // Flag to indicate if a 1 -> X -> N path is found.

  // Iterate over the nodes that can reach the target node N (from 'terminalConnections').
  // For each such node, check if it can also be reached directly from node 1 (in 'initialConnections').
  // This replaces iterating `toNlist` and checking `fromOne.has()`.
  for (const intermediateNode in terminalConnections) {
    if (initialConnections[intermediateNode]) {
      // If an 'intermediateNode' exists in both collections, a 1 -> X -> N path is found.
      directPathExists = true;
      break; // No need to check further.
    }
  }

  // Output the final result to standard output.
  // This replaces `myout("POSSIBLE")` or `myout("IMPOSSIBLE")`.
  console.log(directPathExists ? "POSSIBLE" : "IMPOSSIBLE");
}

// Invoke the main solution function to start execution.
evaluateSolution();