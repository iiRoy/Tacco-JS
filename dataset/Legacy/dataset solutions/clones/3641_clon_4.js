const parseInteger = (inputString) => parseInt(inputString, 10);
const parseIntegerList = (stringArray) => stringArray.map(parseInteger);

function processChallenge(inputContent) {
    const inputLines = inputContent.split('\n');
    const [problemTypeCount, rawTargetScore] = parseIntegerList(inputLines[0].split(' '));
    const requiredScore = rawTargetScore / 100;

    const problemConfigurations = [];
    for (let i = 0; i < problemTypeCount; i++) {
        const [problemQuantity, bonusValue] = parseIntegerList(inputLines[i + 1].split(' '));
        problemConfigurations.push({
            quantity: problemQuantity,
            bonusPoints: bonusValue / 100,
            pointsPerUnit: i + 1,
            typeIndex: i
        });
    }

    let minimumTotalUnits = Infinity;

    for (let mask = 0; mask < (1 << problemTypeCount); mask++) {
        let currentAccumulatedPoints = 0;
        let currentCompletedUnits = 0;
        const remainingProblemConfigurations = [];

        for (let i = 0; i < problemTypeCount; i++) {
            if ((mask >> i) & 1) {
                const currentProblem = problemConfigurations[i];
                currentAccumulatedPoints += currentProblem.quantity * currentProblem.pointsPerUnit + currentProblem.bonusPoints;
                currentCompletedUnits += currentProblem.quantity;
            } else {
                remainingProblemConfigurations.push(problemConfigurations[i]);
            }
        }

        if (currentAccumulatedPoints >= requiredScore) {
            minimumTotalUnits = Math.min(minimumTotalUnits, currentCompletedUnits);
        } else {
            const pointsStillNeeded = requiredScore - currentAccumulatedPoints;
            let minUnitsFromRemaining = Infinity;

            for (const remainingProblem of remainingProblemConfigurations) {
                const unitsForPartialCompletion = Math.ceil(pointsStillNeeded / remainingProblem.pointsPerUnit);
                if (unitsForPartialCompletion <= remainingProblem.quantity) {
                    minUnitsFromRemaining = Math.min(minUnitsFromRemaining, unitsForPartialCompletion);
                }

                if (remainingProblem.quantity * remainingProblem.pointsPerUnit + remainingProblem.bonusPoints >= pointsStillNeeded) {
                    minUnitsFromRemaining = Math.min(minUnitsFromRemaining, remainingProblem.quantity);
                }
            }

            if (minUnitsFromRemaining !== Infinity) {
                minimumTotalUnits = Math.min(minimumTotalUnits, currentCompletedUnits + minUnitsFromRemaining);
            }
        }
    }

    console.log(minimumTotalUnits);
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
