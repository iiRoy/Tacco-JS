const fileSystemInterface = require('fs');

const generateOperation = (modulusValue) => {
    const recursiveCalculator = (baseParam, exponentParam) => {
        let currentResult = 1;

        if (exponentParam >= 1) {
            currentResult = recursiveCalculator(baseParam, exponentParam / 2);
            
            const interimSquared = (currentResult * currentResult) % modulusValue;
            
            if (exponentParam % 2 === 0) {
                currentResult = interimSquared;
            } else {
                currentResult = (interimSquared * baseParam) % modulusValue;
            }
        }
        return currentResult;
    };
    return recursiveCalculator;
};

const rawDataInput = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
const processedNumbers = rawDataInput.trim().split(/\s+/).map(Number);

const desiredModulus = 1000000007;

const exponentiationFunction = generateOperation(desiredModulus);

const finalComputation = exponentiationFunction(
    processedNumbers[0],
    processedNumbers[1]
);

process.stdout.write(String(finalComputation) + '\n');