function processInputData(rawInputString) {
    const lines = rawInputString.split("\n");
    const firstLineParts = lines[0].split(" ");

    let currentA = parseInt(firstLineParts[0], 10);
    const initialA = currentA;
    let currentB = parseInt(firstLineParts[1], 10);
    const initialB = currentB;

    const MAX_PRIME_CANDIDATE = 100000;

    const primeFactorsA = new Array(MAX_PRIME_CANDIDATE + 1).fill(0);
    const primeFactorsB = new Array(MAX_PRIME_CANDIDATE + 1).fill(0);

    let calculatedProduct = 1;

    for (let primeCandidate = 2; primeCandidate <= MAX_PRIME_CANDIDATE; primeCandidate++) {
        while (currentA > 1 && currentA % primeCandidate === 0) {
            currentA /= primeCandidate;
            primeFactorsA[primeCandidate]++;
        }
        while (currentB > 1 && currentB % primeCandidate === 0) {
            currentB /= primeCandidate;
            primeFactorsB[primeCandidate]++;
        }
    }

    for (let primeCandidate = 2; primeCandidate <= MAX_PRIME_CANDIDATE; primeCandidate++) {
        const countForA = primeFactorsA[primeCandidate];
        const countForB = primeFactorsB[primeCandidate];

        let currentFactorExponent = 0;
        if (countForA > 0 && countForB > 0) {
            currentFactorExponent = Math.min(countForA, countForB);
        } else if (countForA > 0) {
            currentFactorExponent = countForA;
        } else if (countForB > 0) {
            currentFactorExponent = countForB;
        }

        if (currentFactorExponent > 0) {
            calculatedProduct *= Math.pow(primeCandidate, currentFactorExponent);
        }
    }

    let finalResult = 0;

    if (calculatedProduct > finalResult) {
        finalResult = calculatedProduct;
    }
    if (initialA > finalResult) {
        finalResult = initialA;
    }
    if (initialB > finalResult) {
        finalResult = initialB;
    }

    console.log(finalResult);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
