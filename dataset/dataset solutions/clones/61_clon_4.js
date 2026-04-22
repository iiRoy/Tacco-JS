const inputAcquirer = [];
const terminalInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

terminalInterface.on('line', (individualEntry) => {
    inputAcquirer.push(individualEntry);
});

terminalInterface.on('close', () => {
    beginProcessing(inputAcquirer);
});

const stringNumericalAdder = (operandA, operandB) => {
    let outcomeDigits = [];
    let indexA = operandA.length - 1;
    let indexB = operandB.length - 1;
    let currentCarry = 0;

    while (indexA >= 0 || indexB >= 0 || currentCarry > 0) {
        const charValA = indexA >= 0 ? operandA[indexA] : '0';
        const charValB = indexB >= 0 ? operandB[indexB] : '0';

        const numValA = parseInt(charValA, 10);
        const numValB = parseInt(charValB, 10);

        const cumulativeSum = numValA + numValB + currentCarry;
        outcomeDigits.unshift(cumulativeSum % 10);
        currentCarry = Math.floor(cumulativeSum / 10);

        indexA--;
        indexB--;
    }
    return outcomeDigits.join('');
};

const beginProcessing = (retrievedData) => {
    const totalOperations = parseInt(retrievedData[0], 10);
    let dataPointer = 1;

    Array.from({ length: totalOperations }).forEach(() => {
        const rawFirstNumber = retrievedData[dataPointer];
        const rawSecondNumber = retrievedData[dataPointer + 1];

        // The original code effectively performs addition on (N / 10) and (M / 10)
        // by ignoring the least significant digit during its reversed string iteration.
        // This is replicated by trimming the last character from the input strings.
        const adjustedFirst = rawFirstNumber.length > 0 ? rawFirstNumber.substring(0, rawFirstNumber.length - 1) : '';
        const adjustedSecond = rawSecondNumber.length > 0 ? rawSecondNumber.substring(0, rawSecondNumber.length - 1) : '';

        const finalResult = stringNumericalAdder(adjustedFirst, adjustedSecond);

        if (finalResult.length >= 80) {
            process.stdout.write("overflow\n");
        } else {
            process.stdout.write(finalResult + "\n");
        }
        dataPointer += 2;
    });
};