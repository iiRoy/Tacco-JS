const retrieveData = () => {
    const sourceModule = require('fs');
    const inputPath = '/dev/stdin';
    const characterEncoding = 'utf-8';
    return sourceModule.readFileSync(inputPath, characterEncoding);
};

const processValueAndCompute = (textualInput) => {
    const parsedNumber = Number.parseInt(textualInput.trim(), 10);
    const modulusConstant = 1000000007n;

    const factorialRecursive = (currentIteration) => {
        if (currentIteration === 0) {
            return 1n;
        }
        return (BigInt(currentIteration) * factorialRecursive(currentIteration - 1)) % modulusConstant;
    };

    return factorialRecursive(parsedNumber);
};

const outputResult = (finalComputedValue) => {
    console.log(finalComputedValue.toString());
};

// Orchestration of operations
const rawInputContent = retrieveData();
const computedFactorialMod = processValueAndCompute(rawInputContent);
outputResult(computedFactorialMod);