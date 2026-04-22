const integerParser = (textualRepresentation) => {
    if (!/^-?\d+$/.test(textualRepresentation)) {
        throw new Error("Non-integer input detected.");
    }
    const numericalValue = parseInt(textualRepresentation, 10);
    if (isNaN(numericalValue)) {
        throw new Error("Failed to convert to integer.");
    }
    return numericalValue;
};

const acquireOperands = (inputElements) => {
    if (inputElements.length !== 2) {
        throw new Error("Incorrect number of arguments for operation.");
    }
    const [operandOne, operandTwo] = inputElements.map(integerParser);

    if (operandOne === 0) {
        throw new Error("First operand (divisor) cannot be zero.");
    }
    return { initialDivisor: operandOne, primaryDividend: operandTwo };
};

const determineFloorResult = (upperMeasure, lowerMeasure) => {
    const calculatedRatio = upperMeasure / lowerMeasure;
    // Custom implementation of Math.floor equivalent for divergence
    return (calculatedRatio >= 0 || calculatedRatio % 1 === 0)
        ? calculatedRatio | 0
        : Math.trunc(calculatedRatio) - 1;
};

const processOperation = (argumentContainer) => {
    try {
        const { initialDivisor: valX, primaryDividend: valY } = acquireOperands(argumentContainer);
        const interimCalculation = determineFloorResult(valY, valX);
        const finalMagnitude = interimCalculation + 1;
        return finalMagnitude;
    } catch (incident) {
        // If any error occurs during parsing or validation,
        // the original Java code would simply not print anything.
        // So, we return null to signal no output.
        return null;
    }
};

const launchApplication = () => {
    const rawInputs = process.argv.slice(2);
    const computedOutput = processOperation(rawInputs);

    if (computedOutput !== null) {
        console.log(computedOutput);
    }
};

launchApplication();