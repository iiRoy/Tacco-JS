const processGameOutcome = (rawDataStream) => {
    const lines = rawDataStream.trim().split('\n');

    // Parse game settings (N, K, D)
    const settingsParts = lines[0].split(' ').map(Number);
    const gameSettings = {
        roundCount: settingsParts[0],
        penaltyOffset: settingsParts[1],
        dummyValue: settingsParts[2]
    };

    // Parse point definitions (s, p, r)
    const pointParts = lines[1].split(' ').map(Number);
    const pointDefinitions = {
        scissorPoints: pointParts[0],
        paperPoints: pointParts[1],
        rockPoints: pointParts[2]
    };

    // Player's move sequence (the third line as a string)
    const playerSequence = lines[2];

    // Create a lookup map for initial points based on move type
    const movePointLookup = new Map();
    movePointLookup.set('r', pointDefinitions.rockPoints);
    movePointLookup.set('s', pointDefinitions.scissorPoints);
    movePointLookup.set('p', pointDefinitions.paperPoints);

    // Calculate initial points for each move using Array.from and the lookup map
    const initialCalculations = Array.from(playerSequence, (character) =>
        movePointLookup.get(character)
    );

    // Recursive function to apply the penalty rule
    // This function takes the current index, the current state of scores, and the penalty offset.
    // It returns a NEW array for each step, representing the modified state,
    // ensuring a functional approach without direct in-place mutation of the original array.
    const applyPenaltyRecursively = (currentIndex, currentScoreSnapshot, offsetDistance) => {
        if (currentIndex >= currentScoreSnapshot.length) {
            return currentScoreSnapshot; // Base case: all positions checked
        }

        // Create a copy of the current score state for this step's potential modification.
        // This ensures immutability for the previous recursive call's view of the array.
        let nextScoreState = [...currentScoreSnapshot];

        const comparisonIndex = currentIndex + offsetDistance;

        if (comparisonIndex < nextScoreState.length) {
            // If the score at the current position matches the score at the comparison position,
            // zero out the score at the comparison position in this step's new state.
            if (nextScoreState[currentIndex] === nextScoreState[comparisonIndex]) {
                nextScoreState[comparisonIndex] = 0;
            }
        }

        // Recurse with the next index and the potentially modified score state
        return applyPenaltyRecursively(currentIndex + 1, nextScoreState, offsetDistance);
    };

    // Get the final adjusted scores by invoking the recursive penalty application starting from index 0
    const adjustedScores = applyPenaltyRecursively(0, initialCalculations, gameSettings.penaltyOffset);

    // Calculate the total score using a simple for...of loop (divergent from original's reduce)
    let cumulativeScore = 0;
    for (const value of adjustedScores) {
        cumulativeScore += value;
    }

    console.log(cumulativeScore);
};

// Invoke the main processing function with the input from stdin
processGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));