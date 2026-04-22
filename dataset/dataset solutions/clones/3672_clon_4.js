function recursiveStateEvaluator(currentLevel, costFactor, triggerLimit, benefitValue, baseLevelReference, encounteredLevels) {
    if (currentLevel >= 2 * baseLevelReference || currentLevel === baseLevelReference) {
        return true;
    }

    if (currentLevel < costFactor) {
        return false;
    }

    if (encounteredLevels.has(currentLevel)) {
        return false;
    }

    encounteredLevels.add(currentLevel);

    let nextLevel;
    if ((currentLevel - costFactor) <= triggerLimit) {
        nextLevel = currentLevel - costFactor + benefitValue;
    } else {
        nextLevel = currentLevel - costFactor;
    }

    return recursiveStateEvaluator(nextLevel, costFactor, triggerLimit, benefitValue, baseLevelReference, encounteredLevels);
}

function performComplexCalculation(rawInputData) {
    const dataSegments = rawInputData.split('\n');
    const numberOfIterations = parseInt(dataSegments[0], 10);

    const results = Array.from({ length: numberOfIterations }, (_, index) => {
        const segmentIndex = index + 1;
        const currentOperationParameters = dataSegments[segmentIndex].split(' ').map(Number);
        const startingResourceLevel = currentOperationParameters[0];
        const expenditureUnit = currentOperationParameters[1];
        const operationThreshold = currentOperationParameters[2];
        const bonusAmount = currentOperationParameters[3];

        let finalVerdict = "No";

        if (startingResourceLevel < expenditureUnit) {
            finalVerdict = "No";
        } else if (bonusAmount < expenditureUnit) {
            finalVerdict = "No";
        } else if (startingResourceLevel < operationThreshold) {
            finalVerdict = "Yes";
        } else {
            // Equivalent to original's A = (A % B) + B;
            const initialCycleState = (startingResourceLevel % expenditureUnit) + expenditureUnit;
            if (recursiveStateEvaluator(initialCycleState, expenditureUnit, operationThreshold, bonusAmount, startingResourceLevel, new Set())) {
                finalVerdict = "Yes";
            }
        }
        return finalVerdict;
    });

    results.forEach(verdict => console.log(verdict));
}

performComplexCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));