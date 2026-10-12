const displayOutput = (content) => {
  console.log(content);
};

const calculateDigitCount = (num) => Math.floor(Math.log10(num)) + 1;

const calculateMaxDigitLength = (valA, valB) => Math.max(calculateDigitCount(valA), calculateDigitCount(valB));

function* generateDivisorPairs(targetValue) {
    for (let currentFactor = 1; currentFactor * currentFactor <= targetValue; currentFactor++) {
        if (targetValue % currentFactor === 0) {
            yield [currentFactor, targetValue / currentFactor];
        }
    }
}

const processInput = (rawInput) => {
    const numericValue = parseInt(rawInput);

    if (numericValue === 1) {
        displayOutput("1");
        return;
    }

    let minimumCombinedLength = Infinity;

    for (const [factorOne, factorTwo] of generateDivisorPairs(numericValue)) {
        const currentPairLength = calculateMaxDigitLength(factorOne, factorTwo);
        minimumCombinedLength = Math.min(minimumCombinedLength, currentPairLength);
    }

    displayOutput(minimumCombinedLength);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
