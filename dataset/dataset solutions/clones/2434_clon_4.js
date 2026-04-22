const primeModulus = 1000000007;

const performModularMultiplication = (operand1, operand2, modulusValue) => {
    return (1n * BigInt(operand1) * BigInt(operand2)) % BigInt(modulusValue);
};

const computeModularPower = (baseValue, exponentValue, modulusValue) => {
    let currentResult = 1n;
    let baseBig = BigInt(baseValue);
    let exponentBig = BigInt(exponentValue);
    let modulusBig = BigInt(modulusValue);

    baseBig %= modulusBig;
    while (exponentBig > 0n) {
        if (exponentBig % 2n === 1n) {
            currentResult = performModularMultiplication(currentResult, baseBig, modulusBig);
        }
        baseBig = performModularMultiplication(baseBig, baseBig, modulusBig);
        exponentBig /= 2n;
    }
    return Number(currentResult);
};

const retrieveModularInverse = (numberToInvert, modulusValue) => {
    return computeModularPower(numberToInvert, modulusValue - 2, modulusValue);
};

const determineCombinationsModulo = (totalItems, selectedItems, modulusValue) => {
    if (selectedItems < 0 || selectedItems > totalItems) {
        return 0;
    }
    if (selectedItems === 0 || selectedItems === totalItems) {
        return 1;
    }
    if (selectedItems > totalItems / 2) {
        selectedItems = totalItems - selectedItems;
    }

    let numeratorProduct = 1n;
    for (let i = 0; i < selectedItems; i++) {
        numeratorProduct = performModularMultiplication(numeratorProduct, totalItems - i, modulusValue);
    }

    let denominatorProduct = 1n;
    for (let i = 1; i <= selectedItems; i++) {
        denominatorProduct = performModularMultiplication(denominatorProduct, i, modulusValue);
    }

    const inverseOfDenominator = retrieveModularInverse(denominatorProduct, modulusValue);

    return Number(performModularMultiplication(numeratorProduct, inverseOfDenominator, modulusValue));
};

const parseInputData = (rawData) => {
    const dataLines = rawData.trim().split('\n');
    const [firstValStr, secondValStr] = dataLines[0].split(' ');
    return {
        coordX: Number(firstValStr),
        coordY: Number(secondValStr)
    };
};

const solveProblem = (coordinates) => {
    const targetX = coordinates.coordX;
    const targetY = coordinates.coordY;

    const currentModulus = primeModulus;

    const bigTargetX = BigInt(targetX);
    const bigTargetY = BigInt(targetY);

    const countOneTwoMoves = 2n * bigTargetY - bigTargetX;
    const countTwoOneMoves = 2n * bigTargetX - bigTargetY;

    if (countOneTwoMoves % 3n !== 0n || countTwoOneMoves % 3n !== 0n ||
        countOneTwoMoves < 0n || countTwoOneMoves < 0n) {
        return 0;
    }

    const numOneTwo = Number(countOneTwoMoves / 3n);
    const numTwoOne = Number(countTwoOneMoves / 3n);

    const totalNumberOfSteps = numOneTwo + numTwoOne;
    const choicesForTwoOne = numTwoOne;

    return determineCombinationsModulo(totalNumberOfSteps, choicesForTwoOne, currentModulus);
};

const performComputation = (inputString) => {
    const structuredInput = parseInputData(inputString);
    const finalResult = solveProblem(structuredInput);
    console.log(finalResult);
};

performComputation(require("fs").readFileSync("/dev/stdin", "utf8"));