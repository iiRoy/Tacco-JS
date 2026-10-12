"use strict";

const processInput = function (rawData) {
  const inputLines = rawData.split('\n');
  const nodeCountStr = inputLines[0];
  const nodeCount = Number.parseInt(nodeCountStr, 10);

  const connections = [];
  for (let idx = 1; idx <= nodeCount; idx++) {
    const nodeValueStr = inputLines[idx];
    connections.push(Number.parseInt(nodeValueStr, 10));
  }

  const initialNode = 1;
  let currentDestinationNode = connections[initialNode - 1]; // This is the 'next' node after starting at 'initialNode'
  
  const visitedNodesInPath = [];
  visitedNodesInPath.push(initialNode); // The starting node is considered visited

  let targetNodeReached = false;
  let pathStepCount = 0;

  // Helper function to check if a node has been visited
  const hasVisited = (nodeVal, visitedArr) => visitedArr.includes(nodeVal);

  // Main traversal loop
  // The loop continues as long as the current destination node is not the initial node (1)
  while (currentDestinationNode !== initialNode) {
    pathStepCount++; // Increment step count for the transition to currentDestinationNode

    // Move to the next node in the sequence
    // The value at connections[currentDestinationNode - 1] is the *next* node to visit
    const nextNodeInSequence = connections[currentDestinationNode - 1];
    currentDestinationNode = nextNodeInSequence;

    // Check if the target node (2) is reached *after* moving to currentDestinationNode
    if (currentDestinationNode === 2) {
      targetNodeReached = true;
      break;
    }

    // Check for cycles *after* moving to currentDestinationNode
    if (hasVisited(currentDestinationNode, visitedNodesInPath)) {
      // Cycle detected, cannot reach target 2 without looping
      break;
    } else {
      visitedNodesInPath.push(currentDestinationNode); // Mark currentDestinationNode as visited
    }
  }

  if (targetNodeReached) {
    console.log(pathStepCount + 1);
  } else {
    console.log(-1);
  }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
