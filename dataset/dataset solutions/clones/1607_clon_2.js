// This script processes node paths and values to find the maximum possible score.
// It reads input from stdin, parses node connections and associated values,
// then calculates the highest score achievable by traversing up to K steps
// starting from any node.

const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read all input data as a string
const dataRows = rawData.split('\n'); // Split the input string into an array of lines

// Parse the first line for N (number of nodes) and K (maximum steps allowed)
let [nodeCount, maxSteps] = dataRows[0].split(' ').map(Number);

// Parse the second line for P (next node in the path for each node)
const nextNodes = dataRows[1].split(' ').map(Number);

// Parse the third line for C (value associated with each node)
const nodeValues = dataRows[2].split(' ').map(Number);

// Add a null placeholder at the beginning of arrays to make them 1-indexed,
// matching problem description (nodes typically 1 to N).
nextNodes.unshift(null);
nodeValues.unshift(null);

/**
 * Calculates the maximum score achievable starting from a given node
 * within a maximum number of steps. It handles cycles efficiently.
 * @param {number} initialNode - The starting node for the traversal.
 * @returns {number} The maximum score obtained.
 */
const calculateMaxScore = (initialNode) => {
    // Keep track of visited nodes in the current path to detect cycles.
    const visitedPath = {};
    let currentNode = initialNode;
    let currentPathSum = 0; // Accumulates the sum of node values along the path.
    let maxPathScore = -1e9; // Stores the maximum score encountered so far in this path.
    let loopDetected = false; // Flag to indicate if a cycle has been found.
    let stepCounter = 0; // Counts the steps taken.

    // Traverse the path for up to maxSteps, or until a loop is detected.
    for (stepCounter; stepCounter < maxSteps; stepCounter++) {
        visitedPath[currentNode] = true; // Mark the current node as visited.
        currentNode = nextNodes[currentNode]; // Move to the next node.
        currentPathSum += nodeValues[currentNode]; // Add the value of the new current node to the sum.
        maxPathScore = Math.max(maxPathScore, currentPathSum); // Update the maximum score if current sum is higher.

        // If the next node is already in the visited path, a loop is detected.
        if (visitedPath[currentNode]) {
            loopDetected = true;
            break; // Exit the loop as we've found a cycle.
        }
    }

    // If no loop was detected within K steps, the maxPathScore is the answer.
    if (!loopDetected) {
        return maxPathScore;
    }

    // If a loop was detected but the sum of the loop is negative,
    // it's always better to stop before completing the loop multiple times.
    // So, the max score is simply the peak reached before the loop repeats.
    if (currentPathSum < 0) {
        return maxPathScore;
    }

    // Calculate how many full times the loop can be traversed.
    // The `stepCounter + 1` represents the length of the path segment that forms the loop.
    const fullLoopIterations = maxSteps % (stepCounter + 1) ? Math.floor(maxSteps / (stepCounter + 1)) : maxSteps / (stepCounter + 1) - 1;

    // Now, calculate the score for the remaining steps after traversing the loop multiple times.
    let tempNode = initialNode;
    let remainingPathSum = 0;
    let maxRemainingPathScore = -1e9;
    let remainingSteps = maxSteps % (stepCounter + 1); // Steps left after full loop iterations.
    let currentRemainingStep = 0;

    // Traverse the remaining steps.
    for (currentRemainingStep; currentRemainingStep < remainingSteps; currentRemainingStep++) {
        tempNode = nextNodes[tempNode];
        remainingPathSum += nodeValues[tempNode];
        maxRemainingPathScore = Math.max(maxRemainingPathScore, remainingPathSum);
    }

    // The final result is the maximum of two scenarios:
    // 1. (fullLoopIterations - 1) times the loop sum + the max score reached within one loop traversal.
    // 2. fullLoopIterations times the loop sum + the max score reached in the remaining partial loop traversal.
    return Math.max(currentPathSum * (fullLoopIterations - 1) + maxPathScore, currentPathSum * fullLoopIterations + maxRemainingPathScore);
};

// Initialize the overall maximum score to a very small number.
let overallMaxScore = -1e9;

// Iterate through all possible starting nodes (from 1 to N)
// and find the global maximum score.
for (let startingPoint = 1; startingPoint <= nodeCount; startingPoint++) {
    overallMaxScore = Math.max(overallMaxScore, calculateMaxScore(startingPoint));
}

// Output the final maximum score.
console.log(overallMaxScore);
