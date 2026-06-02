const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataLines = rawData.split('\n');

// Parse N (number of nodes) and K (maximum steps) from the first line
const firstLineParts = dataLines[0].split(' ');
const numNodes = Number(firstLineParts[0]);
const maxSteps = Number(firstLineParts[1]);

// Parse P (next node array) and C (node values array)
// Prepend null to make them 1-indexed, matching problem description
const nextNodes = [null, ...dataLines[1].split(' ').map(Number)];
const nodeValues = [null, ...dataLines[2].split(' ').map(Number)];

// Define a constant for the initial minimum score, used for comparisons
const INITIAL_MIN_SCORE = -1000000000;

/**
 * Calculates the maximum score achievable starting from a given node
 * within a specified number of steps, considering cycles.
 * @param {number} initialNode The starting node for the traversal.
 * @returns {number} The maximum score.
 */
const calculateMaxScore = (initialNode) => {
    // A Set is used to efficiently track nodes visited in the current path
    // to detect cycles.
    const visitedNodesInPath = new Set();
    let currentNode = initialNode;
    let currentPathSum = 0;
    let maxPathScoreInCycle = INITIAL_MIN_SCORE;
    let loopDetected = false;
    let stepsTakenInFirstTraversal = 0;

    // First traversal: Follow the path for up to `maxSteps` or until a loop is detected.
    for (stepsTakenInFirstTraversal = 0; stepsTakenInFirstTraversal < maxSteps; stepsTakenInFirstTraversal++) {
        // Mark the current node as visited before moving to the next.
        visitedNodesInPath.add(currentNode);
        
        // Move to the next node in the sequence as defined by `nextNodes`.
        currentNode = nextNodes[currentNode];
        
        // Add the value of the newly reached node to the running path sum.
        currentPathSum += nodeValues[currentNode];
        
        // Update the maximum score encountered so far within this path segment.
        maxPathScoreInCycle = Math.max(maxPathScoreInCycle, currentPathSum);

        // Check if the current node has already been visited in this traversal.
        // If so, a cycle has been detected.
        if (visitedNodesInPath.has(currentNode)) {
            loopDetected = true;
            break; // Exit the loop as the cycle is found.
        }
    }

    // If no loop was detected within the `maxSteps`, the maximum score is simply
    // the highest value found during the linear traversal.
    if (!loopDetected) {
        return maxPathScoreInCycle;
    }

    // If a loop was detected, but the total sum of one cycle is negative,
    // repeating the cycle would only decrease the score. In this scenario,
    // the best score is the maximum found before the cycle would repeat.
    if (currentPathSum < 0) {
        return maxPathScoreInCycle;
    }

    // Calculate the length of the detected cycle.
    // `stepsTakenInFirstTraversal` is 0-indexed, so add 1 for the actual count.
    const cycleLength = stepsTakenInFirstTraversal + 1;

    // Determine the number of full cycles to apply for the main sum calculation.
    // This logic precisely mirrors the original 'times' variable calculation.
    const numFullCyclesToApply = maxSteps % cycleLength === 0
        ? (maxSteps / cycleLength) - 1
        : Math.floor(maxSteps / cycleLength);

    // Determine the number of remaining steps after accounting for the full cycles.
    // This logic precisely mirrors the original '_K' variable calculation.
    const remainingStepsAfterCycles = maxSteps % cycleLength;

    // Initialize variables for calculating the score within the remainder path.
    let remainderCurrentNode = initialNode; // Reset to the initial node for this calculation.
    let remainderPathSum = 0;
    let remainderMaxScore = INITIAL_MIN_SCORE;

    // Traverse the `remainingStepsAfterCycles` to find the maximum score in this segment.
    for (let rStep = 0; rStep < remainingStepsAfterCycles; rStep++) {
        remainderCurrentNode = nextNodes[remainderCurrentNode];
        remainderPathSum += nodeValues[remainderCurrentNode];
        remainderMaxScore = Math.max(remainderMaxScore, remainderPathSum);
    }

    // Calculate two potential maximum scores based on the cycle and remainder:
    // Option 1: `(numFullCyclesToApply - 1)` full cycles, plus the maximum score
    //           achieved within the *next* full cycle (represented by `maxPathScoreInCycle`).
    const scoreFromFullCyclesAndPeak = currentPathSum * (numFullCyclesToApply - 1) + maxPathScoreInCycle;
    
    // Option 2: `numFullCyclesToApply` full cycles, plus the maximum score
    //           achieved within the `remainingStepsAfterCycles`.
    const scoreFromFullCyclesAndRemainder = currentPathSum * numFullCyclesToApply + remainderMaxScore;

    // Return the greater of the two calculated options.
    return Math.max(scoreFromFullCyclesAndPeak, scoreFromFullCyclesAndRemainder);
};

let overallMaxScore = INITIAL_MIN_SCORE;

// Iterate through all possible starting nodes (from 1 to N)
// to find the global maximum score achievable.
for (let currentStartNode = 1; currentStartNode <= numNodes; currentStartNode++) {
    overallMaxScore = Math.max(overallMaxScore, calculateMaxScore(currentStartNode));
}

// Output the final overall maximum score.
console.log(overallMaxScore);
