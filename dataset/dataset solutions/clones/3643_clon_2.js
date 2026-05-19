function ProcessInput(rawData) {
    // Extract initial configuration parameters from the first line of input
    const initialConfiguration = rawData.split("\n")[0].split(" ");
    let numProblemCategories = initialConfiguration[0x0]; // Corresponds to 'D'
    let targetScore = initialConfiguration[0b1]; // Corresponds to 'G'

    // Declare and initialize arrays to store problem details
    let problemCounts = new Array(); // Corresponds to 'p'
    let bonusScores = new Array(); // Corresponds to 'c'
    let categoryValues = new Array(); // Corresponds to 'comp'

    // Initialize auxiliary variables
    let currentScoreTracker = 0x0; // Corresponds to 'score', unused in original logic
    let minSolvedCount = 1e10; // Corresponds to 'answer', initialized to a very large number

    // Populate the problem detail arrays by parsing subsequent input lines
    for (let categoryIdx = 0x0; categoryIdx < numProblemCategories; categoryIdx++) { // Corresponds to 'i'
        const categoryData = rawData.split("\n")[categoryIdx + 0b1].split(" ");
        problemCounts[categoryIdx] = categoryData[0x0];
        bonusScores[categoryIdx] = categoryData[0b1];
        // Calculate the total score for fully completing a category, including bonus
        categoryValues[categoryIdx] = Number(0x64 * (categoryIdx + 0b1) * problemCounts[categoryIdx]) + Number(bonusScores[categoryIdx]);
    }

    // These map calls are present in the original code but do not reassign the arrays.
    // Thus, the arrays 'problemCounts', 'bonusScores', and 'categoryValues' still contain string values.
    // This behavior is preserved to maintain Type II cloning.
    problemCounts.map(Number);
    bonusScores.map(Number);
    categoryValues.map(Number);

    // Main processing loop: Iterate through all possible subsets of fully solved problem categories.
    // Each iteration represents a unique combination of categories that are entirely completed.
    for (let combinationIndex = 0x0; combinationIndex < Math.pow(0x2, numProblemCategories); combinationIndex++) { // Corresponds to 'l'
        let tempAccumulatedScore = 0x0; // Corresponds to 'tmpscore'
        let tempAccumulatedProblems = 0x0; // Corresponds to 'tmpelements'

        // Generate a binary mask string to represent the current combination.
        // The mask indicates which categories are fully solved ('1') and which are not ('0').
        let invertedCombination = Math.pow(0x2, numProblemCategories) - combinationIndex - 0b1; // Corresponds to 'l_'
        let categorySelection = invertedCombination.toString(0x2).split(""); // Corresponds to 'mask'
        while (categorySelection.length < numProblemCategories) {
            categorySelection.splice(0x0, 0x0, "0"); // Pad with leading zeros if necessary
        }

        // Calculate the initial score and problem count based on the fully solved categories.
        for (let maskPosition = 0x0; maskPosition < categorySelection.length; maskPosition++) { // Corresponds to 'j'
            tempAccumulatedScore += Number(categorySelection[maskPosition] * categoryValues[maskPosition]);
            tempAccumulatedProblems += Number(categorySelection[maskPosition] * problemCounts[maskPosition]);
        }

        // Find the highest-indexed category that was NOT fully solved in this combination.
        // This category will be used to add individual problems if the target score isn't met yet.
        let highestUnpickedIdx = categorySelection.indexOf("0"); // Corresponds to 'index'

        // If there is at least one category that was not fully solved:
        if (highestUnpickedIdx !== -0b1) {
            // Incrementally add problems from the highest-indexed unpicked category
            // until the target score is reached or all problems in that category are exhausted.
            for (let singleProblemUnit = 0x0; singleProblemUnit < problemCounts[highestUnpickedIdx]; singleProblemUnit++) { // Corresponds to 'k'
                if (tempAccumulatedScore >= targetScore) {
                    break; // Stop if the target score has already been achieved.
                }
                // Add the score for one problem from this category (100 * (category index + 1)).
                tempAccumulatedScore += 0x64 * (numProblemCategories - highestUnpickedIdx);
                tempAccumulatedProblems += 0b1; // Increment the total count of solved problems.
            }
        }

        // After considering both fully solved categories and potentially partial problems,
        // if the target score is met, update the minimum number of problems found so far.
        if (tempAccumulatedScore >= targetScore) {
            minSolvedCount = Math.min(minSolvedCount, tempAccumulatedProblems);
        }
    }

    // Output the final minimum number of problems required to reach the target score.
    console.log(minSolvedCount);
}

// Standard input reading and function invocation (unchanged from original).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
