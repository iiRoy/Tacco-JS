function calculateAdjustedValue(originalPart, rateX, rateY) {
    const rateFactorX = 100 + rateX;
    const rateFactorY = 100 + rateY;

    let intermediateVal = Math.floor(originalPart / rateFactorX * 100) + 1;
    while (intermediateVal * rateFactorX / 100 >= originalPart + 1) {
        intermediateVal--;
    }

    if (intermediateVal * rateFactorX / 100 < originalPart) {
        return { result: 0, isValid: false };
    }

    let finalVal = Math.floor(intermediateVal * rateFactorY / 100);
    if (finalVal + 1 === intermediateVal * rateFactorY / 100) {
        finalVal++;
    }
    return { result: finalVal, isValid: true };
}

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    let currentLineIndex = 0;

    while (true) {
        const lineParts = inputLines[currentLineIndex].split(" ");

        const paramX = parseInt(lineParts[0], 10);
        const paramY = parseInt(lineParts[1], 10);
        const targetSum = parseInt(lineParts[2], 10);

        if (paramX === 0 && paramY === 0 && targetSum === 0) {
            break;
        }

        let maxAchievedSum = 0;

        for (let leftComponent = 1; leftComponent < targetSum; leftComponent++) {
            const components = [leftComponent, targetSum - leftComponent];
            let currentIterationSum = 0;
            let isCombinationValid = true;

            for (let componentIdx = 0; componentIdx < 2; componentIdx++) {
                const componentPart = components[componentIdx];
                const calculationResult = calculateAdjustedValue(componentPart, paramX, paramY);

                if (!calculationResult.isValid) {
                    isCombinationValid = false;
                    break;
                }
                currentIterationSum += calculationResult.result;
            }

            if (!isCombinationValid) {
                continue;
            }

            if (currentIterationSum > maxAchievedSum) {
                maxAchievedSum = currentIterationSum;
            }
        }
        console.log(maxAchievedSum);
        currentLineIndex++;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
