const obtainNumericParameters = (sourceText) => {
    const numericExtracts = sourceText.match(/-?\d+/g);
    if (!numericExtracts || numericExtracts.length !== 3) {
        throw new Error("Input string malformed for numeric extraction.");
    }
    return numericExtracts.map(val => Number(val.trim()));
};

const retrieveMagnitude = (valueItem) => (valueItem < 0) ? -valueItem : valueItem;

const ascertainDirection = (valueItem) => (valueItem > 0) ? 1 : (valueItem < 0 ? -1 : 0);

const checkParity = (numberItem) => (numberItem % 2 === 0) ? 0 : 1; // 0 for even, 1 for odd

const handleProximityCase = (initialCoordinate, operationCount, incrementSize) => {
    if (retrieveMagnitude(initialCoordinate) < incrementSize) {
        return (checkParity(operationCount) === 0) ? initialCoordinate : initialCoordinate + incrementSize;
    }
    return null; 
};

const handleInsufficientOperations = (initialCoordinate, operationCount, incrementSize) => {
    const calculatedFractionalRatio = retrieveMagnitude(initialCoordinate / incrementSize);
    if (calculatedFractionalRatio > operationCount) {
        const movementDirection = ascertainDirection(initialCoordinate);
        const totalMovement = operationCount * incrementSize * movementDirection;
        const resultantPosition = initialCoordinate - totalMovement;
        return retrieveMagnitude(resultantPosition);
    }
    return null;
};

const handleRemainderBasedScenario = (initialCoordinate, operationCount, incrementSize) => {
    const currentModuloRemainder = initialCoordinate % incrementSize;
    if (currentModuloRemainder === 0) {
        return (checkParity(operationCount) === 0) ? incrementSize : 0;
    } else {
        return currentModuloRemainder;
    }
};

const executeComputationSequence = (paramAlpha, paramBeta, paramGamma) => {
    let computedResult = handleProximityCase(paramAlpha, paramBeta, paramGamma);
    if (computedResult !== null) {
        return computedResult;
    }

    computedResult = handleInsufficientOperations(paramAlpha, paramBeta, paramGamma);
    if (computedResult !== null) {
        return computedResult;
    }

    return handleRemainderBasedScenario(paramAlpha, paramBeta, paramGamma);
};

(function(resourceManager) {
    const inputContentBlock = resourceManager.readFileSync("/dev/stdin", "utf8");
    const [alphaValue, betaValue, gammaValue] = obtainNumericParameters(inputContentBlock);
    const finalCalculatedOutput = executeComputationSequence(alphaValue, betaValue, gammaValue);
    console.log(finalCalculatedOutput);
})(require("fs"));