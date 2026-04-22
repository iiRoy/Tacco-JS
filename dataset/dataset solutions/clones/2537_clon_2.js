// This function orchestrates the graph cycle detection process.
function ExecuteGraphTraversal(sourceText)
{
  // Split the entire input into individual lines.
  sourceText = sourceText.split("\n");

  // Remove the last line if it's empty, a common occurrence with standard input.
  if (sourceText[sourceText.length - 1] === '')
  {
    sourceText.pop();
  }

  // Extract the total number of nodes and edges from the first line.
  // The '-0' converts the string parts to numbers.
  const nodeCount = sourceText[0].split(' ')[0] - 0;
  const connectionTotal = sourceText[0].split(' ')[1] - 0;

  // Initialize an adjacency list to store graph connections.
  // It's an array of arrays, representing outgoing edges from each node.
  let adjacencyList = [];
  for (let loopVar = 0; loopVar <= nodeCount; loopVar++)
  {
    adjacencyList.push([]);
  }

  // Populate the adjacency list with the provided edge information.
  // Each subsequent line in the input describes an edge.
  for (let loopVar = 1; loopVar < sourceText.length; loopVar++)
  {
    const parts = sourceText[loopVar].split(' ');
    const originNode = parts[0] - 0;
    const terminalNode = parts[1] - 0;
    adjacencyList[originNode].push(terminalNode);
  }

  // Initialize a queue to store paths being explored.
  // Each element in this queue is an array representing a path.
  let pathQueue = [];
  for (let loopVar = 1; loopVar <= nodeCount; loopVar++)
  {
    pathQueue.push([loopVar]); // Start each path from a single node.
  }

  // Variables to hold temporary path candidates and the final cycle string.
  let candidateRoutes;
  let cycleDescription = '';

  // Begin the breadth-first-search like traversal to find a cycle.
  while (pathQueue.length > 0)
  {
    cycleDescription = ''; // Reset cycle string for each iteration.
    candidateRoutes = []; // Reset temporary storage for next level paths.

    // For each path currently in the queue:
    pathQueue.forEach(currentPath =>
    {
      const lastNodeInPath = currentPath[currentPath.length - 1];

      // Explore all possible next nodes from the last node of the current path.
      adjacencyList[lastNodeInPath].forEach(destinationNode =>
      {
        candidateRoutes.push(currentPath.concat([destinationNode])); // Extend the path.
      });
    });

    // Update the path queue with the newly generated paths.
    pathQueue = candidateRoutes.slice(); // Deep copy for next iteration.

    // Check if any of the new paths form a cycle.
    pathQueue.forEach(currentPath =>
    {
      // A cycle is found if the last node in the path is the same as the first node.
      if (currentPath[currentPath.length - 1] === currentPath[0])
      {
        let actualCycle = currentPath.slice(); // Create a copy.
        actualCycle.shift(); // Remove the duplicate starting node.
        cycleDescription = actualCycle.length + "\n" + actualCycle.join("\n"); // Format the output.
      }
    });

    // If a cycle was found in this iteration, print it and exit.
    if (cycleDescription !== '')
    {
      console.log(cycleDescription);
      return;
    }
  }

  // If the loop completes without finding any cycle, output -1.
  console.log(-1);
}

// The following line is for standard input/output handling and should not be modified by the user.
ExecuteGraphTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));