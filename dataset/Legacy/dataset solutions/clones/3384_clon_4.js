const decomposeNumberIntoPrimes = (initialNum) => {
    const collectFactors = (currentNum, currentDivisor, accumulatedFactors) => {
        if (currentNum === 1) {
            return accumulatedFactors;
        }
        if (currentDivisor * currentDivisor > currentNum) {
            return [...accumulatedFactors, { basePrime: currentNum, primePower: 1 }];
        }

        let currentPower = 0;
        let tempNumForPower = currentNum;
        for (; tempNumForPower % currentDivisor === 0; tempNumForPower /= currentDivisor) {
            currentPower++;
        }

        if (currentPower > 0) {
            return collectFactors(tempNumForPower, currentDivisor + 1, [...accumulatedFactors, { basePrime: currentDivisor, primePower: currentPower }]);
        } else {
            return collectFactors(currentNum, currentDivisor + 1, accumulatedFactors);
        }
    };
    return collectFactors(initialNum, 2, []);
};

const processInputAndCompute = (inputString) => {
    const [rootDegree, targetNumber] = inputString.split(" ").map(Number);
    const primeDecomposition = decomposeNumberIntoPrimes(targetNumber);

    const resultValue = primeDecomposition.reduce((accumulator, factor) => {
        const effectivePower = Math.floor(factor.primePower / rootDegree);
        return accumulator * (factor.basePrime ** effectivePower);
    }, 1);

    console.log(resultValue);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
