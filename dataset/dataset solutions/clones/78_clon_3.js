function computeFactorial(currentNumber) {
    const BASE_CASE_RESULT = 1;

    if (currentNumber == 0) {
        return BASE_CASE_RESULT;
    }

    const nextNumberForRecursion = currentNumber - 1;
    const recursiveResult = computeFactorial(nextNumberForRecursion);

    return currentNumber * recursiveResult;
}

const fileSystemModule = require('fs');
const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const finalFactorialResult = computeFactorial(rawInputString);

console.log(finalFactorialResult);
