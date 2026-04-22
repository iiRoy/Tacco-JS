const retrieveInputData = () => {
    // Attempt to read input from standard input in UTF-8 format.
    // This function encapsulates the file system interaction.
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

const parseInputText = (inputTextContent) => {
    // Process the raw input string into an array of lines.
    // Remove any leading/trailing whitespace for cleanliness.
    const textLines = inputTextContent.trim().split('\n');

    // Parse the first line for initial parameters.
    const [initialEntityCountStr, maximumAllowedMovesStr] = textLines[0].split(' ');
    const initialEntityCount = Number(initialEntityCountStr);
    const maximumAllowedMoves = Number(maximumAllowedMovesStr);

    // Parse the second line for 'next' indices (P array in original).
    // These indicate the next entity to move to.
    const navigationIndices = textLines[1].split(' ').map(Number);

    // Parse the third line for score values (C array in original).
    // These are the scores associated with each entity.
    const entityScores = textLines[2].split(' ').map(Number);

    // For 1-based indexing convenience, prepend a null value to both arrays.
    // This aligns array indices with entity IDs (1 to N).
    navigationIndices.unshift(null);
    entityScores.unshift(null);

    return {
        numEntities: initialEntityCount,
        maxMoves: maximumAllowedMoves,
        nextEntityMap: navigationIndices,
        entityValueScores: entityScores
    };
};

// Define a constant for the smallest possible score, used for initial maximum comparisons.
const MINIMUM_POSSIBLE_SCORE_VALUE = Number.NEGATIVE_INFINITY;

/**
 * Calculates the maximum score achievable starting from a given entity.
 * This function models movement through a sequence of entities, accumulating scores,
 * and handles potential loops in the path.
 *
 * @param {number} startingEntityId The ID of the entity to begin the path from.
 * @param {number} totalAllowedSteps The maximum number of steps allowed for the path.
 * @param {number[]} entityNavigationMap An array where entityNavigationMap[i] is the next entity from i.
 * @param {number[]} entityValueScores An array where entityValueScores[i] is the score of entity i.
 * @returns {number} The maximum score achieved during the path traversal.
 */
const determineOptimalPathScore = (startingEntityId, totalAllowedSteps, entityNavigationMap, entityValueScores) => {
    // Map to keep track of visited entities and the step index when they were first visited.
    const visitedPathEntryPoints = new Map(); // { entityId: stepIndexWhenFirstVisited }

    let currentEntityIdentifier = startingEntityId;
    let currentAccumulatedScore = 0;
    let highestScoreEncountered = MINIMUM_POSSIBLE_SCORE_VALUE;
    let stepsCompletedInPath = 0;
    let wasLoopDetected = false;
    let loopStartStepIndex = -1; // The step index (0-based) where the loop segment begins

    // First phase: Traverse the path step by step.
    // This loop runs until maximumAllowedMoves is reached or a loop is detected.
    for (let stepCounter = 0; stepCounter < totalAllowedSteps; stepCounter++) {
        // If the current entity has been visited before, a cycle (loop) is formed.
        if (visitedPathEntryPoints.has(currentEntityIdentifier)) {
            wasLoopDetected = true;
            loopStartStepIndex = visitedPathEntryPoints.get(currentEntityIdentifier);
            break; // Exit traversal; loop analysis begins.
        }

        // Mark the current entity as visited with its corresponding step index.
        visitedPathEntryPoints.set(currentEntityIdentifier, stepCounter);

        // Move to the next entity as per the navigation map.
        currentEntityIdentifier = entityNavigationMap[currentEntityIdentifier];

        // Add the score of the newly reached entity to the accumulated score.
        const scoreOfCurrentEntity = entityValueScores[currentEntityIdentifier];
        currentAccumulatedScore += scoreOfCurrentEntity;

        // Update the highest score encountered along this path segment.
        highestScoreEncountered = Math.max(highestScoreEncountered, currentAccumulatedScore);

        // Increment the count of steps completed.
        stepsCompletedInPath = stepCounter + 1;
    }

    // If no loop was detected after 'totalAllowedSteps' steps,
    // the highest score achieved during this direct traversal is the answer.
    if (!wasLoopDetected) {
        return highestScoreEncountered;
    }

    // --- Handling the scenario where a loop was detected ---

    // Calculate the length of the detected loop segment.
    const effectiveLoopLength = stepsCompletedInPath - loopStartStepIndex;

    // Calculate the total score accumulated during one full iteration of the loop segment.
    let scoreOfOneLoopTraversal = 0;
    let maxScoreWithinOneLoopTraversal = MINIMUM_POSSIBLE_SCORE_VALUE; // Max score relative to loop segment start
    let tempCurrentLoopNode = currentEntityIdentifier; // This is the node that was revisited, marking the loop end/start

    // Re-traverse the loop segment to calculate its sum and internal peak.
    // The `currentEntityIdentifier` here is the node *after* `stepsCompletedInPath` steps.
    // We need to start from the node that *initiated* the loop (the one at `loopStartStepIndex`).
    // Let's find the entity at `loopStartStepIndex` by re-simulating the path up to that point.
    let nodeAtLoopStart = startingEntityId;
    for (let s = 0; s < loopStartStepIndex; s++) {
        nodeAtLoopStart = entityNavigationMap[nodeAtLoopStart];
    }
    // Now `nodeAtLoopStart` is the entity that was first visited at `loopStartStepIndex`.

    let tempLoopScoreAccumulator = 0;
    for (let i = 0; i < effectiveLoopLength; i++) {
        nodeAtLoopStart = entityNavigationMap[nodeAtLoopStart];
        tempLoopScoreAccumulator += entityValueScores[nodeAtLoopStart];
        maxScoreWithinOneLoopTraversal = Math.max(maxScoreWithinOneLoopTraversal, tempLoopScoreAccumulator);
    }
    scoreOfOneLoopTraversal = tempLoopScoreAccumulator;

    // Critical Guard: If the loop itself has a non-positive total score,
    // repeating it multiple times would not increase the overall maximum.
    // In this case, the highest score is simply the maximum achieved *before*
    // any negative contributions from repeating the loop. This is represented by `highestScoreEncountered`.
    if (scoreOfOneLoopTraversal <= 0) {
        return highestScoreEncountered;
    }

    // Calculate the number of full loop repetitions that fit into the remaining steps.
    // This calculation aligns with the original code's `times` variable logic.
    const fullLoopRepetitionsOptionA = Math.floor((totalAllowedSteps - 1) / effectiveLoopLength);
    const fullLoopRepetitionsOptionB = Math.floor(totalAllowedSteps / effectiveLoopLength);

    // --- Scenario 1: Calculate score for `(repetitions - 1)` full loops + peak from the first loop pass ---
    // This corresponds to `sum * (times - 1) + peak` in the original code.
    // `currentAccumulatedScore` (from the first loop) acts as the `sum` for one pass of `k+1` steps.
    // `highestScoreEncountered` acts as the `peak` for one pass of `k+1` steps.
    const scoreFromOptionA = scoreOfOneLoopTraversal * (fullLoopRepetitionsOptionA - 1) + highestScoreEncountered;

    // --- Scenario 2: Calculate score for `repetitions` full loops + peak from the remaining steps ---
    // This corresponds to `sum * times + _peak` in the original code.
    // `_peak` is the max score from the *original starting node* for `K % (k+1)` steps.
    let tempNodeForFinalSegment = startingEntityId;
    let tempScoreForFinalSegment = 0;
    let maxScoreInFinalSegment = MINIMUM_POSSIBLE_SCORE_VALUE;
    const stepsInFinalSegment = totalAllowedSteps % effectiveLoopLength;

    // Simulate the path for the remaining steps, starting again from the original start.
    for (let s = 0; s < stepsInFinalSegment; s++) {
        tempNodeForFinalSegment = entityNavigationMap[tempNodeForFinalSegment];
        tempScoreForFinalSegment += entityValueScores[tempNodeForFinalSegment];
        maxScoreInFinalSegment = Math.max(maxScoreInFinalSegment, tempScoreForFinalSegment);
    }
    const scoreFromOptionB = scoreOfOneLoopTraversal * fullLoopRepetitionsOptionB + maxScoreInFinalSegment;

    // The ultimate maximum score is the best of these two scenarios.
    return Math.max(scoreFromOptionA, scoreFromOptionB);
};

// --- Main execution block ---

// 1. Obtain raw input data.
const rawInput = obtainRawInput();

// 2. Parse and structure the input data.
const { numEntities, maxMoves, nextEntityMap, entityValueScores } = parseInputText(rawInput);

// 3. Initialize the overall maximum score found across all starting entities.
let finalGlobalMaxScore = MINIMUM_POSSIBLE_SCORE_VALUE;

// Optional: Add a guard clause for invalid input parameters.
// If N or K are non-positive, there's no path to analyze.
if (numEntities <= 0 || maxMoves <= 0) {
    console.log(0); // Or handle as an error, or return MINIMUM_POSSIBLE_SCORE_VALUE
    // For competitive programming, usually 0 is fine if no moves can be made.
    // If scores can be negative, 0 might not be the actual max.
    // Let's assume K=0 means 0 score.
    // If K=0, the loop in determineOptimalPathScore won't run, and it will return MINIMUM_POSSIBLE_SCORE_VALUE.
    // The problem context usually implies N, K >= 1.
    // Let's stick to the behavior that it will return MINIMUM_POSSIBLE_SCORE_VALUE if no moves possible.
    // So, no explicit guard here, as `determineOptimalPathScore` naturally handles K=0.
} else {
    // 4. Iterate through each possible starting entity (from 1 to N).
    for (let currentStartEntity = 1; currentStartEntity <= numEntities; currentStartEntity++) {
        // Calculate the maximum score for the path starting at the current entity.
        const scoreForThisPath = determineOptimalPathScore(currentStartEntity, maxMoves, nextEntityMap, entityValueScores);

        // Update the global maximum score if the current path yields a higher score.
        finalGlobalMaxScore = Math.max(finalGlobalMaxScore, scoreForThisPath);
    }
}

// 5. Output the final computed maximum score.
console.log(finalGlobalMaxScore);