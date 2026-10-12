function determineAndCompute(firstStringValue, secondStringValue) {
    let calculatedResult;

    if (firstStringValue > secondStringValue) {
        const numericFirst = Number(firstStringValue);
        calculatedResult = (numericFirst * 2) - 1;
    } else if (secondStringValue > firstStringValue) {
        const numericSecond = Number(secondStringValue);
        calculatedResult = (numericSecond * 2) - 1;
    } else {
        const numericFirst = Number(firstStringValue);
        calculatedResult = numericFirst * 2;
    }

    return calculatedResult;
}

function processInputData(rawInputString) {
    const trimmedContent = rawInputString.trim();
    const valueStrings = trimmedContent.split(" ");

    const stringA = valueStrings[0];
    const stringB = valueStrings[1];

    const finalComputedValue = determineAndCompute(stringA, stringB);

    console.log(finalComputedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
