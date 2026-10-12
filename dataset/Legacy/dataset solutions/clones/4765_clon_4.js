function calculateDivisorCountOfFactorial(inputData) {
    const limitValue = parseInt(inputData);

    const primeFlags = new Array(limitValue + 1).fill(true);
    primeFlags[0] = false;
    primeFlags[1] = false;
    for (let p = 2; p * p <= limitValue; p++) {
        if (primeFlags[p]) {
            for (let multiple = p * p; multiple <= limitValue; multiple += p) {
                primeFlags[multiple] = false;
            }
        }
    }

    const primeFactorExponents = new Map();

    for (let currentNum = 2; currentNum <= limitValue; currentNum++) {
        if (primeFlags[currentNum]) {
            let totalExponent = 0;
            let currentPower = currentNum;
            while (currentPower <= limitValue) {
                totalExponent += Math.floor(limitValue / currentPower);
                if (limitValue / currentNum < currentPower) {
                    break;
                }
                currentPower *= currentNum;
            }
            if (totalExponent > 0) {
                primeFactorExponents.set(currentNum, totalExponent);
            }
        }
    }

    let productOfCounts = 1;
    const moduloValue = 1000000007;

    primeFactorExponents.forEach(exponentVal => {
        productOfCounts = (productOfCounts * (exponentVal + 1)) % moduloValue;
    });

    console.log(productOfCounts);
}

calculateDivisorCountOfFactorial(require("fs").readFileSync("/dev/stdin", "utf8"));
