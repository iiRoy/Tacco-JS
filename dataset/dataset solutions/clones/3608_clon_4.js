const calculateFactors = (inputNumber) => {
    if (inputNumber === 0) return 0;

    return Array.from({ length: inputNumber }, (_, index) => index + 1)
                .filter(potentialFactor => inputNumber % potentialFactor === 0)
                .length;
};

const analyzeRange = (textualInput) => {
    const upperLimit = parseInt(textualInput, 10);

    const finalCount = Array.from({ length: upperLimit }, (_, index) => index + 1)
                           .filter(currentValue => currentValue % 2 !== 0)
                           .filter(oddValue => calculateFactors(oddValue) === 8)
                           .length;

    console.log(finalCount);
};

analyzeRange(require("fs").readFileSync("/dev/stdin", "utf8"));