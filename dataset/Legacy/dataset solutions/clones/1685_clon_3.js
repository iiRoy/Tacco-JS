function calculateRemainder(numericValue, modulusDivisor) {
    return numericValue % modulusDivisor;
}

function processInput(rawInputString) {
    const integerValue = parseInt(rawInputString, 10);
    const fixedModulus = 1000;
    const computedResult = calculateRemainder(integerValue, fixedModulus);
    console.log(computedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
