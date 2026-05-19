function parseNumericLine(lineStr) {
    return lineStr.split(" ").map(valStr => parseInt(valStr, 10));
}

function determineMoveScore(moveChar, scoreLookup) {
    // scoreLookup corresponds to 'b' in the original: [scissors_score, paper_score, rock_score]
    // 'r' (rock) maps to scoreLookup[2]
    // 's' (scissors) maps to scoreLookup[0]
    // 'p' (paper) maps to scoreLookup[1]
    switch (moveChar) {
        case "r":
            return scoreLookup[2];
        case "s":
            return scoreLookup[0];
        case "p":
            return scoreLookup[1];
        default:
            return 0; // Should not be reached with valid input
    }
}

function processGameData(rawInputString) {
    const cleanedLines = rawInputString.trim().split("\n");

    const gameConfiguration = parseNumericLine(cleanedLines[0]);
    const moveValueMap = parseNumericLine(cleanedLines[1]);
    const playerMoveSequence = Array.from(cleanedLines[2][0]);

    let roundScoresAccumulator = playerMoveSequence.map(singleMoveChar =>
        determineMoveScore(singleMoveChar, moveValueMap)
    );

    const offsetDistance = gameConfiguration[1];

    for (let currentIdx = 0; currentIdx < roundScoresAccumulator.length; currentIdx++) {
        const scoreAtCurrentPosition = roundScoresAccumulator[currentIdx];
        const comparisonTargetIdx = currentIdx + offsetDistance;

        // Only proceed if the target index is within the bounds of the array
        // This replicates the original behavior where out-of-bounds access would result in 'undefined'
        // and 'scoreAtCurrentPosition == undefined' would always be false (as scores are numbers).
        if (comparisonTargetIdx < roundScoresAccumulator.length) {
            const scoreAtTargetPosition = roundScoresAccumulator[comparisonTargetIdx];
            if (scoreAtCurrentPosition === scoreAtTargetPosition) {
                roundScoresAccumulator[comparisonTargetIdx] = 0;
            }
        }
    }

    const initialSum = 0;
    const finalTotalScore = roundScoresAccumulator.reduce((totalSum, currentScoreValue) =>
        totalSum + currentScoreValue, initialSum
    );

    console.log(finalTotalScore);
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
