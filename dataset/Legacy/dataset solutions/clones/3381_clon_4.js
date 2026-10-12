process.stdin.resume();
process.stdin.setEncoding('utf8');

const primeDecomposition = (inputNumber) => {
    const factorCounts = new Map();
    let currentNumber = inputNumber;
    let divisorCandidate = 2;

    while (divisorCandidate * divisorCandidate <= currentNumber) {
        if (currentNumber % divisorCandidate === 0) {
            let count = 0;
            while (currentNumber % divisorCandidate === 0) {
                currentNumber /= divisorCandidate;
                count++;
            }
            factorCounts.set(divisorCandidate, count);
        }
        divisorCandidate++;
    }

    if (currentNumber > 1) {
        factorCounts.set(currentNumber, (factorCounts.get(currentNumber) || 0) + 1);
    }

    return Array.from(factorCounts.entries()).map(([primeBase, exponentValue]) => ({
        p: primeBase,
        e: exponentValue
    }));
};

const processInputAndCalculate = (inputString) => {
    const [divisorCount, targetProduct] = inputString.split(" ").map(Number);

    const decomposedFactors = primeDecomposition(targetProduct);

    const finalProduct = decomposedFactors.reduce((accumulator, factorEntry) => {
        const exponentQuotient = Math.floor(factorEntry.e / divisorCount);
        return accumulator * (factorEntry.p ** exponentQuotient);
    }, 1);

    console.log(finalProduct);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
