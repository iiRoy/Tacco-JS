// This script is designed to determine the maximum possible score achievable by traversing a sequence of nodes.
// Each node has a successor and an associated score. The traversal is limited by a maximum number of steps.

// Input data simulation for local testing. In a production environment, this might come from a file system.
// const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const rawInputData = `10 58
9 1 6 7 8 4 3 2 10 5
695279662 988782657 -119067776 382975538 -151885171 -177220596 -169777795 37619092 389386780 980092719`;

/**
 * Utility function to parse a space-separated string of numbers into a numeric array.
 * Includes basic error handling for non-numeric values.
 * @param {string} inputString The string containing numbers.
 * @returns {number[]} An array of parsed numbers.
 */
const parseNumericArray = (inputString) => {
    return inputString.split(' ').map(val => {
        const parsedNum = Number(val);
        // If parsing results in NaN, we could log an error or return a default.
        // For competitive programming, inputs are usually guaranteed valid.
        if (isNaN(parsedNum)) {
            // console.error("Warning: Encountered non-numeric value:", val);
            return 0; // Default to 0 or handle error appropriately.
        }
        return parsedNum;
    });
};

// Split the raw input string into individual lines for structured processing.
const dataRows = rawInputData.trim().split('\n');

// Extract the primary parameters: total number of available nodes and the step budget.
let [totalElements, maxIterations] = parseNumericArray(dataRows[0]);

// Basic validation for the main parameters.
// If inputs are invalid, the problem constraints might not be met, or default behavior is needed.
if (totalElements < 1 || maxIterations < 1) {
    // For this problem, it's assumed N and K are positive.
    // A robust solution might throw an error or return 0 here.
}

// Parse the successor nodes array (P in original) and the element scores array (C in original).
const successors = parseNumericArray(dataRows[1]);
const elementScores = parseNumericArray(dataRows[2]);

// Adjust arrays for 1-based indexing as per problem statement (nodes 1 to N).
// A dummy value (0) is inserted at index 0, so node IDs directly map to array indices.
successors.unshift(0);
elementScores.unshift(0);

// Define a constant for the absolute minimum score to initialize maximum score variables.
// Using Number.MIN_SAFE_INTEGER ensures no legitimate score will be lower than this.
const MIN_POSSIBLE_SCORE = Number.MIN_SAFE_INTEGER;

/**
 * Computes the highest score attainable by starting at a specific node and following its successors.
 * This function handles path traversal, cycle detection, and optimal score calculation in cyclic graphs.
 * @param {number} initialNode The 1-indexed starting node for the traversal.
 * @returns {number} The maximum score achieved from the initial node within the step budget.
 */
const evaluateTraversalBenefit = (initialNode) => {
    // Early exit for invalid starting nodes outside the defined range.
    if (initialNode < 1 || initialNode > totalElements) {
        return MIN_POSSIBLE_SCORE;
    }

    // A map to keep track of visited nodes within the current path.
    // Stores the step count and cumulative score when a node was first visited.
    const traversalHistory = new Map(); // Key: node ID, Value: { step: number, score: number }

    let currentPoint = initialNode;
    let accumulatedValue = 0; // Current running score along the path.
    let maxIntermediateScore = MIN_POSSIBLE_SCORE; // Highest score encountered so far in this path.
    let iterationCount = 0; // Number of steps taken.
    let cycleDetected = false; // Flag to indicate if a loop has been found.

    // Traverse the path until maxIterations is reached or a cycle is detected.
    while (iterationCount < maxIterations) {
        // If the current node has been visited before, a cycle is confirmed.
        if (traversalHistory.has(currentPoint)) {
            cycleDetected = true;
            break; // Terminate early as the cycle dynamics need special handling.
        }

        // Record the current node's state (step count and cumulative score) upon its first visit.
        traversalHistory.set(currentPoint, { step: iterationCount, score: accumulatedValue });

        // Move to the next node based on the successors array.
        // The score of the *new* currentPoint is added.
        currentPoint = successors[currentPoint];
        accumulatedValue += elementScores[currentPoint];
        maxIntermediateScore = Math.max(maxIntermediateScore, accumulatedValue);

        iterationCount++;
    }

    // If no cycle was detected throughout the entire maxIterations, the maxIntermediateScore is the answer.
    if (!cycleDetected) {
        return maxIntermediateScore;
    }

    // --- Handling Cycle Detection ---
    // At this point, `iterationCount` represents the total steps taken *until* `currentPoint` was revisited.
    // `accumulatedValue` is the total score accumulated over these `iterationCount` steps.
    // `maxIntermediateScore` is the highest score observed during these `iterationCount` steps.

    // Determine the properties of the detected cycle.
    const cycleStartInfo = traversalHistory.get(currentPoint);
    const cycleEntryStep = cycleStartInfo.step; // Step count when `currentPoint` was first visited.
    const scoreAtCycleEntry = cycleStartInfo.score; // Score when `currentPoint` was first visited.

    // The segment of the path from `initialNode` up to the point of re-entering `currentPoint`.
    // This segment includes a potential 'prefix' and the first full traversal of the loop.
    const fullSegmentLength = iterationCount; // The number of steps taken to detect the loop.
    const fullSegmentScore = accumulatedValue; // Total score for this `fullSegmentLength`.
    const fullSegmentPeak = maxIntermediateScore; // Max score within this `fullSegmentLength`.

    // The score of the actual cycle (loop part only).
    const cycleScore = accumulatedValue - scoreAtCycleEntry;

    // If traversing the cycle multiple times would yield a negative score,
    // it's always better to stop before or within the first cycle, so `maxIntermediateScore` is the answer.
    if (cycleScore < 0) {
        return maxIntermediateScore;
    }

    // Calculate how many times the `fullSegment` (path leading to and including the first cycle traversal)
    // can be fully repeated within the remaining `maxIterations`.
    let numberOfSegmentRepeats = 0;
    if (fullSegmentLength > 0) { // Prevent division by zero if fullSegmentLength is somehow 0 (shouldn't happen here)
        numberOfSegmentRepeats = Math.floor(maxIterations / fullSegmentLength);
        // If maxIterations is an exact multiple, we take one less full segment and then the peak of the last segment.
        // This aligns with the original problem's specific interpretation of 'times'.
        if (maxIterations % fullSegmentLength === 0 && numberOfSegmentRepeats > 0) {
            numberOfSegmentRepeats--;
        }
    }

    // Calculate the number of steps remaining after completing `numberOfSegmentRepeats` full segments.
    const remainingStepsForPartialSegment = maxIterations - (numberOfSegmentRepeats * fullSegmentLength);

    // Simulate traversal for the remaining partial segment to find its score and peak.
    let partialSegmentCurrentNode = initialNode; // Restart from the initial node for the partial segment calculation.
    let partialSegmentAccumulatedScore = 0;
    let partialSegmentMaxScore = MIN_POSSIBLE_SCORE;
    let tempStepCounter = 0;

    // Traverse the path for the remaining steps.
    while (tempStepCounter < remainingStepsForPartialSegment) {
        partialSegmentCurrentNode = successors[partialSegmentCurrentNode];
        partialSegmentAccumulatedScore += elementScores[partialSegmentCurrentNode];
        partialSegmentMaxScore = Math.max(partialSegmentMaxScore, partialSegmentAccumulatedScore);
        tempStepCounter++;
    }

    // Now, combine the possible maximum scores:
    // Option 1: Consider `numberOfSegmentRepeats - 1` full segments, then the peak achieved during the *first* full segment.
    // This captures scenarios where the peak was early in the path.
    let maxScoreOption1 = MIN_POSSIBLE_SCORE;
    if (numberOfSegmentRepeats > 0) {
        maxScoreOption1 = (fullSegmentScore * (numberOfSegmentRepeats - 1)) + fullSegmentPeak;
    } else {
        // If no full segments are taken (i.e., maxIterations < fullSegmentLength),
        // the max score is simply the peak within the initial partial traversal.
        maxScoreOption1 = fullSegmentPeak;
    }

    // Option 2: Consider `numberOfSegmentRepeats` full segments, then the peak achieved within the *remaining partial segment*.
    // `partialSegmentMaxScore` is relative to the start of the partial segment.
    let maxScoreOption2 = (fullSegmentScore * numberOfSegmentRepeats) + partialSegmentMaxScore;

    // The final maximum score is the greater of these two options.
    return Math.max(maxScoreOption1, maxScoreOption2);
};

// Initialize the global maximum score to the lowest possible value.
let overallMaxScore = MIN_POSSIBLE_SCORE;

// Iterate through every possible starting node from 1 to totalElements.
// For each starting node, calculate its maximum achievable score and update the global maximum.
let currentNodeIterator = 1;
while (currentNodeIterator <= totalElements) {
    overallMaxScore = Math.max(overallMaxScore, evaluateTraversalBenefit(currentNodeIterator));
    currentNodeIterator++;
}

// Print the final, globally maximum score.
console.log(overallMaxScore);

// Note: The problem implies that at least one step must be taken.
// The `maxIntermediateScore` and `partialSegmentMaxScore` are initialized to `MIN_POSSIBLE_SCORE`.
// If all scores are negative, `MIN_POSSIBLE_SCORE` will propagate correctly.