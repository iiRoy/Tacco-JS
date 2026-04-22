const ioBridge = require('readline');

const OBSTACLE_MARKER = '#';
const SAFE_PATH_MARKER = '.';

let collectedInputLines = [];

const inputLineReader = ioBridge.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const finalizeProgramOutput = (outcomeMessage) => {
    console.log(outcomeMessage);
    process.exit(0);
};

inputLineReader.on('line', (currentInputSegment) => {
    collectedInputLines.push(currentInputSegment);
});

inputLineReader.on('close', () => {
    // Ensure sufficient input is available. This is an added robustness check.
    if (collectedInputLines.length < 2) {
        console.error("Input data incomplete. Expected at least two lines.");
        process.exit(1);
    }

    // Destructure and parse initial game parameters from the first line.
    // The first value (N) is read but not utilized in the core logic, effectively removed from consideration.
    const [
        trackSizeVal,
        playerA_StartIdx,
        playerB_StartIdx,
        playerA_TargetIdx,
        playerB_TargetIdx
    ] = collectedInputLines[0].split(" ").map(Number);

    // Convert the second input line into an array of characters representing the track.
    const trackEnvironment = collectedInputLines[1].split("");

    // Initialize a boolean flag to track if player B has a viable crossing passage.
    let isCrossingPathAvailable = false;

    // Determine the maximum index relevant for movement checks, for efficiency.
    const maxMovementBoundary = Math.max(playerA_TargetIdx, playerB_TargetIdx);

    // Iterate through the track layout to evaluate various conditions for movement.
    for (let currentTrackPos = 0; currentTrackPos < trackEnvironment.length; currentTrackPos++) {
        // Pre-calculate next positions for boundary checks and readability.
        const nextTrackPos = currentTrackPos + 1;
        const subsequentTrackPos = currentTrackPos + 2;

        // --- Condition Set 1: Check for immediate blocking obstacles ---
        // If two consecutive obstacles are found, and they are within the relevant range for player A or B.
        // Original: (S[i] === "#" && S[i + 1] === "#") && A <= i && i + 1 <= Math.max(C, D)
        if (nextTrackPos < trackEnvironment.length &&
            trackEnvironment[currentTrackPos] === OBSTACLE_MARKER &&
            trackEnvironment[nextTrackPos] === OBSTACLE_MARKER) {

            // Verify if this obstacle pair is within the movement scope.
            const isObstacleRelevant = playerA_StartIdx <= currentTrackPos && nextTrackPos <= maxMovementBoundary;
            if (isObstacleRelevant) {
                finalizeProgramOutput("No"); // Output "No" and terminate if a block is found.
            }
        }

        // --- Condition Set 2: Identify a three-empty-space crossing opportunity ---
        // This condition is crucial for player B's movement, especially when targets might overlap.
        // Original: (S[i] === "." && S[i + 1] === "." && S[i + 2] === ".") && B <= i && (i + 3 <= D || i + 1 === D)
        if (subsequentTrackPos < trackEnvironment.length &&
            trackEnvironment[currentTrackPos] === SAFE_PATH_MARKER &&
            trackEnvironment[nextTrackPos] === SAFE_PATH_MARKER &&
            trackEnvironment[subsequentTrackPos] === SAFE_PATH_MARKER) {

            // Check if the starting point of this three-space sequence is valid for player B.
            const isStartingPointValid = playerB_StartIdx <= currentTrackPos;

            // Evaluate if this sequence provides a path towards player B's target.
            // Rephrased: The sequence ends before or exactly at D, OR the middle of the sequence is at D.
            const doesSequenceFacilitatePassage = (subsequentTrackPos < playerB_TargetIdx) || (nextTrackPos === playerB_TargetIdx);

            if (isStartingPointValid && doesSequenceFacilitatePassage) {
                isCrossingPathAvailable = true; // Mark that a crossing path has been found.
            }
        }
    }

    // --- Final Condition Set: Special check for D < C and lack of crossing opportunity ---
    // This scenario often implies player B needs to pass player A, and if no three-dot passage was found,
    // additional obstacle checks around D and B become relevant.
    // Original: D < C && (S[D - 2] === "#" || S[D] === "#") && (S[B - 2] === "#" || S[B] === "#") && flag === false
    const isPlayerB_TargetBefore_PlayerA_Target = playerB_TargetIdx < playerA_TargetIdx;

    if (isPlayerB_TargetBefore_PlayerA_Target && !isCrossingPathAvailable) {
        // Evaluate obstacles at specific indices relative to player B's target (D) and start (B).
        // Added explicit boundary checks for array access safety.
        const isObstacleAtD_MinusTwo = (playerB_TargetIdx - 2 >= 0) && (trackEnvironment[playerB_TargetIdx - 2] === OBSTACLE_MARKER);
        const isObstacleAtD_Position = (playerB_TargetIdx < trackEnvironment.length) && (trackEnvironment[playerB_TargetIdx] === OBSTACLE_MARKER);
        const isObstacleAtB_MinusTwo = (playerB_StartIdx - 2 >= 0) && (trackEnvironment[playerB_StartIdx - 2] === OBSTACLE_MARKER);
        const isObstacleAtB_Position = (playerB_StartIdx < trackEnvironment.length) && (trackEnvironment[playerB_StartIdx] === OBSTACLE_MARKER);

        // Combine these checks as per original logic.
        const isPathAroundTargetD_Blocked = isObstacleAtD_MinusTwo || isObstacleAtD_Position;
        const isPathAroundStartB_Blocked = isObstacleAtB_MinusTwo || isObstacleAtB_Position;

        if (isPathAroundTargetD_Blocked && isPathAroundStartB_Blocked) {
            finalizeProgramOutput("No"); // Output "No" if these specific obstacles are present.
        }
    }

    // If no "No" conditions were met throughout the processing, then it's a "Yes" scenario.
    finalizeProgramOutput("Yes");
});