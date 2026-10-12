function parseIntegerString(str) {
    return Number.parseInt(str, 10);
}

function transformToNumericArray(strArray) {
    return strArray.reduce((accumulator, currentItem) => {
        accumulator.push(parseIntegerString(currentItem));
        return accumulator;
    }, []);
}

function getAbsoluteValue(value) {
    return Math.abs(value);
}

function determineMinimum() {
    return Array.from(arguments).reduce((currentMin, nextVal) => (currentMin < nextVal ? currentMin : nextVal));
}

function determineMaximum() {
    return Array.from(arguments).reduce((currentMax, nextVal) => (currentMax > nextVal ? currentMax : nextVal));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInput(rawInputString) {
    const numericTokens = rawInputString.match(/-?\d+/g);
    const parsedValues = numericTokens.map(Number);

    const firstParameter = parsedValues[0];
    const secondParameter = parsedValues[1];
    const thirdParameter = parsedValues[2];

    const numeratorPart = (firstParameter - thirdParameter) * (secondParameter - 1);
    const denominatorPart = Math.pow(firstParameter, 2);

    let intermediateResult = numeratorPart / denominatorPart;

    const finalOutcome = (thirdParameter === 0) ? intermediateResult : (intermediateResult * 2);

    console.log(finalOutcome);
}
