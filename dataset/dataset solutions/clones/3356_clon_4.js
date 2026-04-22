const calculateMaxScore = (rawData) => {
    const contentLines = rawData.split('\n');
    const totalElements = Number(contentLines[0]);
    const heightComponents = contentLines[1].split(' ').map(Number);
    const valueComponents = contentLines[2].split(' ').map(Number);

    const structureUnits = heightComponents.map((hValue, index) => ({
        levelIndicator: hValue,
        pointValue: valueComponents[index]
    }));

    // This accumulator holds the state throughout the processing of each structure unit.
    // `maxAchievedScores[k]` represents the highest score attainable for a structure
    // whose highest point is at least 'k'.
    // `absoluteHighestScore` keeps track of the maximum score found across all possibilities.
    const initialAccumulatorState = {
        maxAchievedScores: Array(totalElements + 1).fill(0),
        absoluteHighestScore: 0
    };

    const finalAccumulatedState = structureUnits.reduce((currentAccumulator, currentUnit) => {
        const { levelIndicator, pointValue } = currentUnit;
        const { maxAchievedScores, absoluteHighestScore } = currentAccumulator;

        // Determine the potential score if this 'currentUnit' is incorporated into a structure.
        // This is the unit's own value plus the best score previously achieved for a structure
        // that already reached 'levelIndicator' or higher.
        const potentialNewScore = pointValue + maxAchievedScores[levelIndicator];

        // Create a new array for the updated scores to represent the next state.
        // This ensures that each reduction step conceptually operates on a new state,
        // even if the array itself is mutated internally for efficiency.
        const updatedAchievedScores = [...maxAchievedScores];

        // Propagate the 'potentialNewScore' to higher levels.
        // The loop optimizes by breaking early because 'updatedAchievedScores' is guaranteed
        // to be a non-decreasing sequence (max score for at least k is <= max score for at least k+1).
        for (let kIndex = levelIndicator; kIndex <= totalElements; ++kIndex) {
            if (potentialNewScore > updatedAchievedScores[kIndex]) {
                updatedAchievedScores[kIndex] = potentialNewScore;
            } else {
                // If the potential new score is not greater than the current score at this level,
                // it won't be greater for any subsequent higher levels either.
                break;
            }
        }

        // Update the overall highest score discovered so far.
        // This is the maximum of the previous absolute highest and the newly updated score
        // at the current unit's level.
        const nextAbsoluteHighestScore = Math.max(absoluteHighestScore, updatedAchievedScores[levelIndicator]);

        return {
            maxAchievedScores: updatedAchievedScores,
            absoluteHighestScore: nextAbsoluteHighestScore
        };
    }, initialAccumulatorState);

    // The final result is the maximum score accumulated throughout the process.
    const computedResult = finalAccumulatedState.absoluteHighestScore;
    console.log('%s', computedResult);
    return computedResult;
};

calculateMaxScore(require("fs").readFileSync("/dev/stdin", "utf8"));