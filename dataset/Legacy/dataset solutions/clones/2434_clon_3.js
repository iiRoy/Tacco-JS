function solveProblem(rawInputString) {
    const lines = rawInputString.trim().split("\n");
    const firstLineParts = lines[0].split(" ");

    const valX = parseInt(firstLineParts[0], 10);
    const valY = parseInt(firstLineParts[1], 10);

    const MOD_VAL = 1e9 + 7;
    const SPLIT_FACTOR = 1e5;

    let finalCombinationResult = 0;

    const sumXY = valX + valY;
    const fourXminusTwoY = 4 * valX - 2 * valY;
    const fourYminusTwoX = 4 * valY - 2 * valX;

    const sumDiv3 = sumXY / 3;
    const rVal = fourXminusTwoY / 6;
    const r2Val = fourYminusTwoX / 6;

    if (sumXY % 3 !== 0) {
        console.log(finalCombinationResult);
        return;
    }

    const areRValuesValid = rVal >= 0 && r2Val >= 0 && Number.isInteger(rVal);

    if (areRValuesValid) {
        const computedCombinations = computeBinomialCoefficientsMod(sumDiv3, rVal, 1, MOD_VAL, SPLIT_FACTOR);
        finalCombinationResult = computedCombinations[0];
    }

    console.log(finalCombinationResult);
}

function performModularMultiplication(factorA, factorB, modulus, splitVal) {
    const quotientPart = (factorB / splitVal) | 0;
    const remainderPart = factorB - (quotientPart * splitVal);

    let productMod = (factorA * quotientPart % modulus) * splitVal % modulus + (factorA * remainderPart);
    productMod %= modulus;
    return productMod;
}

function computeBinomialCoefficientsMod(totalItems, chosenItems, maxIterations, modulusVal, splitFactor) {
    const resultArray = [];
    const factorials = [1, 1];
    const invFactorials = [1, 1];
    const modInverses = [0, 1];

    if (totalItems < chosenItems || totalItems < 0 || chosenItems < 0) {
        return [0];
    }

    const precomputationLoopLimit = maxIterations + totalItems;
    for (let idx = 2; idx < precomputationLoopLimit; idx++) {
        const currentModInverseTerm = (modulusVal / idx) | 0;
        const currentModInverse = modulusVal - performModularMultiplication(modInverses[modulusVal % idx], currentModInverseTerm, modulusVal, splitFactor);
        modInverses.push(currentModInverse);

        factorials.push(performModularMultiplication(factorials[idx - 1], idx, modulusVal, splitFactor));
        invFactorials.push(performModularMultiplication(invFactorials[idx - 1], modInverses[idx], modulusVal, splitFactor));
    }

    const invFactorialNMinusK = invFactorials[totalItems - chosenItems];

    for (let idx = 0; idx < maxIterations; idx++) {
        const termNumerator = factorials[totalItems + idx];
        const termInvDenominatorK = invFactorials[chosenItems + idx];

        const intermediateProduct1 = performModularMultiplication(termNumerator, termInvDenominatorK, modulusVal, splitFactor);
        const finalTerm = performModularMultiplication(intermediateProduct1, invFactorialNMinusK, modulusVal, splitFactor);
        resultArray.push(finalTerm);
    }
    return resultArray;
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
