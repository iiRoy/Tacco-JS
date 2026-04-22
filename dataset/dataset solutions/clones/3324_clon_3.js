(function(sourceInputBuffer) {
    // This self-executing function processes a problem involving probabilities
    // and calculates a cumulative likelihood using dynamic programming.

    // Begin by transforming the raw input buffer into an array of processed lines.
    // The input is expected to be UTF-8 encoded.
    const processedLines = sourceInputBuffer.toString('utf8').trim().split('\n');

    // The first line contains the total number of elements or stages for the problem.
    // We parse it as an integer and add a basic validation check.
    const totalProblemElements = parseInt(processedLines[0], 10);
    if (isNaN(totalProblemElements) || totalProblemElements < 1) {
        console.error("Error: The first line must contain a positive integer for problem elements.");
        return; // Halt execution if input is invalid
    }

    // The second line provides a space-separated list of success probabilities.
    // Each string is converted to a floating-point number.
    const elementProbabilities = processedLines[1].split(/\s+/).filter(Boolean).map(parseFloat);

    // A crucial validation: ensure the number of probabilities matches the declared element count.
    if (elementProbabilities.length !== totalProblemElements) {
        console.error("Error: Number of probabilities provided does not match total elements declared.");
        return;
    }
    // Further validation: check if all probabilities are within the valid [0, 1] range.
    for (const probVal of elementProbabilities) {
        if (isNaN(probVal) || probVal < 0.0 || probVal > 1.0) {
            console.error("Error: Invalid probability value detected (must be between 0 and 1).");
            return;
        }
    }

    // Initialize the dynamic programming table (memoization grid).
    // The dimensions are carefully chosen to align with the problem's indexing,
    // often requiring an offset. Here, it's (totalProblemElements + 3) rows.
    const dpTableRows = totalProblemElements + 3;
    const dpGrid = Array.from({ length: dpTableRows }, (_, rowIndex) =>
        Array.from({ length: rowIndex + 1 }, () => 0.0) // Each cell stores a probability, initialized to 0.0
    );

    // Establish the base case for the DP calculation.
    // This is the starting point from which subsequent states are derived.
    dpGrid[2][1] = 1.0; // Represents a specific initial condition or known state.

    // Iterate through the DP table to fill it using the recurrence relation.
    // The outer loop progresses through stages, and the inner loop tracks success counts.
    for (let currentStageIndex = 3; currentStageIndex <= totalProblemElements + 2; currentStageIndex++) {
        // Map the current DP stage index to the corresponding probability index.
        const probabilityArrayOffset = currentStageIndex - 3;
        const currentSuccessChance = elementProbabilities[probabilityArrayOffset];
        const currentFailureChance = 1.0 - currentSuccessChance; // The complement probability

        // Iterate through all possible success counts for the current stage.
        for (let currentSuccessCount = 1; currentSuccessCount <= currentStageIndex - 1; currentSuccessCount++) {
            // Fetch the necessary values from the previous stage (currentStageIndex - 1).
            // These represent the probabilities of achieving a certain number of successes
            // *before* considering the current element.
            const probFromPreviousStageIfSuccess = dpGrid[currentStageIndex - 1][currentSuccessCount - 1];
            const probFromPreviousStageIfFailure = dpGrid[currentStageIndex - 1][currentSuccessCount];

            // Apply the core DP recurrence:
            // P(currentStage, currentSuccessCount) =
            //   P(success at current element) * P(currentSuccessCount-1 at previous stage) +
            //   P(failure at current element) * P(currentSuccessCount at previous stage)
            dpGrid[currentStageIndex][currentSuccessCount] =
                (currentSuccessChance * probFromPreviousStageIfSuccess) +
                (currentFailureChance * probFromPreviousStageIfFailure);
        }
    }

    // After filling the DP table, we need to sum up specific probabilities
    // from the final row to get the overall desired likelihood.
    let cumulativeFinalLikelihood = 0.0;

    // Calculate the lower bound for the summation loop.
    // This threshold defines the minimum number of successes that meet the problem's criteria.
    const minimumRequiredCount = Math.floor((totalProblemElements + 3) / 2); // Using floor for integer division interpretation

    // The final row index in our DP table.
    const finalComputationRow = totalProblemElements + 2;

    // Accumulate probabilities that satisfy the final condition.
    for (let numSuccessesToSum = minimumRequiredCount; numSuccessesToSum <= finalComputationRow; numSuccessesToSum++) {
        cumulativeFinalLikelihood += dpGrid[finalComputationRow][numSuccessesToSum];
    }

    // Output the final computed likelihood, typically formatted to a certain precision.
    console.log(cumulativeFinalLikelihood.toFixed(10)); // Presenting with 10 decimal places for accuracy
})(require('fs').readFileSync('/dev/stdin')); // The entire logic is executed immediately with input from standard input.