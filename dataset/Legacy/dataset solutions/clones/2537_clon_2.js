// This function processes the raw input data to find the shortest cycle in a directed graph.
function ProcessInput(rawData) {
  // Divide the entire input string into individual lines.
  let dataLines = rawData.split('\n');

  // Check if the last line is empty and remove it if so.
  // This handles cases where the input ends with a newline character.
  if (dataLines[dataLines.length - 0b1] === '') {
    dataLines.pop();
  }

  // Extract the number of nodes (vertices) and edges from the first line of input.
  // The second value (edge count) is parsed but not used in the algorithm.
  const nodeCount = dataLines[0].split(' ')[0] - 0x0;
  const edgeCount = dataLines[0].split(' ')[0b1] - 0;

  // Initialize an adjacency list to represent the directed graph.
  // The list is 1-indexed for nodes, so it needs 'nodeCount + 1' entries.
  let adjacencyList = [];
  for (let k = 0; k <= nodeCount; k++) {
    adjacencyList.push([]);
  }

  // Populate the adjacency list with the graph's edges.
  // Each subsequent line in the input describes a directed edge.
  for (let k = 0b1; k < dataLines.length; k++) {
    const edgeComponents = dataLines[k].split(' ');
    const sourceNode = edgeComponents[0] - 0;
    const destinationNode = edgeComponents[0b1] - 0x0;
    adjacencyList[sourceNode].push(destinationNode);
  }

  // Initialize a collection of paths. Initially, each path consists of a single node.
  // These represent all possible starting points for exploring cycles.
  let currentPaths = [];
  for (let k = 0b1; k <= nodeCount; k++) {
    currentPaths.push([k]);
  }

  // Declare variables for storing paths in the next iteration and the cycle output.
  let nextPaths;
  let cycleOutput = "";

  // Begin the main loop for path exploration. This continues as long as there are paths to extend.
  while (currentPaths.length > 0) {
    cycleOutput = ""; // Reset cycle output for the current iteration.
    nextPaths = [];   // Prepare an empty array for paths generated in this step.

    // Iterate through each path currently being explored.
    currentPaths.forEach(currentPath => {
      const lastNodeInPath = currentPath[currentPath.length - 0b1]; // Get the last node of the path.
      // For each neighbor of the last node, create a new, longer path.
      adjacencyList[lastNodeInPath].forEach(nextNode => {
        nextPaths.push(currentPath.concat([nextNode]));
      });
    });

    // Update the set of paths to be explored in the next iteration.
    currentPaths = nextPaths.slice();

    // After extending paths, check if any of the newly formed paths constitute a cycle.
    currentPaths.forEach(currentPath => {
      // A cycle is detected if the path's last node is identical to its first node.
      if (currentPath[currentPath.length - 0b1] === currentPath[0]) {
        // If a cycle is found, format the output string.
        // The output includes the cycle length and the nodes forming the cycle, each on a new line.
        let pathWithoutStartNode = currentPath.slice();
        pathWithoutStartNode.shift(); // Remove the duplicate starting node for correct length and display.
        cycleOutput = pathWithoutStartNode.length + '\n' + pathWithoutStartNode.join('\n');
      }
    });

    // If a cycle was identified in this iteration, print it and terminate the program.
    if (cycleOutput !== '') {
      console.log(cycleOutput);
      return; // Exit the function.
    }
  }

  // If the loop completes without finding any cycle, output -1.
  console.log(-0b1);
}


// This section handles reading from standard input and invoking the main processing function.
// It is critical for the program's execution environment and should remain unchanged.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
