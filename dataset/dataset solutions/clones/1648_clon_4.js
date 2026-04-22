const processInputData = (rawTextPayload) => {
    const dataLines = rawTextPayload.trim().split('\n');
    const firstLineSegments = dataLines[0].split(' ');
    const thresholdValue = Number(dataLines[1]);
    return {
        stringVal1: firstLineSegments[0],
        stringVal2: firstLineSegments[1],
        stringVal3: firstLineSegments[2],
        numericThreshold: thresholdValue
    };
};

const determineScorePrimary = (operandStringA, operandStringB) => {
    const numericA = Number(operandStringA);
    const numericB = Number(operandStringB);

    const conditionSet = [
        { test: (sA, sB, nA, nB) => sB > sA, outcome: 0 },
        { test: (sA, sB, nA, nB) => sB === sA, outcome: 1 },
        { test: (sA, sB, nA, nB) => sB < sA && 2 * nB >= nA, outcome: 1 },
        { test: (sA, sB, nA, nB) => 2 * nB < nA && 4 * nB >= nA, outcome: 2 },
        { test: (sA, sB, nA, nB) => 4 * nB < nA && 8 * nB >= nA, outcome: 3 }
    ];

    for (const rule of conditionSet) {
        if (rule.test(operandStringA, operandStringB, numericA, numericB)) {
            return rule.outcome;
        }
    }
    return Number.POSITIVE_INFINITY; // Mimics unassigned variable behavior (NaN in sum, then 'No')
};

const determineScoreSecondary = (operandStringB, operandStringC) => {
    const numericB = Number(operandStringB);
    const numericC = Number(operandStringC);

    // Note: The original code contains a typo `2*2*V>=B` instead of `2*2*C>=B`.
    // In JavaScript, if `V` is an undeclared variable in non-strict mode, it becomes `undefined`.
    // `2*2*undefined` results in `NaN`. `NaN >= B` is always `false`.
    // Therefore, the `p=2` branch in the original code is effectively unreachable.

    const conditionSet = [
        { test: (sB, sC, nB, nC) => sC > sB, outcome: 0 },
        { test: (sB, sC, nB, nC) => sC === sB, outcome: 1 },
        { test: (sB, sC, nB, nC) => sC < sB && 2 * nC >= nB, outcome: 1 },
        // The p=2 case is omitted here to replicate the original code's behavior due to the `V` typo.
        { test: (sB, sC, nB, nC) => 4 * nC < nB && 8 * nC >= nB, outcome: 3 }
    ];

    for (const rule of conditionSet) {
        if (rule.test(operandStringB, operandStringC, numericB, numericC)) {
            return rule.outcome;
        }
    }
    return Number.POSITIVE_INFINITY; // Mimics unassigned variable behavior (NaN in sum, then 'No')
};

const executeMainLogic = (initialPayload) => {
    const { stringVal1, stringVal2, stringVal3, numericThreshold } = processInputData(initialPayload);

    const firstResult = determineScorePrimary(stringVal1, stringVal2);
    const secondResult = determineScoreSecondary(stringVal2, stringVal3);

    const finalSum = firstResult + secondResult;
    const finalDecision = finalSum <= numericThreshold ? "Yes" : "No";

    console.log(finalDecision);
};

executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));