process.stdin.resume();
process.stdin.setEncoding('utf8');
function computeNonNegativeDifference(valueA, valueB) {
    const calculatedDiff = valueA - valueB;
    const finalResult = Math.max(0, calculatedDiff);
    return finalResult;
}

function processInputData(inputLine) {
    const inputTokens = inputLine.split(" ");
    const initialQuantity = parseInt(inputTokens[0], 10);
    const deductionAmount = parseInt(inputTokens[1], 10);
    
    const outputValue = computeNonNegativeDifference(initialQuantity, deductionAmount);
    
    console.log(outputValue);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
