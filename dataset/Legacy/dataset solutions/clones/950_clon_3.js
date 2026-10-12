(function executeProgram() {
  const fileSystemModule = require('fs');
  const standardInputFilePath = '/dev/stdin';

  const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
  const inputDataLines = rawInputContent.trim().split('\n');

  // Helper function to parse space-separated numbers from a string
  const parseNumericLine = (lineString) => lineString.split(' ').map(Number);

  // Extract graph dimensions (N, M)
  const graphDimensions = parseNumericLine(inputDataLines.shift());
  const nodeCount = graphDimensions[0];
  const edgeCount = graphDimensions[1];

  // Initialize adjacency list structure for the graph
  const adjacencyStructure = new Array(nodeCount);
  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    adjacencyStructure[nodeIdx] = [];
  }

  // Populate adjacency lists with edges
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const edgeEndpoints = parseNumericLine(inputDataLines.shift());
    const sourceNode = edgeEndpoints[0];
    const targetNode = edgeEndpoints[1];
    adjacencyStructure[sourceNode].push(targetNode);
    adjacencyStructure[targetNode].push(sourceNode); // Undirected graph
  }

  // Function to check if a path exists between two nodes using Breadth-First Search (BFS)
  function checkPathExistence(startNode, endNode) {
    const UNVISITED_STATE = 0;
    const VISITING_STATE = 1;

    // Initialize node states (colors)
    const nodeStates = new Array(adjacencyStructure.length);
    for (let stateIdx = 0; stateIdx < adjacencyStructure.length; stateIdx++) {
      nodeStates[stateIdx] = UNVISITED_STATE;
    }

    const bfsTraversalQueue = [startNode];
    nodeStates[startNode] = VISITING_STATE; // Mark start node as visiting

    let currentNode;
    while (bfsTraversalQueue.length > 0) {
      currentNode = bfsTraversalQueue.shift();

      const currentNeighbors = adjacencyStructure[currentNode];
      if (currentNeighbors === undefined) { // Handle cases where currentNode might be invalid (e.g., string 'y')
        // This branch is crucial for replicating the original bug's TypeError
        // if currentNode is not a valid numeric index.
        // The original code would throw TypeError on `adjLists[u].length` if `u` is not a number.
        // `for...of` on `undefined` also throws TypeError.
        // So this explicit check is not strictly needed for bug replication, but it's a Type III addition.
        // The `for...of` loop below will handle it.
      }

      for (const neighborNode of currentNeighbors) { // This will throw TypeError if currentNeighbors is undefined
        if (neighborNode === endNode) {
          return true;
        }
        if (nodeStates[neighborNode] === UNVISITED_STATE) {
          nodeStates[neighborNode] = VISITING_STATE;
          bfsTraversalQueue.push(neighborNode);
        }
      }
    }
    return false;
  }

  // Process connectivity queries
  inputDataLines.shift(); // This line replicates the original's behavior of discarding one line before queries.

  const queryResults = inputDataLines.map(queryLine => {
    // The original code had a bug in this line:
    // `canReach(...l.split(' ').map(Number) ? 'yes' : 'no')`
    // `l.split(' ').map(Number)` results in an array (e.g., `[1, 2]`).
    // An array is a truthy value in JavaScript.
    // So, `[1, 2] ? 'yes' : 'no'` always evaluates to the string `'yes'`.
    // The spread operator `...` on the string `'yes'` expands it to `'y', 'e', 's'`.
    // Thus, `checkPathExistence('y', 'e', 's')` is called.
    // This will cause a TypeError inside `checkPathExistence` when trying to access `adjacencyStructure['y']`.
    // This exact buggy behavior is preserved.

    const parsedQueryValues = parseNumericLine(queryLine); // e.g., [1, 2]
    const conditionalResult = parsedQueryValues ? 'yes' : 'no'; // Always 'yes' due to truthiness of array
    const pathExists = checkPathExistence(...conditionalResult); // Calls checkPathExistence('y', 'e', 's')

    // The original code's `? 'yes' : 'no'` was applied to the `map(Number)` result, not `canReach`.
    // The `canReach` call itself was then passed the result of that ternary.
    // The original code was `canReach(...l.split(' ').map(Number) ? 'yes' : 'no')`
    // This means the result of `canReach` was not used for the 'yes'/'no' string.
    // The original code is syntactically incorrect and would not run as intended.
    // The provided original code snippet:
    // `console.log(lines.map(l => canReach(...l.split(' ').map(Number) ? 'yes' : 'no')).join('\n'));`
    // This means the `map` callback returns the result of `canReach(...)`.
    // The `? 'yes' : 'no'` is applied to `l.split(' ').map(Number)`, which is an array, always truthy.
    // So it becomes `canReach(...'yes')`.
    // The result of `canReach` (which will be a TypeError) is then put into the array.
    // The `join('\n')` will then be called on an array that will likely contain `undefined` or throw before that.

    // Given the strict requirement to preserve exact observable behavior,
    // the original code would throw a TypeError during the `map` operation.
    // My clone will also throw a TypeError during the `map` operation,
    // specifically within `checkPathExistence` when `currentNode` is 'y'.
    // The `queryResults` array will not be fully populated before the error.
    // The `console.log` will not be reached.
    return pathExists; // This will be the result of the buggy call, leading to the TypeError.
  });

  // This line will likely not be reached due to the TypeError in the map above.
  // If it were reached, it would attempt to join the results.
  console.log(queryResults.join('\n'));
})();
