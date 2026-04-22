const rawInputContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
const numericalTokens = rawInputContent.trim().split(/\s+/).map(Number);

const firstParameter = numericalTokens[0];
const secondParameter = numericalTokens[1];
const targetValue = numericalTokens[2];

const isEvenlyDivisible = (val, divA, divB) =>
    (val % divA === 0 || val % divB === 0);

const isBelowBothThresholds = (val, thresholdA, thresholdB) =>
    (val < thresholdA && val < thresholdB);

const findEquationMatch = (searchTarget, outerBound, innerBound) =>
    Array.from({ length: outerBound }, (_, primaryIndex) => primaryIndex + 1)
         .some(primaryTerm =>
             Array.from({ length: innerBound }, (_, secondaryIndex) => secondaryIndex + 1)
                  .some(secondaryTerm =>
                      searchTarget === (primaryTerm * outerBound + secondaryTerm * (innerBound - 2 * primaryTerm))
                  )
         );

const evaluateConditions = (paramA, paramB, target) => {
    if (isEvenlyDivisible(target, paramA, paramB)) {
        return 'Yes';
    }

    if (isBelowBothThresholds(target, paramB, paramA)) {
        return 'No';
    }

    if (findEquationMatch(target, paramB, paramA)) {
        return 'Yes';
    }

    if (findEquationMatch(target, paramA, paramB)) {
        return 'Yes';
    }

    return 'No';
};

console.log(evaluateConditions(firstParameter, secondParameter, targetValue));