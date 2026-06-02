const processStaircase = (rawInput) => {
    const primeModulus = 1000000007;

    const inputLines = rawInput.trim().split('\n');
    const [maxStair, forbiddenCount] = inputLines[0].split(' ').map(Number);

    const forbiddenSteps = inputLines.slice(1, forbiddenCount + 1).map(Number);

    const hasAdjacentForbidden = forbiddenSteps.slice(0, forbiddenCount - 1)
        .some((currentStep, index) => forbiddenSteps[index + 1] - currentStep === 1);

    if (hasAdjacentForbidden) {
        return 0;
    }

    function* generateGapSizes(stairLimit, forbiddenPoints) {
        const numForbidden = forbiddenPoints.length;

        yield forbiddenPoints[0] - 1;

        for (let index = 1; index < numForbidden; index++) {
            yield forbiddenPoints[index] - forbiddenPoints[index - 1] - 2;
        }

        yield stairLimit - forbiddenPoints[numForbidden - 1] - 1;
    }

    const gapSizes = Array.from(generateGapSizes(maxStair, forbiddenSteps));

    const fibCache = new Map();
    fibCache.set(0, 1);
    fibCache.set(1, 1);
    fibCache.set(2, 2);

    const getFibLikeCombinations = (gapLength) => {
        if (gapLength < 0) {
            return 0;
        }
        if (fibCache.has(gapLength)) {
            return fibCache.get(gapLength);
        }
        const calculatedResult = (getFibLikeCombinations(gapLength - 1) + getFibLikeCombinations(gapLength - 2)) % primeModulus;
        fibCache.set(gapLength, calculatedResult);
        return calculatedResult;
    };

    const gapCombinations = gapSizes.map(getFibLikeCombinations);

    const totalCombinations = gapCombinations.reduce((accumulator, currentVal) =>
        (accumulator * currentVal) % primeModulus, 1);

    return totalCombinations;
};

const executeStaircaseCalculation = (inputPath) => {
    const fileContent = require('fs').readFileSync(inputPath, 'utf8');
    const finalResult = processStaircase(fileContent);
    console.log(finalResult);
};

executeStaircaseCalculation('/dev/stdin');
