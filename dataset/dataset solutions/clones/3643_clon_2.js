function ExecuteProgram(dataStream) {
    // The initial line of input holds problem type and target score details.
    let problemTypes = dataStream.split("\n")[0].split(" ")[0];
    let targetScore = dataStream.split("\n")[0].split(" ")[1];

    let probCounts = [];
    let bonusPoints = [];
    let totalScores = [];

    let currentScore = 0;
    let minProblems = 10000000000;

    for (let idx = 0; idx < problemTypes; idx++) {
        probCounts[idx] = dataStream.split("\n")[idx + 1].split(" ")[0];
        bonusPoints[idx] = dataStream.split("\n")[idx + 1].split(" ")[1];
        totalScores[idx] = Number(100 * (idx + 1) * probCounts[idx]) + Number(bonusPoints[idx]);
    }

    probCounts.map(Number);
    bonusPoints.map(Number);
    totalScores.map(Number);
    // End of initial data parsing and setup.

    // Core processing methodology
    // Iterate through all possible combinations of fully solving problem sets.
    // Inside each iteration:
    // 1. Calculate the aggregate score and count of problems for the current combination.
    // 2. Augment the partial score by incrementally solving problems from the highest-value unsolved set,
    //    until the desired target score is reached.
    // 2a. If the target is not met even after solving all problems in that set, terminate this path.
    // 2b. If the target is reached, record the total problems as a potential minimum.
    // 3. Update the overall minimum problem count with the best result from this iteration.
    // 4. The final stored value represents the ultimate solution.
    for (let config = 0; config < Math.pow(2, problemTypes); config++) {
        let tempScore = 0;
        let tempProbs = 0;

        // Step 1: Evaluate the selected problem sets
        // Construct the selection bitmask
        let complementConfig = Math.pow(2, problemTypes) - config - 1;
        let selectionMask = complementConfig.toString(2).split("");

        while (selectionMask.length < problemTypes) {
            selectionMask.splice(0, 0, "0");
        }

        // console.log("Current mask:", selectionMask);

        // Calculate score and problem count for this mask
        for (let maskIdx = 0; maskIdx < selectionMask.length; maskIdx++) {
            tempScore += Number(selectionMask[maskIdx] * totalScores[maskIdx]);
            tempProbs += Number(selectionMask[maskIdx] * probCounts[maskIdx]);
        }
        // console.log("Calculated score:", tempScore);
        // console.log("Calculated problems:", tempProbs);

        // Step 2: Supplement score with partially solved problems
        // Identify the highest-indexed problem set not fully solved in this combination.
        let firstUnselectedIdx = selectionMask.indexOf("0");

        if (firstUnselectedIdx !== -1) {
            for (let loopCount = 0; loopCount < probCounts[firstUnselectedIdx]; loopCount++) {
                if (tempScore >= targetScore) {
                    break;
                    // If target met, no need to add more problems from this set.
                    // This path avoids further additions if goal already achieved.
                }
                tempScore += 100 * (problemTypes - firstUnselectedIdx);
                tempProbs += 1;
                // Update potential minimum if target is met here.
            }
        }

        if (tempScore >= targetScore) {
            minProblems = Math.min(minProblems, tempProbs);
        }
    }
    console.log(minProblems);
}

// The following line is standard input handling and should not be altered.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));