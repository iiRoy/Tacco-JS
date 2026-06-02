const processInputData = (rawData) => {
    const lineSegments = rawData.split('\n');
    const firstLineNumeric = lineSegments[0].split(' ').map(strVal => parseInt(strVal, 10));
    const totalSegmentsBudget = firstLineNumeric[0];
    const availableDigitCount = firstLineNumeric[1];
    const rawAvailableDigits = lineSegments[1].split(' ').map(strVal => parseInt(strVal, 10)).sort((a, b) => b - a);
    return { totalSegmentsBudget, availableDigitCount, rawAvailableDigits };
};

const segmentCostMapping = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

const determineOptimalDigits = (inputDigits, costMap) => {
    const costToLargestDigit = new Map();
    for (const currentDigitValue of inputDigits) {
        const associatedCost = costMap[currentDigitValue];
        if (!costToLargestDigit.has(associatedCost) || currentDigitValue > costToLargestDigit.get(associatedCost)) {
            costToLargestDigit.set(associatedCost, currentDigitValue);
        }
    }
    return Array.from(costToLargestDigit.entries())
                .map(([cost, digit]) => [digit, cost])
                .sort((pairA, pairB) => pairA[1] - pairB[1]);
};

const constructLargestNumber = (budgetLimit, digitCostPairs) => {
    const bestNumberStrings = new Array(budgetLimit + 1).fill(null);
    bestNumberStrings[0] = "";

    for (let currentBudgetAmount = 1; currentBudgetAmount <= budgetLimit; currentBudgetAmount++) {
        for (const [digitValue, segmentCost] of digitCostPairs) {
            if (currentBudgetAmount >= segmentCost) {
                const previousBudgetResult = bestNumberStrings[currentBudgetAmount - segmentCost];
                if (previousBudgetResult !== null) {
                    const candidateNumberString = previousBudgetResult + String(digitValue);
                    const existingBestString = bestNumberStrings[currentBudgetAmount];

                    if (existingBestString === null ||
                        candidateNumberString.length > existingBestString.length ||
                        (candidateNumberString.length === existingBestString.length && candidateNumberString > existingBestString)) {
                        bestNumberStrings[currentBudgetAmount] = candidateNumberString;
                    }
                }
            }
        }
    }
    return bestNumberStrings[budgetLimit] || "";
};

const executeProgram = (programInput) => {
    const { totalSegmentsBudget, rawAvailableDigits } = processInputData(programInput);
    const optimalDigitCostPairs = determineOptimalDigits(rawAvailableDigits, segmentCostMapping);
    const finalConstructedNumber = constructLargestNumber(totalSegmentsBudget, optimalDigitCostPairs);
    console.log(finalConstructedNumber);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
