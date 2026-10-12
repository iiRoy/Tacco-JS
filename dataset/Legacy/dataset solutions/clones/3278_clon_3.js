function processInputData(rawInputString) {
    const parsedNumbers = rawInputString.split("\n").map(Number);

    const calculateAdjustedDifference = (baseIndex, subtractorIndex) => {
        const baseValue = parsedNumbers[baseIndex];
        const subtractorValue = parsedNumbers[subtractorIndex];
        const intermediateSum = baseValue + 1;
        return intermediateSum - subtractorValue;
    };

    const firstFactor = calculateAdjustedDifference(0, 1);
    const secondFactor = calculateAdjustedDifference(0, 2);

    const finalResult = firstFactor * secondFactor;

    console.log(finalResult);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
