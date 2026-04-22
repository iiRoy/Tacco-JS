/* This script processes graph-like data to find the maximum possible score
   by traversing nodes, considering cycles and a maximum number of steps. */
let rawData = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`;

const textRows = rawData.split('\n');

let [nodeCount, maxSteps] = textRows[0].split(' ').map(Number);
const nextNodes = textRows[1].split(' ').map(Number);
const nodeValues = textRows[2].split(' ').map(Number);

// Add a placeholder at index 0 for 1-based indexing of nodes.
nextNodes.unshift(null);
nodeValues.unshift(null);

const calculateMaxScore = (initialNode) => {
  const visitedNodes = {}; // An object to keep track of nodes visited in the current path.
  let currentNode = initialNode;
  let currentPathSum = 0;
  let highestScoreAchieved = -1_000_000_000; // Initialize with a sufficiently low value.
  let cycleDetected = false;
  let stepCounter = 0;

  // First phase: Traverse up to maxSteps or until a loop is identified.
  for (stepCounter; stepCounter < maxSteps; stepCounter++) {
    visitedNodes[currentNode] = true; // Mark the current node as visited.
    currentNode = nextNodes[currentNode]; // Move to the subsequent node.
    currentPathSum += nodeValues[currentNode]; // Accumulate the value of the new node.
    highestScoreAchieved = Math.max(highestScoreAchieved, currentPathSum); // Update the maximum score encountered.

    if (visitedNodes[currentNode]) { // If the next node has been seen in this path, a cycle is confirmed.
      cycleDetected = true;
      break;
    }
  }

  // If no cycle was found within the allowed steps, simply return the highest score.
  if (!cycleDetected) {
    return highestScoreAchieved;
  }

  // If a cycle was detected, but its cumulative sum is negative, repeating it would reduce the score.
  if (currentPathSum < 0) {
    return highestScoreAchieved;
  }

  // If a cycle was detected and its sum is positive, calculate how many full cycles can be completed.
  const cycleLength = stepCounter + 1; // 'stepCounter' is the index of the last step, so length is index + 1.
  const fullCycleRuns = maxSteps % cycleLength === 0 ? Math.floor(maxSteps / cycleLength) - 1 : Math.floor(maxSteps / cycleLength);

  // Prepare for calculating the score from the remaining steps after full cycles.
  currentNode = initialNode;
  let remainderPathSum = 0;
  let remainderHighestScore = -1_000_000_000;
  let remainderSteps = maxSteps % cycleLength; // The number of steps left after completing whole cycles.
  let remainderStepIndex = 0; // Local counter for the remainder steps.

  // Traverse the remaining steps within the identified cycle.
  for (remainderStepIndex; remainderStepIndex < remainderSteps; remainderStepIndex++) {
    currentNode = nextNodes[currentNode];
    remainderPathSum += nodeValues[currentNode];
    remainderHighestScore = Math.max(remainderHighestScore, remainderPathSum);
  }

  // Return the maximum of two scenarios:
  // 1. (fullCycleRuns - 1) full cycles + the highest score achieved during the initial traversal (before the last full cycle).
  // 2. (fullCycleRuns) full cycles + the highest score achieved during the remainder steps.
  return Math.max(currentPathSum * (fullCycleRuns - 1) + highestScoreAchieved, currentPathSum * fullCycleRuns + remainderHighestScore);
};

let finalResult = -1_000_000_000; // Global variable to store the overall maximum score.
// Iterate through each possible starting node from 1 to nodeCount.
for (let initialNode = 1; initialNode <= nodeCount; initialNode++) {
  finalResult = Math.max(finalResult, calculateMaxScore(initialNode));
}

console.log(finalResult); // Print the ultimate maximum score found.

// Note: Traversal always executes at least once, and node values can be negative.