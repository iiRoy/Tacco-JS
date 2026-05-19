function solveProblem(rawInput) {
    const [firstParam, secondParam, thirdParam] = rawInput.trim().split('\n')[0].split(' ').map(Number);

    const dimensionA = firstParam;
    const dimensionB = secondParam;
    const targetValue = thirdParam;

    const calculateExpressionOne = (iterI, iterJ, nVal, mVal) => {
        return iterI * mVal + iterJ * (nVal - 2 * iterI);
    };

    const calculateExpressionTwo = (iterI, iterJ, nVal, mVal) => {
        return iterI * nVal + iterJ * (mVal - 2 * iterI);
    };

    if (targetValue % dimensionA === 0 || targetValue % dimensionB === 0) {
        console.log('Yes');
        return;
    }

    if (targetValue < dimensionB && targetValue < dimensionA) {
        console.log('No');
        return;
    }

    const checkCombinations = (limitI, limitJ, currentTarget, nRef, mRef, expressionCalculator) => {
        return Array.from({ length: limitI }, (_, iIndex) => iIndex + 1).some(iCounter => {
            return Array.from({ length: limitJ }, (_, jIndex) => jIndex + 1).some(jCounter => {
                return expressionCalculator(iCounter, jCounter, nRef, mRef) === currentTarget;
            });
        });
    };

    const foundInFirstSet = checkCombinations(
        dimensionB,
        dimensionA,
        targetValue,
        dimensionA,
        dimensionB,
        calculateExpressionOne
    );

    if (foundInFirstSet) {
        console.log('Yes');
        return;
    }

    const foundInSecondSet = checkCombinations(
        dimensionA,
        dimensionB,
        targetValue,
        dimensionA,
        dimensionB,
        calculateExpressionTwo
    );

    if (foundInSecondSet) {
        console.log('Yes');
        return;
    }

    console.log('No');
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
