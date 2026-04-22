const getModulus = 1000000007;

const secureAdd = (valA, valB) => {
    return (valA + valB) % getModulus;
};

const secureSubtract = (valA, valB) => {
    return (valA - valB + getModulus) % getModulus;
};

const secureMultiply = (valA, valB) => {
    return (1.0 * valA * valB) % getModulus;
};

const securePower = (baseVal, exponentVal) => {
    let result = 1;
    baseVal %= getModulus;
    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) result = secureMultiply(result, baseVal);
        baseVal = secureMultiply(baseVal, baseVal);
        exponentVal = Math.floor(exponentVal / 2);
    }
    return result;
};

const secureInverse = (numberVal) => {
    return securePower(numberVal, getModulus - 2);
};

const computeCombinations = (nVal, kVal) => {
    if (kVal < 0) {
        return 1;
    }
    if (kVal === 0 || kVal === nVal) {
        return 1;
    }
    if (kVal > nVal) {
        return 0;
    }
    if (kVal > nVal / 2) {
        kVal = nVal - kVal;
    }

    let numeratorProduct = 1;
    let denominatorProduct = 1;

    for (let i = 0; i < kVal; ++i) {
        numeratorProduct = secureMultiply(numeratorProduct, secureSubtract(nVal, i));
        denominatorProduct = secureMultiply(denominatorProduct, i + 1);
    }

    return secureMultiply(numeratorProduct, secureInverse(denominatorProduct));
};

const processTask = (rawText) => {
    const numericalInputs = rawText.trim().split(' ').map(Number);
    const firstDimension = numericalInputs[0];
    const secondDimension = numericalInputs[1];
    const thirdParameter = numericalInputs[2];

    let smallerDimension;
    let largerDimension;
    if (firstDimension < secondDimension) {
        smallerDimension = firstDimension;
        largerDimension = secondDimension;
    } else {
        smallerDimension = secondDimension;
        largerDimension = firstDimension;
    }

    const inverseOfTwo = secureInverse(2);
    const inverseOfSix = secureInverse(6);

    let cumulativeSum = 0;

    for (let pathLength = 1; pathLength <= smallerDimension - 1; ++pathLength) {
        const compA = secureMultiply(pathLength, secureMultiply(pathLength + 1, secureMultiply(pathLength + 2, inverseOfTwo)));
        
        const termB_factor_one = secureSubtract(secureAdd(smallerDimension, largerDimension), secureAdd(secureMultiply(2, pathLength), 2));
        const termB_factor_two = secureMultiply(pathLength + 1, secureMultiply(pathLength + 2, inverseOfTwo));
        const compB = secureMultiply(termB_factor_one, termB_factor_two);
        
        const termC_factor_one = secureSubtract(secureSubtract(smallerDimension, pathLength), 1);
        const termC_factor_two = secureSubtract(secureSubtract(largerDimension, pathLength), 1);
        const compC = secureMultiply(termC_factor_one, secureMultiply(termC_factor_two, secureAdd(pathLength, 1)));
        
        const compD = secureSubtract(secureAdd(smallerDimension, largerDimension), secureMultiply(2, pathLength));

        let intermediateExpression = secureAdd(compA, secureAdd(compB, compC));
        intermediateExpression = secureMultiply(intermediateExpression, 2);
        intermediateExpression = secureSubtract(intermediateExpression, compD);
        cumulativeSum = secureAdd(cumulativeSum, secureMultiply(pathLength, intermediateExpression));
    }

    for (let pathLength = smallerDimension; pathLength <= largerDimension - 1; ++pathLength) {
        const compA = secureMultiply(smallerDimension, secureMultiply(smallerDimension + 1, secureMultiply(smallerDimension + 2, inverseOfSix)));
        
        const termB_factor_one = secureSubtract(secureSubtract(largerDimension, pathLength), 1);
        const termB_factor_two = secureMultiply(smallerDimension, secureMultiply(smallerDimension + 1, inverseOfTwo));
        const compB = secureMultiply(termB_factor_one, termB_factor_two);
        
        const compC = 0;
        
        const compD = secureSubtract(largerDimension, pathLength);

        let intermediateExpression = secureAdd(compA, secureAdd(compB, compC));
        intermediateExpression = secureMultiply(intermediateExpression, 2);
        intermediateExpression = secureSubtract(intermediateExpression, compD);
        cumulativeSum = secureAdd(cumulativeSum, secureMultiply(pathLength, intermediateExpression));
    }

    for (let pathLength = largerDimension; pathLength <= smallerDimension + largerDimension - 2; ++pathLength) {
        const auxiliaryVar = secureSubtract(secureAdd(smallerDimension, largerDimension), secureAdd(pathLength, 1));
        const compA = secureMultiply(auxiliaryVar, secureMultiply(secureAdd(auxiliaryVar, 1), secureMultiply(secureAdd(auxiliaryVar, 2), inverseOfSix)));
        
        let intermediateExpression = secureMultiply(compA, 2);
        cumulativeSum = secureAdd(cumulativeSum, secureMultiply(pathLength, intermediateExpression));
    }

    const comboNumerator = secureSubtract(secureMultiply(smallerDimension, largerDimension), 2);
    const comboDenominator = secureSubtract(thirdParameter, 2);

    const combinatorialFactor = computeCombinations(comboNumerator, comboDenominator);
    const finalResult = secureMultiply(cumulativeSum, combinatorialFactor);

    return finalResult;
};

(function (sourceText) {
    const finalOutcome = processTask(sourceText);
    console.log(finalOutcome);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));