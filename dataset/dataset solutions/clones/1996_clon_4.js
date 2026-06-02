function modulusOperation(value, divisor) {
    return (value % divisor + divisor) % divisor;
}

function productModulus(factorA, factorB, MOD_VAL) {
    return Number((BigInt(factorA) * BigInt(factorB)) % BigInt(MOD_VAL));
}

function powerModulus(baseVal, exponentVal, MOD_VAL) {
    let powerResult = 1;
    let currentBasePower = baseVal;
    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) {
            powerResult = productModulus(powerResult, currentBasePower, MOD_VAL);
        }
        currentBasePower = productModulus(currentBasePower, currentBasePower, MOD_VAL);
        exponentVal = Math.floor(exponentVal / 2);
    }
    return powerResult;
}

function processInput(rawInput) {
    const MOD_VAL = 1e9 + 7;
    const SPLIT_FACTOR = 1e5;

    const parsedLines = rawInput.trim().split('\n').map(line => line.split(' '));
    const N_val = Number(parsedLines[0][0]);
    const K_val = Number(parsedLines[0][1]);

    const distinctLimits = new Set();
    for (let current_x_for_limit = 1; current_x_for_limit <= K_val; current_x_for_limit++) {
        distinctLimits.add(Math.floor(K_val / current_x_for_limit));
    }

    const basePowersCache = new Map();
    for (const limitVal of distinctLimits) {
        basePowersCache.set(limitVal, powerModulus(limitVal, N_val, MOD_VAL));
    }

    const patternCounts = Array(K_val).fill(0);
    let finalResult = 0;
    const xValuesDescending = Array.from({ length: K_val }, (_, idx) => K_val - idx);

    xValuesDescending.forEach(current_x => {
        const currentLimit = Math.floor(K_val / current_x);
        let tempValue = basePowersCache.get(currentLimit);

        for (let j_factor = 2; j_factor <= currentLimit; j_factor++) {
            tempValue = modulusOperation(tempValue - patternCounts[current_x * j_factor - 1], MOD_VAL);
        }
        finalResult = modulusOperation(finalResult + productModulus(current_x, tempValue, MOD_VAL), MOD_VAL);
        patternCounts[current_x - 1] = tempValue;
    });

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
