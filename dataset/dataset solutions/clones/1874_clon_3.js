const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

(function processBookData(inputString) {

    const dataRows = inputString.split("\n");
    const initialParameters = dataRows[0].split(" ").map(Number);

    const numBooks = initialParameters[0];
    const numSkills = initialParameters[1];
    const minSkillLevel = initialParameters[2];

    const bookCosts = [];
    const skillIncrements = [];

    for (let bookIndex = 0; bookIndex < numBooks; bookIndex++) {
        const currentBookRow = dataRows[bookIndex + 1].split(" ").map(Number);
        const costOfBook = currentBookRow[0];
        const skillLevelsFromBook = currentBookRow.slice(1);

        bookCosts[bookIndex] = costOfBook;
        skillIncrements[bookIndex] = skillLevelsFromBook;
    }

    const generatedBookSubsets = [];
    const lastPossibleBookIndex = numBooks - 1;

    for (let currentSubsetSize = 1; currentSubsetSize <= numBooks; currentSubsetSize++) {
        let activeCombinationIndices = [];
        let currentCombinationDepth = 0;
        let lastIndexConsidered = -1;

        while (lastIndexConsidered !== undefined) {
            if (currentCombinationDepth === currentSubsetSize) {
                generatedBookSubsets.push([...activeCombinationIndices]);
                lastIndexConsidered = activeCombinationIndices.pop();
                currentCombinationDepth--;
            } else if (lastIndexConsidered >= lastPossibleBookIndex) {
                lastIndexConsidered = activeCombinationIndices.pop();
                currentCombinationDepth--;
            } else {
                lastIndexConsidered++;
                activeCombinationIndices.push(lastIndexConsidered);
                currentCombinationDepth++;
            }
        }
    }

    let minimumOverallCost = Infinity;
    let currentBookSelection = null;

    while (currentBookSelection = generatedBookSubsets.pop()) {
        let totalAccumulatedCost = 0;
        const currentSkillProgress = new Array(numSkills).fill(0);

        for (const selectedBookIdx of currentBookSelection) {
            for (let skillDimension = 0; skillDimension < numSkills; skillDimension++) {
                currentSkillProgress[skillDimension] += skillIncrements[selectedBookIdx][skillDimension];
            }
            totalAccumulatedCost += bookCosts[selectedBookIdx];
        }

        let allSkillRequirementsMet = true;
        for (const skillValue of currentSkillProgress) {
            if (skillValue < minSkillLevel) {
                allSkillRequirementsMet = false;
                break;
            }
        }

        if (allSkillRequirementsMet) {
            minimumOverallCost = Math.min(minimumOverallCost, totalAccumulatedCost);
        }
    }

    console.log(minimumOverallCost === Infinity ? -1 : minimumOverallCost);

})(rawData);
