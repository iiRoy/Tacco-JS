function parseInputParameters(rawInputString) {
    const lines = rawInputString.trim().split("\n");
    const firstLineParts = lines[0].split(" ");
    const parsedN = parseInt(firstLineParts[0], 10);
    const parsedM = parseInt(firstLineParts[1], 10);
    const parsedK = parseInt(firstLineParts[2], 10);
    return { N: parsedN, M: parsedM, K: parsedK };
}

function multiplyMod(operandA, operandB, modulus, splitFactor) {
    const quotientPart = Math.floor(operandB / splitFactor);
    const remainderPart = operandB - (quotientPart * splitFactor);
    
    let intermediateProduct1 = (operandA * quotientPart % modulus);
    let intermediateProduct2 = (intermediateProduct1 * splitFactor % modulus);
    let finalProduct = intermediateProduct2 + (operandA * remainderPart);
    
    return finalProduct % modulus;
}

function computeModularInverse(num, modulus, splitFactor, modularInversesArray) {
    const invModNum = modularInversesArray[modulus % num];
    const floorModDivNum = Math.floor(modulus / num);
    const invCalc = multiplyMod(invModNum, floorModDivNum, modulus, splitFactor);
    return (modulus - invCalc) % modulus;
}

function computeNcrTerm(nVal, rVal, factorialsArray, invFactorialsArray, modulus, splitFactor) {
    const factorialN = factorialsArray[nVal];
    const invFactorialNMinusR = invFactorialsArray[nVal - rVal];
    const invFactorialR = invFactorialsArray[rVal];
    
    const productPart1 = multiplyMod(factorialN, invFactorialNMinusR, modulus, splitFactor);
    const finalCombinationTerm = multiplyMod(productPart1, invFactorialR, modulus, splitFactor);
    return finalCombinationTerm;
}

function calculateCombinationsMod(maxVal, kVal, modulus, splitFactor) {
    const resultCombinations = [];
    const factorials = [1, 1];
    const invFactorials = [1, 1];
    const modularInverses = [0, 1];
    
    for (let loopIdx = 2; loopIdx <= maxVal; loopIdx++) {
        factorials.push(factorials[loopIdx - 1] * loopIdx % modulus);
        
        const currentModularInverse = computeModularInverse(loopIdx, modulus, splitFactor, modularInverses);
        modularInverses.push(currentModularInverse);
        
        invFactorials.push(multiplyMod(invFactorials[loopIdx - 1], currentModularInverse, modulus, splitFactor));
    }
    
    for (let loopIdx = 0; loopIdx <= kVal; loopIdx++) {
        const combinationValue = computeNcrTerm(maxVal, loopIdx, factorials, invFactorials, modulus, splitFactor);
        resultCombinations.push(combinationValue);
    }
    return resultCombinations;
}

function powerMod(baseVal, exponentVal, modulus, splitFactor) {
    let result = 1;
    const exponentBinary = exponentVal.toString(2);
    const binaryLength = exponentBinary.length;
    let currentBasePower = baseVal;
    
    for (let loopIdx = 0; loopIdx < binaryLength; loopIdx++) {
        const currentBit = exponentBinary.charAt(binaryLength - 1 - loopIdx);
        if (currentBit === '1') {
            result = multiplyMod(result, currentBasePower, modulus, splitFactor);
        }
        currentBasePower = multiplyMod(currentBasePower, currentBasePower, modulus, splitFactor);
    }
    return result;
}

function ProcessInput(rawData) {
    const params = parseInputParameters(rawData);
    const numN = params.N;
    const numM = params.M;
    const numK = params.K;
    
    const modulusP = 998244353;
    const splitFactor = 100000;
    
    const nMinusOne = numN - 1;
    const mMinusOne = numM - 1;
    const exponentForPower = numN - numK - 1;

    const combinationsList = calculateCombinationsMod(nMinusOne, numK, modulusP, splitFactor).reverse();
    let currentPower = powerMod(mMinusOne, exponentForPower, modulusP, splitFactor);
    let finalResult = 0;
    
    for (let i = 0; i < combinationsList.length; i++) {
        const comboVal = combinationsList[i];
        finalResult = (finalResult + multiplyMod(currentPower, comboVal, modulusP, splitFactor)) % modulusP;
        currentPower = multiplyMod(currentPower, mMinusOne, modulusP, splitFactor);
    }
    
    finalResult = multiplyMod(finalResult, numM, modulusP, splitFactor);
    console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
