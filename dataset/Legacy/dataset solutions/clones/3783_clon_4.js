const MOD_VAL = 998244353;

function multiplyMod(valA, valB) {
    return (valA * valB) % MOD_VAL;
}

function powerMod(baseVal, exponentVal) {
    if (exponentVal === 0) {
        return 1;
    }
    if (exponentVal % 2 === 0) {
        const halfPower = powerMod(baseVal, exponentVal / 2);
        return multiplyMod(halfPower, halfPower);
    } else {
        const halfPower = powerMod(baseVal, Math.floor(exponentVal / 2));
        return multiplyMod(multiplyMod(halfPower, halfPower), baseVal);
    }
}

let cachedFactorials = [1];
let cachedInverseFactorials = [1];

function precomputeCombinatorics(upperBound) {
    while (cachedFactorials.length <= upperBound) {
        const currentIdx = cachedFactorials.length;
        cachedFactorials[currentIdx] = multiplyMod(cachedFactorials[currentIdx - 1], currentIdx);
        cachedInverseFactorials[currentIdx] = powerMod(cachedFactorials[currentIdx], MOD_VAL - 2);
    }
}

function calculateCombinations(nVal, rVal) {
    if (rVal < 0 || rVal > nVal) {
        return 0;
    }
    precomputeCombinatorics(nVal);

    const numerator = cachedFactorials[nVal];
    const denominatorInv = multiplyMod(cachedInverseFactorials[rVal], cachedInverseFactorials[nVal - rVal]);
    return multiplyMod(numerator, denominatorInv);
}

function processInput(inputString) {
    const numericValues = inputString.split(" ").map(Number);
    const [limitN, factorA, factorB, targetK] = numericValues;

    const finalResult = Array.from({ length: limitN + 1 }, (_, indexI) => indexI)
        .reduce((accumulator, indexI) => {
            const remainingK = targetK - indexI * factorA;

            if (remainingK < 0) {
                return accumulator;
            }

            if (remainingK % factorB === 0) {
                const countB = remainingK / factorB;
                if (countB >= 0 && countB <= limitN) {
                    const term1 = calculateCombinations(limitN, indexI);
                    const term2 = calculateCombinations(limitN, countB);
                    const productTerm = multiplyMod(term1, term2);
                    return (accumulator + productTerm) % MOD_VAL;
                }
            }
            return accumulator;
        }, 0);

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
