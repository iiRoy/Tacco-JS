"use strict";

// --- Input Stream Management ---

// Obtain raw input data from standard input, encoded as UTF-8.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input into individual tokens using spaces or newlines as delimiters.
// Filter out any empty strings that may result from multiple consecutive delimiters.
const inputTokenStream = rawInputData.split(/ |\n/).filter(Boolean);
let currentTokenPointer = 0; // Pointer to the next token to be read.

/**
 * Extracts the next token from the input stream and parses it as an integer.
 * @returns {number} The parsed integer value.
 */
function extractNextInteger() {
    return +inputTokenStream[currentTokenPointer++];
}

/**
 * Retrieves the next token from the input stream as a raw string.
 * @returns {string} The string token.
 */
function extractNextString() {
    return inputTokenStream[currentTokenPointer++];
}

/**
 * Extracts the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The parsed BigInt value.
 */
function extractNextBigInt() {
    return BigInt(inputTokenStream[currentTokenPointer++]);
}

/**
 * Reads a specified number of consecutive integers from the input stream.
 * @param {number} count - The total number of integers to read.
 * @returns {number[]} An array containing the parsed integers.
 */
function extractIntegerSequence(count) {
    const sequence = new Array(count);
    for (let i = 0; i < count; i++) {
        sequence[i] = extractNextInteger();
    }
    return sequence;
}

// --- Main Program Execution Flow ---

// Invoke the primary logic handler and capture its result.
const computationResult = processProblemSolution();

// If a result is returned by the primary logic, print it to the console.
if (computationResult !== undefined) {
    console.log(String(computationResult));
}

/**
 * Implements the core algorithm to calculate the maximum score.
 * This function handles reading specific problem parameters and
 * performing the necessary iterative calculations.
 * @returns {BigInt} The highest score attainable.
 */
function processProblemSolution() {
    // Read the number of nodes (N) and the maximum allowed steps (K).
    const graphNodeCount = extractNextInteger();
    const maximumAllowedSteps = extractNextInteger();

    // Implement a guard clause for edge cases where input might be invalid or trivial.
    if (graphNodeCount <= 0 || maximumAllowedSteps <= 0) {
        // For zero or negative nodes/steps, the maximum score is zero.
        return BigInt(0);
    }

    // Read the permutation array, adjusting values to be 0-indexed.
    // `nodeTraversalMap[i]` indicates the next node visited after `i`.
    const nodeTraversalMap = extractIntegerSequence(graphNodeCount).map(val => val - 1);

    // Read the cost associated with each node.
    const nodePointValues = extractIntegerSequence(graphNodeCount);

    // Initialize the overall maximum score to a very small BigInt to ensure any valid score will be greater.
    let globalMaximumScore = BigInt(-2_000_000_000_000_000_000n); // Equivalent to -2e18 as a BigInt.

    // Iterate through each node, considering it as a potential starting point for a path.
    for (let currentStartingNode = 0; currentStartingNode < graphNodeCount; currentStartingNode++) {
        let currentNodeInPath = currentStartingNode;
        const pathCumulativeScores = []; // Stores the cumulative score after each step in the current path.
        let pathLength = 0; // Tracks the number of steps taken in the current path.

        // Simulate the first step from the starting node.
        // The problem implies taking at least one step.
        currentNodeInPath = nodeTraversalMap[currentNodeInPath]; // Move to the next node.
        pathCumulativeScores[pathLength] = nodePointValues[currentNodeInPath];
        pathLength++; // Increment path length to 1.

        // Continue tracing the path. The loop terminates if:
        // 1. The maximum allowed steps (K) are reached.
        // 2. The path returns to the initial starting node, completing a cycle.
        while (pathLength < maximumAllowedSteps && currentNodeInPath !== currentStartingNode) {
            currentNodeInPath = nodeTraversalMap[currentNodeInPath]; // Move to the subsequent node.
            pathCumulativeScores[pathLength] = pathCumulativeScores[pathLength - 1] + nodePointValues[currentNodeInPath];
            pathLength++; // Increment the count of steps taken.
        }

        // `pathLength` now represents the effective number of steps traced in this segment/cycle.
        // `pathCumulativeScores[pathLength - 1]` holds the total score accumulated over these `pathLength` steps.
        const segmentTotalScore = pathCumulativeScores[pathLength - 1];

        // Initialize a temporary maximum score for the path originating from `currentStartingNode`.
        let currentPathMaximumCandidate = globalMaximumScore;

        // If the total score for this segment/cycle is positive, it's beneficial to repeat it.
        if (segmentTotalScore > 0) {
            for (let stepIndex = 0; stepIndex < pathLength; stepIndex++) {
                const scoreFromInitialSegment = BigInt(pathCumulativeScores[stepIndex]);
                const remainingStepsForFullCycles = maximumAllowedSteps - (stepIndex + 1);

                // Calculate how many full repetitions of the segment can be made with remaining steps.
                const numberOfFullCycles = (remainingStepsForFullCycles >= 0)
                    ? BigInt(Math.floor(remainingStepsForFullCycles / pathLength))
                    : BigInt(0); // This guard prevents negative division, though unlikely with problem constraints.

                // Compute the total score: initial segment part + full cycle repetitions.
                const calculatedScoreForPath = scoreFromInitialSegment + numberOfFullCycles * BigInt(segmentTotalScore);

                // Update the maximum candidate for this specific starting path.
                if (calculatedScoreForPath > currentPathMaximumCandidate) {
                    currentPathMaximumCandidate = calculatedScoreForPath;
                }
            }
        } else {
            // If the segment/cycle score is zero or negative, repeating it won't improve or might worsen the score.
            // Therefore, we only consider the scores achieved within the initial single traversal of the segment.
            for (let stepIndex = 0; stepIndex < pathLength; stepIndex++) {
                const scoreFromInitialSegment = BigInt(pathCumulativeScores[stepIndex]);
                if (scoreFromInitialSegment > currentPathMaximumCandidate) {
                    currentPathMaximumCandidate = scoreFromInitialSegment;
                }
            }
        }
        // Update the overall global maximum score if a better score was found for the current starting node.
        if (currentPathMaximumCandidate > globalMaximumScore) {
            globalMaximumScore = currentPathMaximumCandidate;
        }
    }
    return globalMaximumScore;
}