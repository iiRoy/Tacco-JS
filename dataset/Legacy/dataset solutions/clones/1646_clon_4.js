function Main(input) {
    const lines = input.split("\n");
    const initialCardStrings = lines[0].split(" ");
    const initialCardValues = initialCardStrings.map(Number);
    const initialRed = initialCardValues[0];
    const initialGreen = initialCardValues[1];
    const initialBlue = initialCardValues[2];

    const numDoublings = parseInt(lines[1]);

    const checkAscendingOrder = (arr) => arr[0] < arr[1] && arr[1] < arr[2];

    const doublingOperationRegistry = {
        1: (indices, baseValues) => {
            let currentSet = [...baseValues];
            currentSet[indices[0]] *= 2;
            return checkAscendingOrder(currentSet);
        },
        2: (indices, baseValues) => {
            let currentSet = [...baseValues];
            currentSet[indices[0]] *= 2;
            currentSet[indices[1]] *= 2;
            return checkAscendingOrder(currentSet);
        },
        3: (indices, baseValues) => {
            let currentSet = [...baseValues];
            currentSet[indices[0]] *= 2;
            currentSet[indices[1]] *= 2;
            currentSet[indices[2]] *= 2;
            return checkAscendingOrder(currentSet);
        },
        4: (indices, baseValues) => {
            let currentSet = [...baseValues];
            currentSet[indices[0]] *= 2;
            currentSet[indices[1]] *= 2;
            currentSet[indices[2]] *= 2;
            currentSet[indices[3]] *= 2;
            return checkAscendingOrder(currentSet);
        },
        5: (indices, baseValues) => {
            let currentSet = [...baseValues];
            currentSet[indices[0]] *= 2;
            currentSet[indices[1]] *= 2;
            currentSet[indices[2]] *= 2;
            currentSet[indices[3]] *= 2;
            currentSet[indices[4]] = currentSet[indices[3]] * 2;
            return checkAscendingOrder(currentSet);
        },
        6: (indices, baseValues) => {
            let currentSet = [...baseValues];
            currentSet[indices[0]] *= 2;
            currentSet[indices[1]] *= 2;
            currentSet[indices[2]] *= 2;
            currentSet[indices[3]] *= 2;
            currentSet[indices[4]] = currentSet[indices[3]] * 2;
            currentSet[indices[5]] *= 2;
            return checkAscendingOrder(currentSet);
        },
        7: (indices, baseValues) => {
            let currentSet = [...baseValues];
            currentSet[indices[0]] *= 2;
            currentSet[indices[1]] *= 2;
            currentSet[indices[2]] *= 2;
            currentSet[indices[3]] *= 2;
            currentSet[indices[4]] = currentSet[indices[3]] * 2;
            currentSet[indices[5]] *= 2;
            currentSet[indices[6]] = currentSet[indices[5]] * 2;
            return checkAscendingOrder(currentSet);
        },
    };

    function generateAndEvaluate(currentIteration, totalIterations, selectedIndices, originalValues, evaluationFunction) {
        if (currentIteration === totalIterations) {
            return evaluationFunction(selectedIndices, originalValues);
        }

        for (let cardPosition = 0; cardPosition < 3; cardPosition++) {
            selectedIndices.push(cardPosition);
            if (generateAndEvaluate(currentIteration + 1, totalIterations, selectedIndices, originalValues, evaluationFunction)) {
                return true;
            }
            selectedIndices.pop();
        }
        return false;
    }

    let outcomeAchieved = false;
    if (numDoublings >= 1 && numDoublings <= 7) {
        const specificEvaluation = doublingOperationRegistry[numDoublings];
        if (specificEvaluation) {
            outcomeAchieved = generateAndEvaluate(0, numDoublings, [], [initialRed, initialGreen, initialBlue], specificEvaluation);
        }
    }

    if (outcomeAchieved) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
