process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputNumberValue;
const moduloConstant = 1000000007;

function computeModularFactorial(valueToFactorial, modulusValue) {
    let currentProduct = 1;
    const iterationLimit = valueToFactorial;

    for (let loopCounter = 1; loopCounter <= iterationLimit; loopCounter++) {
        currentProduct = currentProduct * loopCounter;
        currentProduct = currentProduct % modulusValue;
    }
    return currentProduct;
}

process.stdin.on('data', function (dataChunk) {
    dataChunk.trim().split('\n').forEach(function(processedLine) {
        // The original code processes each line and overwrites N.
        // We replicate this behavior, so the last valid line determines the input.
        inputNumberValue = Number(processedLine);
    });
});

process.stdin.on('end', function () {
    // If inputNumberValue is NaN (e.g., from non-numeric input or empty line),
    // computeModularFactorial(NaN, ...) will correctly return 1,
    // matching the original code's behavior where the loop condition `i < NaN` is always false.
    const finalFactorialResult = computeModularFactorial(inputNumberValue, moduloConstant);
    console.log(finalFactorialResult);
});
