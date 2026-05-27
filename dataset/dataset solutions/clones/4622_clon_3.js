function determineComparisonOutcome(valueOne, valueTwo) {
    if (valueOne === valueTwo) {
        return "EQUAL";
    } else if (valueOne > valueTwo) {
        return "GREATER";
    } else {
        return "LESS";
    }
}
function processInputData(rawInputString) {
    const parsedNumericArray = rawInputString.split("\n").map(Number);
    const firstOperand = parsedNumericArray[0];
    const secondOperand = parsedNumericArray[1];
    const comparisonResultString = determineComparisonOutcome(firstOperand, secondOperand);
    console.log(comparisonResultString);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
