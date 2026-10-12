function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineValue = inputLines[0].trim();
    // The original code uses Number(input[0].split(" ")).
    // If input[0] is "3", split(" ") results in ["3"]. Number(["3"]) is 3.
    // This is equivalent to parsing the string directly.
    const totalItemsCount = Number(firstLineValue);

    const dishOrderIndices = inputLines[1].split(" ").map(Number);
    const baseSatisfactionScores = inputLines[2].split(" ").map(Number);
    const bonusSatisfactionScores = inputLines[3].split(" ").map(Number);

    let accumulatedTotalScore = 0;

    // Helper function to determine if an adjacency bonus applies
    const getAdjacencyBonus = (currentDishId, previousDishId, bonusScoresArray) => {
        // The original condition `a[i] === a[i-1]+1` for `i=0`
        // results in `a[0] === undefined + 1`, which is `a[0] === NaN`.
        // This evaluates to `false`, so no bonus is added for the first item.
        // We replicate this by checking if previousDishId is undefined.
        if (previousDishId === undefined) {
            return 0;
        }
        if (currentDishId === previousDishId + 1) {
            // Original: c[a[i]-2]
            // a[i]-2 is equivalent to currentDishId - 2
            return bonusScoresArray[currentDishId - 2];
        }
        return 0;
    };

    for (let currentIterationIndex = 0; currentIterationIndex < totalItemsCount; ++currentIterationIndex) {
        const currentDishIdentifier = dishOrderIndices[currentIterationIndex];
        const baseScoreLookupIndex = currentDishIdentifier - 1;

        // Add the base score for the current dish
        accumulatedTotalScore += baseSatisfactionScores[baseScoreLookupIndex];

        let previousDishIdentifier;
        // Check if it's not the first item to get the previous dish ID
        if (currentIterationIndex > 0) {
            previousDishIdentifier = dishOrderIndices[currentIterationIndex - 1];
        } else {
            // For the first item, previousDishIdentifier remains undefined,
            // which correctly prevents the bonus from being added.
            previousDishIdentifier = undefined;
        }

        // Calculate and add any applicable bonus score
        const bonusValue = getAdjacencyBonus(
            currentDishIdentifier,
            previousDishIdentifier,
            bonusSatisfactionScores
        );
        accumulatedTotalScore += bonusValue;
    }

    console.log(accumulatedTotalScore);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
