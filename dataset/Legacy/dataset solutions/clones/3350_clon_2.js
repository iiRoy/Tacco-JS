function ProcessInput(rawData) {
  let processedLines = rawData.split("\n");
  const nodeCount = parseInt(processedLines[0]);
  const adjacencyList = new Array(nodeCount);
  const dynamicProgrammingTable = new Array(nodeCount);
  const moduloValue = Math.pow(10, 9) + 7;

  // Construct the adjacency list from the input edges.
  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    const tempEdgeData = processedLines[edgeIndex + 1].split(" ").map(val => parseInt(val));

    // Initialize array for nodes if not already done.
    if (adjacencyList[tempEdgeData[0] - 1] === undefined) {
      adjacencyList[tempEdgeData[0] - 1] = [];
    }
    if (adjacencyList[tempEdgeData[1] - 1] === undefined) {
      adjacencyList[tempEdgeData[1] - 1] = [];
    }

    // Add bidirectional edges.
    adjacencyList[tempEdgeData[0] - 1].push(tempEdgeData[1] - 1);
    adjacencyList[tempEdgeData[1] - 1].push(tempEdgeData[0] - 1);
  }

  const visitedNodes = new Array(nodeCount).fill(0);
  let finalResult;

  // Handle the case for graphs with more than one node.
  if (nodeCount !== 1) {
    visitedNodes[0] = 1; // Mark the root node as visited.

    // Initialize DP table for leaf nodes.
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      if (adjacencyList[nodeIdx].length === 1) {
        dynamicProgrammingTable[nodeIdx] = [1, 1]; // [white_count, black_count]
        visitedNodes[nodeIdx] = 1; // Mark leaf nodes as processed.
      } else {
        dynamicProgrammingTable[nodeIdx] = [0, 0];
      }
    }

    dynamicProgrammingTable[0] = [0, 0]; // Reset root DP values for proper calculation.
    const processingStack = [0]; // Start DFS from the root.

    // Perform iterative DFS (post-order traversal) to fill DP table.
    while (processingStack.length !== 0) {
      let hasUnvisitedChild = 0;
      let whiteCombinations = 1;
      let blackCombinations = 1;
      const currentNode = processingStack[processingStack.length - 1];

      for (let neighborIdx = 0; neighborIdx < adjacencyList[currentNode].length; neighborIdx++) {
        const neighborNode = adjacencyList[currentNode][neighborIdx];

        if (visitedNodes[neighborNode] === 0) {
          visitedNodes[neighborNode] = 1;
          processingStack.push(neighborNode);
          hasUnvisitedChild = 1;
        } else {
          // If neighbor is visited, its DP values are ready.
          const totalChildCombinations = Math.max(1, (dynamicProgrammingTable[neighborNode][0] + dynamicProgrammingTable[neighborNode][1]) % moduloValue);
          const childBlackCombinations = Math.max(1, dynamicProgrammingTable[neighborNode][0]);

          whiteCombinations = (whiteCombinations * totalChildCombinations) % moduloValue;
          blackCombinations = (blackCombinations * childBlackCombinations) % moduloValue;
        }
      }

      // If all children have been processed, calculate DP for current node.
      if (hasUnvisitedChild === 0) {
        dynamicProgrammingTable[currentNode] = [whiteCombinations, blackCombinations];
        processingStack.pop();
      }
    }
    // The final answer is the sum of white and black combinations for the root.
    finalResult = (dynamicProgrammingTable[0][0] + dynamicProgrammingTable[0][1]) % moduloValue;
  } else {
    // For a single node, there are two ways to color it (white or black).
    finalResult = 2;
  }

  console.log('%s', finalResult);
  return finalResult;
}

// This function is for local debugging or testing in a browser environment.
function testSolution(testCaseIndex) {
  const testInput = document.getElementById("input" + testCaseIndex).value;
  const computedAnswer = ProcessInput(testInput);
  let testOutcome = "WA"; // Default to Wrong Answer.

  // Compare the computed result with the expected output.
  if (computedAnswer == document.getElementById("output" + testCaseIndex).value.split("\n")[0]) {
    testOutcome = "AC"; // Accepted if results match.
  }
  document.getElementById("result" + testCaseIndex).innerHTML = testOutcome;
}

// Read input from standard input and execute the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
