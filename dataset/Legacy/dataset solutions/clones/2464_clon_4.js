"use strict";

const InputParserFactory = (sourceString) => {
    let allInputLines = sourceString.trim().split("\n");
    let currentLineIdx = 0;
    let currentLineTokens = [];

    const ensureTokensAvailable = () => {
        if (currentLineTokens.length === 0 && currentLineIdx < allInputLines.length) {
            currentLineTokens = allInputLines[currentLineIdx++].split(" ");
        }
    };

    const getNextNumber = (returnAsString = false) => {
        ensureTokensAvailable();
        if (currentLineTokens.length === 0) return undefined;
        const tokenValue = currentLineTokens.shift(); 
        return returnAsString ? tokenValue : Number(tokenValue);
    };

    const getLineNumbers = (returnAsStrings = false) => {
        if (currentLineIdx >= allInputLines.length) return [];
        const lineContent = allInputLines[currentLineIdx++];
        return returnAsStrings ? lineContent.split(" ") : lineContent.split(" ").map(Number);
    };

    const getMatrixNumbers = (numRows, returnAsStrings = false) => {
        const resultMatrix = [];
        for (let i = 0; i < numRows; i++) {
            resultMatrix.push(getLineNumbers(returnAsStrings));
        }
        return resultMatrix;
    };

    const getVectorNumbers = (numElements, returnAsStrings = false) => {
        const resultVector = [];
        for (let i = 0; i < numElements; i++) {
            if (currentLineIdx >= allInputLines.length) break;
            const lineContent = allInputLines[currentLineIdx++];
            resultVector.push(returnAsStrings ? lineContent : Number(lineContent));
        }
        return resultVector;
    };

    return {
        getNextNumber,
        getLineNumbers,
        getMatrixNumbers,
        getVectorNumbers
    };
};

const inputSource = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

const initializeMultiArray = (initialValue, ...dimensions) => {
    const createRecursiveArray = (dimensionIndex) => {
        if (dimensionIndex === dimensions.length - 1) {
            return Array(dimensions[dimensionIndex]).fill(initialValue);
        }
        return Array(dimensions[dimensionIndex]).fill(0).map(() => createRecursiveArray(dimensionIndex + 1));
    };
    return createRecursiveArray(0);
};

const primeModulus = 998244353;

const modularProduct = (...factors) => {
    let currentProduct = 1n; 
    for (const factor of factors) {
        currentProduct = (currentProduct * BigInt(factor)) % BigInt(primeModulus);
    }
    return Number(currentProduct);
};

let currentFactorial = 1; 
let inverseFactorialsCache = []; 

const prepareFactorialData = (limitValue) => {
    const factorialsArray = new Array(limitValue + 1);
    const invFactorialsArray = new Array(limitValue + 1);

    factorialsArray[0] = 1;
    invFactorialsArray[0] = 1;

    for (let i = 1; i <= limitValue; i++) {
        factorialsArray[i] = modularProduct(factorialsArray[i - 1], i);
        invFactorialsArray[i] = modularProduct(invFactorialsArray[i - 1], calculateModularInverse(i));
    }

    currentFactorial = factorialsArray[limitValue];
    inverseFactorialsCache = invFactorialsArray;
};

const calculateModularInverse = (numberValue) => {
    let a = numberValue, b = primeModulus, u = 1, v = 0, tempVar;
    while (b !== 0) {
        let quotient = Math.floor(a / b);
        a -= quotient * b;
        u -= quotient * v;
        tempVar = a; a = b; b = tempVar;
        tempVar = u; u = v; v = tempVar;
    }
    u %= primeModulus;
    return u < 0 ? u + primeModulus : u;
};

const computeModularPower = (baseValue, exponentValue) => {
    if (exponentValue === 0) return 1;
    if (exponentValue === 1) return baseValue % primeModulus;
    
    let halfPowerResult = computeModularPower(baseValue, Math.floor(exponentValue / 2));
    let squaredResult = modularProduct(halfPowerResult, halfPowerResult);
    
    if (exponentValue % 2 === 1) {
        squaredResult = modularProduct(squaredResult, baseValue);
    }
    return squaredResult;
};

const calculateCombinations = (nValue, rValue) => {
    if (rValue < 0 || rValue > nValue) return 0;
    return modularProduct(currentFactorial, inverseFactorialsCache[rValue], inverseFactorialsCache[nValue - rValue]);
};

console.log(executeSolution());

function executeSolution() {
    const inputN = inputSource.getNextNumber();
    let finalAnswer = computeModularPower(3, inputN);

    prepareFactorialData(inputN);

    let powerOfTwoAccumulator = 1;
    const lowerBound = Math.floor(inputN / 2) + 1;

    for (let k = lowerBound; k <= inputN; k++) {
        powerOfTwoAccumulator = modularProduct(powerOfTwoAccumulator, 2);
        let currentTerm = modularProduct(calculateCombinations(inputN, k), powerOfTwoAccumulator);
        finalAnswer = (finalAnswer - currentTerm + primeModulus) % primeModulus;
    }
    
    return (finalAnswer + primeModulus) % primeModulus;
}
