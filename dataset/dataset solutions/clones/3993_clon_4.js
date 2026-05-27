const fileSystem = require('fs');

const processInputAndCompute = (inputContent) => {
    const [firstNumber, secondNumber] = inputContent.split('\n')[0].split(' ').map(Number);

    const totalAccumulation = Array.from({ length: firstNumber }, (_, index) => index + 1)
        .reduce((currentSum, currentDivisor) => {
            const currentQuotient = Math.floor(firstNumber / currentDivisor);
            const currentRemainder = firstNumber % currentDivisor;

            const termComponentA = currentQuotient * ((currentDivisor > secondNumber) ? (currentDivisor - secondNumber) : 0);
            const termComponentB = ((currentRemainder - secondNumber + 1) > 0) ? (currentRemainder - secondNumber + 1) : 0;

            return currentSum + termComponentA + termComponentB;
        }, 0);

    const finalResult = (secondNumber === 0) ? (totalAccumulation - firstNumber) : totalAccumulation;

    console.log(finalResult);
};

processInputAndCompute(fileSystem.readFileSync("/dev/stdin", "UTF-8"));
