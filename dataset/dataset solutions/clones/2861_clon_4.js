const acquireNumericalData = (sourceText) => {
    const digitsPattern = /\d+/g;
    const numericLines = sourceText.trim().split('\n').map(l => Array.from(l.matchAll(digitsPattern), m => Number(m[0])));
    return {
        limit: numericLines[0][0],
        forbiddenPositions: numericLines.slice(1).map(r => r[0])
    };
};

const establishPathCounts = (totalSteps, initialVal) => Array.from({ length: totalSteps + 2 }, () => initialVal);

const processSimulation = (inputString) => {
    const { limit, forbiddenPositions } = acquireNumericalData(inputString);
    const MODULO_VAL = 1000000007;

    const excludedSet = new Set(forbiddenPositions);

    const waysToReach = establishPathCounts(limit, 0);
    waysToReach[0] = 1;

    const finalCounts = Array.from({ length: limit }, (_, idx) => idx + 1)
        .reduce((accumulator, currentStep) => {
            if (excludedSet.has(currentStep)) {
                accumulator[currentStep] = 0;
            } else {
                let currentWays = accumulator[currentStep - 1];
                if (currentStep >= 2) {
                    currentWays = (currentWays + accumulator[currentStep - 2]) % MODULO_VAL;
                }
                accumulator[currentStep] = currentWays;
            }
            return accumulator;
        }, waysToReach);

    return finalCounts[limit];
};

const entryPoint = (dataFeed) => {
    const outcome = processSimulation(dataFeed);
    console.log(outcome);
};

entryPoint(require("node:fs").readFileSync("/dev/stdin", "utf8"));