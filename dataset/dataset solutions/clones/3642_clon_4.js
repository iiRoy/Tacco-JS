function calculateMinimumUnits(inputData) {
    let rawLines = inputData.split("\n");

    let initialParameters = rawLines.shift().split(" ").map(Number);
    let numberOfProblemTypes = initialParameters[0];
    let targetScoreValue = initialParameters[1] / 100;

    let allChallengeStructures = Array.from({ length: numberOfProblemTypes }, (_, typeIdentifier) => {
        let structureDetails = rawLines.shift().split(" ").map(Number);
        return {
            ordinal: typeIdentifier,
            unitCount: structureDetails[0],
            completionBonus: structureDetails[1] / 100,
            scorePerUnit: typeIdentifier + 1
        };
    });

    let resultContainer = [];
    const totalPossibleSelections = 1 << numberOfProblemTypes;

    for (let selectionIndex = 0; selectionIndex < totalPossibleSelections; selectionIndex++) {
        let currentTotalUnits = 0;
        let currentTotalScore = 0;
        let availableForPartialCompletion = [];

        for (let typePosition = 0; typePosition < numberOfProblemTypes; typePosition++) {
            if ((selectionIndex >> typePosition) & 1) { // Check if the bit for this type is set
                let currentType = allChallengeStructures[typePosition];
                currentTotalUnits += currentType.unitCount;
                currentTotalScore += (currentType.unitCount * currentType.scorePerUnit) + currentType.completionBonus;
            } else {
                availableForPartialCompletion.push(allChallengeStructures[typePosition]);
            }
        }

        if (currentTotalScore >= targetScoreValue) {
            resultContainer.push(currentTotalUnits);
            continue;
        }

        for (let remainingType of availableForPartialCompletion) {
            let scoreRequired = targetScoreValue - currentTotalScore;
            let unitsToGather = Math.floor(scoreRequired / remainingType.scorePerUnit);

            if (unitsToGather <= remainingType.unitCount - 1) {
                resultContainer.push(currentTotalUnits + unitsToGather);
            }
        }
    }

    return Math.min(...resultContainer);
}

// The following part is for execution environment setup, not part of the clone.
// It's similar to the original's bottom part, but adapted for the new function name.
((paramA, paramB, paramC) => "undefined" != typeof require ? console.log(calculateMinimumUnits(require("fs").readFileSync("/dev/stdin", "utf8"))) : [paramA = paramA.split("\n").slice(1, -1).join("\n"), paramB = function() { try { return calculateMinimumUnits(paramA) } catch (paramD) { return paramD.stack || paramD.message } }(), paramC = typeof paramB, "string" == paramC || (paramB = JSON.stringify(paramB)), $("<form>").append([[10, paramA], 0, [1, paramC], 0, [10, paramB]].map(paramE => $(paramE ? "<textarea>" : "<br>", paramE && { rows: paramE[0], cols: 40, text: paramE[1] }))).appendTo("body")])(`
2 700
3 500
5 800
`);