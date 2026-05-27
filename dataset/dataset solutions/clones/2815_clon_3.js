'use strict';

function main(inputLines) {
  const [numNodes, targetEdges] = inputLines[0].split(' ').map(Number);

  let solutionFound = false;
  let finalMValue = numNodes; // This variable will store the 'M' value that satisfies the condition

  for (let currentM = numNodes; currentM >= 1; currentM--) {
    const groupSize = numNodes - currentM + 1;
    // Calculate the number of edges from the 'L' group (complete graph part)
    const edgesInGroup = (groupSize - 1) * (groupSize - 2) / 2;
    // The total edges are edgesInGroup + (M - 1) for the path part
    if (edgesInGroup + currentM - 1 === targetEdges) {
      solutionFound = true;
      finalMValue = currentM; // Capture the 'M' value
      break;
    }
  }

  if (!solutionFound) {
    console.log(-1);
    return;
  }

  // Output the total number of edges, which is N-1
  console.log(numNodes - 1);

  // Print the first set of edges forming a path (M edges)
  for (let nodeA = 1; nodeA <= finalMValue; nodeA++) {
    console.log(`${nodeA} ${nodeA + 1}`);
  }

  // Print the second set of edges, connecting remaining nodes to a common node (M+1)
  const commonConnectionNode = finalMValue + 1;
  for (let nodeB = commonConnectionNode + 1; nodeB <= numNodes; nodeB++) {
    console.log(`${commonConnectionNode} ${nodeB}`);
  }
}

function runInputProcessor() {
  let accumulatedInput = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    accumulatedInput += chunk;
  });
  process.stdin.on("end", () => {
    main(accumulatedInput.split("\n"));
  });
}

runInputProcessor();
