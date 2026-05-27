function processInput(rawData) {
    const lines = rawData.split("\n");

    const initialColorStrings = lines[0].split(" ");
    const initialRed = parseInt(initialColorStrings[0]);
    const initialGreen = parseInt(initialColorStrings[1]);
    const initialBlue = parseInt(initialColorStrings[2]);

    const baseColors = [initialRed, initialGreen, initialBlue];

    const operationDepth = parseInt(lines[1]);

    let isConditionMet = false;

    const checkAscendingOrder = (colorsArray) => {
        return colorsArray[0] < colorsArray[1] && colorsArray[1] < colorsArray[2];
    };

    const applyOperationsAndCheck = (kValue, chosenIndices, originalValues, foundResultRef) => {
        const tempColors = [...originalValues];

        for (let i = 0; i < kValue; i++) {
            const currentLoopIndex = chosenIndices[i];
            
            if (kValue >= 5 && i === 4) {
                tempColors[currentLoopIndex] = tempColors[chosenIndices[3]] * 2;
            } else if (kValue === 7 && i === 6) {
                tempColors[currentLoopIndex] = tempColors[chosenIndices[5]] * 2;
            } else {
                tempColors[currentLoopIndex] *= 2;
            }
        }

        const conditionMetForThisCombination = checkAscendingOrder(tempColors);
        if (conditionMetForThisCombination) {
            foundResultRef.value = true;
            if (kValue === 1) {
                console.log("Yes");
            }
        }
        return conditionMetForThisCombination;
    };

    const generateAndCheckCombinations = (currentLevel, maxLevel, chosenIndices, originalValues, foundResultRef) => {
        if (foundResultRef.value) {
            return;
        }

        if (currentLevel === maxLevel) {
            applyOperationsAndCheck(maxLevel, chosenIndices, originalValues, foundResultRef);
            return;
        }

        for (let idx = 0; idx < 3; idx++) {
            chosenIndices[currentLevel] = idx;
            generateAndCheckCombinations(currentLevel + 1, maxLevel, chosenIndices, originalValues, foundResultRef);
            if (foundResultRef.value) {
                return;
            }
        }
    };

    if (operationDepth === 0) {
        isConditionMet = false;
    } else {
        const selectedIndices = new Array(operationDepth);
        const resultContainer = { value: false };
        generateAndCheckCombinations(0, operationDepth, selectedIndices, baseColors, resultContainer);
        isConditionMet = resultContainer.value;
    }

    if (isConditionMet) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
