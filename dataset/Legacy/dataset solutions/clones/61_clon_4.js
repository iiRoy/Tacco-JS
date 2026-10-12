const { readFileSync } = require('fs');

const inputLines = readFileSync(0, 'utf8').trim().split('\n');

initiateCalculations();

function initiateCalculations() {
    const totalDataSets = Number(inputLines[0]);

    Array.from({ length: totalDataSets }, (_, currentSetIndex) => currentSetIndex + 1).forEach(setNumber => {
        const lineOffset = setNumber * 2;
        const firstOperandString = inputLines[lineOffset - 1];
        const secondOperandString = inputLines[lineOffset];

        const digitsOfFirst = firstOperandString.split('').map(Number);
        const digitsOfSecond = secondOperandString.split('').map(Number);

        let carryAccumulator = 0;
        const sumResultDigits = [];

        while (digitsOfFirst.length > 0 || digitsOfSecond.length > 0 || carryAccumulator > 0) {
            const currentDigitA = digitsOfFirst.length > 0 ? digitsOfFirst.pop() : 0;
            const currentDigitB = digitsOfSecond.length > 0 ? digitsOfSecond.pop() : 0;

            const currentSumValue = currentDigitA + currentDigitB + carryAccumulator;
            sumResultDigits.unshift(currentSumValue % 10);
            carryAccumulator = Math.floor(currentSumValue / 10);
        }

        const finalSumRepresentation = sumResultDigits.length === 1 && sumResultDigits[0] === 0
            ? ''
            : sumResultDigits.join('').replace(/^0+(?=\d)/, '');

        if (finalSumRepresentation.length >= 80) {
            console.log("overflow");
        } else {
            console.log(finalSumRepresentation);
        }
    });
}
