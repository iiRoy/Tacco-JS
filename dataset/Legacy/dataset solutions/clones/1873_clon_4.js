function processChallenge(rawData) {
    const allLines = rawData.split("\n");
    const firstLineParts = allLines[0].split(' ');
    const bookCount = Number(firstLineParts[0]);
    const skillCount = Number(firstLineParts[1]);
    const requiredSkill = Number(firstLineParts[2]);

    const costs = [];
    const skillMatrix = [];

    for (let lineIdx = 1; lineIdx < allLines.length; lineIdx++) {
        const currentLineValues = allLines[lineIdx].split(' ').map(Number);
        if (currentLineValues.length === 0 || isNaN(currentLineValues[0])) {
            continue;
        }
        costs.push(currentLineValues[0]);
        skillMatrix.push(currentLineValues.slice(1));
    }

    let minimumAchievableCost = Infinity;

    // Iterate through all possible combinations of books using a bitmask.
    // Each 'comboMask' represents a unique subset of books.
    // If the k-th bit of comboMask is 1, then book k is selected.
    for (let comboMask = 0; comboMask < (1 << bookCount); comboMask++) {
        let currentCombinationCost = 0;
        // Initialize skill levels for the current combination to zero.
        let currentSkillLevels = new Array(skillCount).fill(0);

        // Evaluate each book based on the current combination mask.
        for (let bookIndex = 0; bookIndex < bookCount; bookIndex++) {
            // Check if the bookIndex-th bit is set in comboMask.
            // If it is, this book is considered "bought" for the current combination.
            if ((comboMask >> bookIndex) & 1) {
                currentCombinationCost += costs[bookIndex];
                // Add skill gains from this selected book to the total skill levels.
                for (let skillIndex = 0; skillIndex < skillCount; skillIndex++) {
                    currentSkillLevels[skillIndex] += skillMatrix[bookIndex][skillIndex];
                }
            }
        }

        // After processing all books for the current combination,
        // check if all skill requirements are met.
        let allSkillsMet = true;
        for (let skillIndex = 0; skillIndex < skillCount; skillIndex++) {
            if (currentSkillLevels[skillIndex] < requiredSkill) {
                allSkillsMet = false;
                break; // If any skill is below the target, this combination is invalid.
            }
        }

        // If all skill requirements are met, update the minimum cost found so far.
        if (allSkillsMet) {
            minimumAchievableCost = Math.min(minimumAchievableCost, currentCombinationCost);
        }
    }

    console.log(minimumAchievableCost === Infinity ? -1 : minimumAchievableCost);
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
