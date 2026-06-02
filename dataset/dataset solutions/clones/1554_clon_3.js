const computeResult = (inputLines) => {
    const MOD_CONSTANT = 1000000007;

    const addMod = (valA, valB, modVal) => (valA + valB) % modVal;
    const multiplyMod = (valA, valB, modVal) => (valA * valB) % modVal;

    const numberStrings = inputLines[1].split(' ');
    const numbersArray = [];
    for (let numStr of numberStrings) {
        numbersArray.push(Number(numStr));
    }

    let totalSum = 0;

    for (let outerIndex = 0; outerIndex < numbersArray.length; outerIndex++) {
        let innerAccumulator = 0;
        for (let innerIndex = outerIndex + 1; innerIndex < numbersArray.length; innerIndex++) {
            innerAccumulator = addMod(innerAccumulator, numbersArray[innerIndex], MOD_CONSTANT);
        }
        const currentProduct = multiplyMod(numbersArray[outerIndex], innerAccumulator, MOD_CONSTANT);
        totalSum = addMod(totalSum, currentProduct, MOD_CONSTANT);
    }

    console.log(totalSum);
};

let inputBuffer = '';
process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    const { EOL: lineSeparator } = require('os');
    const processedLines = inputBuffer.split(lineSeparator);
    computeResult(processedLines);
});
