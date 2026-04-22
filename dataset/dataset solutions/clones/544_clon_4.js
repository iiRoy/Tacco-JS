const inputAcquirer = (() => {
    const sourceIdentifier = () => typeof process !== 'undefined' && process.argv ? process.argv : [];
    const expectedOperandCount = 2;
    const initialOffset = 2; // Node.js: process.argv[0] is 'node', [1] is script path

    const deriveArguments = (sourceCollection) => sourceCollection.slice(initialOffset, initialOffset + expectedOperandCount);

    const convertToNumeric = (stringValues) => stringValues.map(v => Number.parseInt(v, 10));

    return {
        retrieveOperands: () => {
            const completeSource = sourceIdentifier();
            if (completeSource.length - initialOffset === expectedOperandCount) {
                const rawArguments = deriveArguments(completeSource);
                return convertToNumeric(rawArguments);
            }
            return null;
        }
    };
})();

const computationEngine = (() => {
    const calculateIntegralQuotient = (dividendValue, divisorValue) => {
        const truncatedPortion = (dividendValue / divisorValue) | 0;
        const remainderExists = dividendValue % divisorValue !== 0;
        const signDifference = (dividendValue < 0) !== (divisorValue < 0);
        return (remainderExists && signDifference) ? truncatedPortion - 1 : truncatedPortion;
    };

    return {
        processValues: (operandPair) => {
            const firstTerm = operandPair[0];
            const secondTerm = operandPair[1];
            const intermediateResult = calculateIntegralQuotient(firstTerm, secondTerm);
            return intermediateResult + 1;
        }
    };
})();

const outputHandler = {
    presentResult: (finalOutput) => {
        console.log(String(finalOutput));
    },
    indicateAbsence: () => {
        // Mimics original behavior of no output if argument count is incorrect
    }
};

const executionOrchestrator = () => {
    const acquiredPair = inputAcquirer.retrieveOperands();

    if (acquiredPair) {
        const finalCalculation = computationEngine.processValues(acquiredPair);
        outputHandler.presentResult(finalCalculation);
    } else {
        outputHandler.indicateAbsence();
    }
};

executionOrchestrator();