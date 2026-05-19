function processInputAndCalculate(rawInputString) {
    const numericValue = Number(rawInputString.trim());

    const powers = [1, 2, 3];
    const calculatedTerms = powers.map(currentExponent => Math.pow(numericValue, currentExponent));

    const finalSum = calculatedTerms.reduce((sumAccumulator, termValue) => sumAccumulator + termValue, 0);

    console.log(finalSum);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
