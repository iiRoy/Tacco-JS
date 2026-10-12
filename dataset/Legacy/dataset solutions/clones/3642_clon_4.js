function calculateMinimumProblems(rawData) {
    let lines = rawData.split("\n");
    const [difficultyCount, targetScoreRaw] = lines.shift().split(" ").map(Number);
    // Convert target score to units of hundreds, consistent with problem bonuses
    const targetScoreHundreds = targetScoreRaw / 100;

    const problemSets = [];
    for (let i = 0; i < difficultyCount; i++) {
        const [problemCount, bonusScore] = lines.shift().split(" ").map(Number);
        problemSets.push({
            count: problemCount,
            // Convert bonus to units of hundreds
            bonus: bonusScore / 100,
            // Score per problem for this difficulty (e.g., 100 points per problem for difficulty 1, so 1 unit in hundreds)
            scorePerProblem: (i + 1)
        });
    }

    const potentialSolutions = [];

    // Recursive function to explore all combinations of fully solved problem sets.
    // This replaces the iterative bitmask approach using string conversion (zeroPadding)
    // and explicit loops from the original implementation.
    const exploreCombinations = (
        currentIndex,              // The current problem difficulty index being considered (0 to difficultyCount-1)
        accumulatedScore,          // Total score accumulated from fully solved sets so far (in hundreds)
        accumulatedProblemCount,   // Total number of problems solved from fully solved sets so far
        fullySolvedMask            // A bitmask indicating which problem sets are fully solved (1 at bit 'i' means set 'i' is fully solved)
    ) => {
        // Base case: All problem difficulties have been considered for their "fully solved" status.
        if (currentIndex === difficultyCount) {
            // If the target score is already met by the current combination of fully solved sets,
            // this is a valid solution candidate.
            if (accumulatedScore >= targetScoreHundreds) {
                potentialSolutions.push(accumulatedProblemCount);
                return;
            }

            // If the target score is not yet met, we need to try to supplement
            // by partially solving problems from one of the *unsolved* difficulties.
            // The original code iterates through difficulties from 0 to D-1 for this topping-up step.
            for (let d = 0; d < difficultyCount; d++) {
                // Check if this difficulty 'd' was NOT fully solved in the current combination.
                // Using bitwise AND with a shifted 1 to check the d-th bit.
                if (!((fullySolvedMask >> d) & 1)) {
                    const remainingScoreNeeded = targetScoreHundreds - accumulatedScore;
                    // Calculate how many problems of difficulty 'd' are needed to reach the target.
                    const problemsToAdd = Math.floor(remainingScoreNeeded / problemSets[d].scorePerProblem);

                    // The original condition `hoge > p[d] - 1` implies that `problemsToAdd`
                    // must be strictly less than `p[d]` (i.e., we don't solve all of them, thus no bonus).
                    // Also, `problemsToAdd` must be positive to actually contribute.
                    if (problemsToAdd > 0 && problemsToAdd < problemSets[d].count) {
                        potentialSolutions.push(accumulatedProblemCount + problemsToAdd);
                    }
                }
            }
            return;
        }

        // Recursive step: For the current problem set at `currentIndex`, we have two choices:

        // Option 1: Do NOT fully solve the current problem set.
        // Proceed to consider the next problem set without adding current set's score/problems.
        exploreCombinations(
            currentIndex + 1,
            accumulatedScore,
            accumulatedProblemCount,
            fullySolvedMask
        );

        // Option 2: FULLY solve the current problem set.
        // Calculate new score, problem count, and update the fully solved mask.
        const currentSet = problemSets[currentIndex];
        const newAccumulatedScore = accumulatedScore +
                                     (currentSet.count * currentSet.scorePerProblem) +
                                     currentSet.bonus;
        const newAccumulatedProblemCount = accumulatedProblemCount + currentSet.count;
        // Set the bit for the current index in the fully solved mask.
        const newFullySolvedMask = fullySolvedMask | (1 << currentIndex);

        // Proceed to consider the next problem set with the updated values.
        exploreCombinations(
            currentIndex + 1,
            newAccumulatedScore,
            newAccumulatedProblemCount,
            newFullySolvedMask
        );
    };

    // Initiate the recursive exploration starting from the first problem set (index 0),
    // with initial score, problem count, and mask all at zero.
    exploreCombinations(0, 0, 0, 0);

    // After exploring all combinations, return the minimum number of problems found.
    return Math.min(...potentialSolutions);
}

// The self-executing anonymous function for input/output handling.
// This part is preserved as-is to maintain the exact external contract and execution environment.
((b,c,d)=>"undefined"!=typeof require?console.log(calculateMinimumProblems(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return calculateMinimumProblems(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
2 700
3 500
5 800
`);
