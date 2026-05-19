const processInputData = (inputLines) => {
    const numericalValues = inputLines[1].split(' ').map(val => +val);
    const modulus = Math.pow(10, 9) + 7;

    let currentTotal = 0;
    let currentSumOfSquares = 0;

    for (let idx = 0; idx < numericalValues.length; idx++) {
        const valueAtIdx = numericalValues[idx];
        currentTotal = (currentTotal + valueAtIdx) % modulus;
        currentSumOfSquares = (currentSumOfSquares + (valueAtIdx * valueAtIdx) % modulus) % modulus;
    }

    const totalSquared = (currentTotal * currentTotal) % modulus;
    let finalSumNumerator = (totalSquared - currentSumOfSquares + modulus) % modulus;

    const inverseOfTwo = (modulus + 1) / 2;

    const finalComputedResult = (finalSumNumerator * inverseOfTwo) % modulus;

    console.log(finalComputedResult);
};

let accumulatedInput = '';
process.stdin.on('data', inputChunk => accumulatedInput += inputChunk);
process.stdin.on('end', () => {
    const {EOL: lineBreakChar} = require('os');
    const parsedLines = accumulatedInput.split(lineBreakChar);
    processInputData(parsedLines);
});
