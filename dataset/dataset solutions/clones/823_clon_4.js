const processInputData = (incomingText) => {
    return incomingText
        .trim()
        .split('\n')
        .map(Number)
        .filter(val => val !== 0);
};

const extractOddFactor = (numberValue) => {
    while (numberValue > 0 && numberValue % 2 === 0) {
        numberValue /= 2;
    }
    return numberValue;
};

const determineOddFactorCount = (oddPartNumber) => {
    if (oddPartNumber === 1) {
        return 1;
    }
    let factorQuantifier = 0;
    for (let currentFactorCandidate = 1; currentFactorCandidate * currentFactorCandidate <= oddPartNumber; currentFactorCandidate += 2) {
        if (oddPartNumber % currentFactorCandidate === 0) {
            if (currentFactorCandidate * currentFactorCandidate === oddPartNumber) {
                factorQuantifier += 1;
            } else {
                factorQuantifier += 2;
            }
        }
    }
    return factorQuantifier;
};

const computeConsecutiveSumWays = (inputNumeric) => {
    const oddSection = extractOddFactor(inputNumeric);
    const totalOddFactors = determineOddFactorCount(oddSection);
    return totalOddFactors - 1;
};

const initiateCalculation = (sourceData) => {
    const numericalInputs = processInputData(sourceData);
    const resultsCollection = numericalInputs.map(computeConsecutiveSumWays);
    resultsCollection.forEach(outcome => console.log(outcome));
};

initiateCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));