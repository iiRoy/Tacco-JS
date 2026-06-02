function computeValueDifference(firstMultiplier, inputValue, secondMultiplier, divisorValue) {
    const primaryTerm = firstMultiplier * inputValue;
    const secondaryFactor = inputValue / divisorValue;
    const secondaryTerm = secondMultiplier * secondaryFactor;
    return primaryTerm - secondaryTerm;
}

function processInputAndDisplayResult(rawInputData) {
    const cleanedInputString = rawInputData.trim();
    const numericValue = parseInt(cleanedInputString.split(" ")[0]);

    const result = computeValueDifference(800, numericValue, 200, 15);

    console.log(result);
}

processInputAndDisplayResult(require("fs").readFileSync("/dev/stdin", "utf8"));
