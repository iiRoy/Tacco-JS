const obtainPrimeFactors = (valueToFactor) => {
    let currentNumber = valueToFactor;
    const factorComponents = [];

    for (let currentFactorCandidate = 2; currentFactorCandidate * currentFactorCandidate <= currentNumber; currentFactorCandidate++) {
        let factorPower = 0;
        if (currentNumber % currentFactorCandidate === 0) {
            while (currentNumber % currentFactorCandidate === 0) {
                currentNumber = currentNumber / currentFactorCandidate;
                factorPower++;
            }
            factorComponents.push({ primeBase: currentFactorCandidate, powerValue: factorPower });
        }
    }

    if (currentNumber > 1) {
        factorComponents.push({ primeBase: currentNumber, powerValue: 1 });
    }
    return factorComponents;
};

const executeCalculation = (inputLine) => {
    const inputParts = inputLine.split(" ");
    const divisorQuantity = Number(inputParts[0]);
    const initialNumber = Number(inputParts[1]);

    const primeDecomposition = obtainPrimeFactors(initialNumber);

    let finalResult = 1;
    for (const factorEntry of primeDecomposition) {
        const calculatedExponent = Math.floor(factorEntry.powerValue / divisorQuantity);
        if (calculatedExponent > 0) {
            finalResult *= (factorEntry.primeBase ** calculatedExponent);
        }
    }
    console.log(finalResult);
};

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
