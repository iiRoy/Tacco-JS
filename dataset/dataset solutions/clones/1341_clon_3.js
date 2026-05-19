function computeModularExponentiation(baseValue, exponentValue, modulusValue) {
    if (exponentValue < 1) {
        return 1;
    }

    let currentResult = computeModularExponentiation(baseValue, exponentValue / 2, modulusValue);

    let squaredIntermediate = (currentResult * currentResult) % modulusValue;

    const isExponentEven = (exponentValue % 2 === 0);

    if (isExponentEven) {
        return squaredIntermediate;
    } else {
        let finalProductForOddExponent = (squaredIntermediate * baseValue) % modulusValue;
        return finalProductForOddExponent;
    }
}

const fileSystemModule = require('fs');
const MODULUS_VALUE_CONSTANT = 1000000007;

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const trimmedInputString = rawInputData.trim();
const stringArrayOfNumbers = trimmedInputString.split(" ");
const numericInputsArray = stringArrayOfNumbers.map(Number);

const baseNumber = numericInputsArray[0];
const exponentNumber = numericInputsArray[1];

console.log(computeModularExponentiation(baseNumber, exponentNumber, MODULUS_VALUE_CONSTANT));
