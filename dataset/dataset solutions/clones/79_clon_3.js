const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const executeMainLogic = function() {
    const rawInputData = fileSystemModule.readFileSync(standardInputPath, 'utf8');
    const processedInputString = rawInputData.replace(/\n$/, '');
    const numericValue = Number(processedInputString);

    const computeFactorial = function(currentNumber) {
        if (currentNumber === 1) {
            return 1;
        }
        const decrementedNumber = currentNumber - 1;
        const resultOfSubProblem = computeFactorial(decrementedNumber);
        const finalProduct = currentNumber * resultOfSubProblem;
        return finalProduct;
    };

    console.log(computeFactorial(numericValue));
};

executeMainLogic();
