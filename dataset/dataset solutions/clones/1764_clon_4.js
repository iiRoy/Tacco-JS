const MOD_CONSTANT = 998244353n;

const calculatePowerModulo = (baseVal, exponentVal, modulusVal) => {
    let outcome = 1n;
    baseVal %= modulusVal;
    while (exponentVal > 0n) {
        if (exponentVal % 2n === 1n) {
            outcome = (outcome * baseVal) % modulusVal;
        }
        baseVal = (baseVal * baseVal) % modulusVal;
        exponentVal /= 2n;
    }
    return outcome;
};

const determineGridValue = (originX, originY, targetX, targetY) => {
    const gridSolutions = new Map();

    const fetchSolution = (xId, yId) => {
        if (!gridSolutions.has(xId)) return undefined;
        return gridSolutions.get(xId).get(yId);
    };

    const storeSolution = (xId, yId, val) => {
        if (!gridSolutions.has(xId)) {
            gridSolutions.set(xId, new Map());
        }
        gridSolutions.get(xId).set(yId, val);
    };

    for (let currentX = originX; currentX <= targetX; currentX++) {
        for (let currentY = originY; currentY <= targetY; currentY++) {
            let computedResult;
            if (currentX === originX) {
                computedResult = calculatePowerModulo(originX, currentY - originY, MOD_CONSTANT);
            } else if (currentY === originY) {
                computedResult = calculatePowerModulo(originY, currentX - originX, MOD_CONSTANT);
            } else {
                let termA = (fetchSolution(currentX - 1n, currentY) * currentY) % MOD_CONSTANT;
                let termB = (fetchSolution(currentX, currentY - 1n) * currentX) % MOD_CONSTANT;
                let termC = (fetchSolution(currentX - 1n, currentY - 1n) * (currentX - 1n) * (currentY - 1n)) % MOD_CONSTANT;

                computedResult = (termA + termB - termC);
                computedResult = (computedResult % MOD_CONSTANT + MOD_CONSTANT) % MOD_CONSTANT;
            }
            storeSolution(currentX, currentY, computedResult);
        }
    }
    return fetchSolution(targetX, targetY);
};

const processInputAndOutput = (dataStream) => {
    const dataLines = dataStream.split("\n");
    const [firstVal, secondVal, thirdVal, fourthVal] = dataLines[0].split(" ").map(textNum => BigInt(textNum));

    const finalCalculatedValue = determineGridValue(firstVal, secondVal, thirdVal, fourthVal);
    console.log(Number(finalCalculatedValue));
};

processInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));