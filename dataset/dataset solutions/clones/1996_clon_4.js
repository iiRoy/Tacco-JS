const PRIMARY_MODULUS = 1000000007;
const MOD_SPLITTER = 100000;

const adjustToPositiveModulo = (numberValue, divisorValue) => {
    return (numberValue % divisorValue + divisorValue) % divisorValue;
};

const performSplitModularMultiplication = (operandA, operandB, modulus, splitter) => {
    const bQuotient = Math.floor(operandB / splitter);
    const bRemainder = operandB - (bQuotient * splitter);

    let productTerm1 = adjustToPositiveModulo(operandA * bQuotient, modulus);
    productTerm1 = adjustToPositiveModulo(productTerm1 * splitter, modulus);
    
    let productTerm2 = adjustToPositiveModulo(operandA * bRemainder, modulus);
    
    return adjustToPositiveModulo(productTerm1 + productTerm2, modulus);
};

const computeRecursiveModularPower = (baseVal, exponentVal, modulus, splitter) => {
    if (exponentVal === 0) return 1;
    if (exponentVal === 1) return adjustToPositiveModulo(baseVal, modulus);
    
    const halfExponent = Math.floor(exponentVal / 2);
    const resultForHalf = computeRecursiveModularPower(baseVal, halfExponent, modulus, splitter);
    
    let squaredResult = performSplitModularMultiplication(resultForHalf, resultForHalf, modulus, splitter);
    
    if (exponentVal % 2 === 1) {
        squaredResult = performSplitModularMultiplication(squaredResult, baseVal, modulus, splitter);
    }
    return squaredResult;
};

const executeComputation = (inputString) => {
    const cleanedInput = inputString.trim();
    const [headerLine] = cleanedInput.split('\n');
    const [valueN, valueK] = headerLine.split(' ').map(Number);
    
    const powerLookupTable = new Map();
    let currentIterationValue = 1;
    while (currentIterationValue <= valueK) {
        const currentLimitValue = Math.floor(valueK / currentIterationValue);
        powerLookupTable.set(currentLimitValue, computeRecursiveModularPower(currentLimitValue, valueN, PRIMARY_MODULUS, MOD_SPLITTER));
        currentIterationValue = Math.floor(valueK / currentLimitValue) + 1;
    }
    
    const patternComponentValues = Array(valueK + 1).fill(0);
    let cumulativeResult = 0;

    for (let currentDivisor = valueK; currentDivisor >= 1; currentDivisor--) {
        const relatedLimit = Math.floor(valueK / currentDivisor);
        
        let currentPatternValue = powerLookupTable.get(relatedLimit);
        
        for (let multipleFactor = 2; currentDivisor * multipleFactor <= valueK; multipleFactor++) {
            currentPatternValue = adjustToPositiveModulo(currentPatternValue - patternComponentValues[currentDivisor * multipleFactor], PRIMARY_MODULUS);
        }
        
        patternComponentValues[currentDivisor] = currentPatternValue;
        
        cumulativeResult = adjustToPositiveModulo(
            cumulativeResult + performSplitModularMultiplication(currentDivisor, currentPatternValue, PRIMARY_MODULUS, MOD_SPLITTER),
            PRIMARY_MODULUS
        );
    }
    
    console.log(cumulativeResult);
};

const activateProcess = (inputReaderFunction) => {
    const fileContent = inputReaderFunction('/dev/stdin', 'utf8');
    executeComputation(fileContent);
};

activateProcess(require('fs').readFileSync);