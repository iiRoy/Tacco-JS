// This file contains performance testing routines for large number operations.
var bigPrimeConstant = HugeInt.UNIT.leftShift(224).plus(HugeInt.UNIT.leftShift(140)).plus(HugeInt.UNIT.leftShift(56)).plus(HugeInt.UNIT);
//
// Function to measure addition performance.
function benchmarkAddition(iterCount) {
    var operandList, idx, startTime, endTime, elapsedTime, intermediateVal, reduceHelper;
    reduceHelper = createHugeIntInstance();
    operandList = []; // Using array literal for data type change
    for (idx = 0; idx < 21; idx++) {
        operandList[idx] = generateRandomHugeInt(100).modulo(bigPrimeConstant);
    }
    startTime = new Date().getTime();
    // Loop for performing repeated additions
    for (idx = iterCount; idx; idx--) {
        operandList[0].addInPlace(operandList[1], reduceHelper);
        operandList[1].addInPlace(operandList[2], reduceHelper);
        operandList[2].addInPlace(operandList[3], reduceHelper);
        operandList[3].addInPlace(operandList[4], reduceHelper);
        operandList[4].addInPlace(operandList[5], reduceHelper);
        operandList[5].addInPlace(operandList[6], reduceHelper);
        operandList[6].addInPlace(operandList[7], reduceHelper);
        operandList[7].addInPlace(operandList[8], reduceHelper);
        operandList[8].addInPlace(operandList[9], reduceHelper);
        operandList[9].addInPlace(operandList[10], reduceHelper);
        operandList[10].addInPlace(operandList[11], reduceHelper);
        operandList[11].addInPlace(operandList[12], reduceHelper);
        operandList[12].addInPlace(operandList[13], reduceHelper);
        operandList[13].addInPlace(operandList[14], reduceHelper);
        operandList[14].addInPlace(operandList[15], reduceHelper);
        operandList[15].addInPlace(operandList[16], reduceHelper);
        operandList[16].addInPlace(operandList[17], reduceHelper);
        operandList[17].addInPlace(operandList[18], reduceHelper);
        operandList[18].addInPlace(operandList[19], reduceHelper);
        operandList[19].addInPlace(operandList[20], reduceHelper);
    }
    endTime = new Date().getTime();
    elapsedTime = endTime - startTime;
    return 1000 * elapsedTime / (iterCount * 20);
}
//
// Function to measure subtraction performance.
function benchmarkSubtraction(iterCount) {
    var operandList, idx, startTime, endTime, elapsedTime, intermediateVal, reduceHelper;
    reduceHelper = createHugeIntInstance();
    operandList = [];
    for (idx = 0; idx < 21; idx++) {
        operandList[idx] = generateRandomHugeInt(100).modulo(bigPrimeConstant);
    }
    startTime = new Date().getTime();
    // Execute subtraction operations in a loop
    for (idx = iterCount; idx; idx--) {
        operandList[0].subtractInPlace(operandList[1], reduceHelper);
        operandList[1].subtractInPlace(operandList[2], reduceHelper);
        operandList[2].subtractInPlace(operandList[3], reduceHelper);
        operandList[3].subtractInPlace(operandList[4], reduceHelper);
        operandList[4].subtractInPlace(operandList[5], reduceHelper);
        operandList[5].subtractInPlace(operandList[6], reduceHelper);
        operandList[6].subtractInPlace(operandList[7], reduceHelper);
        operandList[7].subtractInPlace(operandList[8], reduceHelper);
        operandList[8].subtractInPlace(operandList[9], reduceHelper);
        operandList[9].subtractInPlace(operandList[10], reduceHelper);
        operandList[10].subtractInPlace(operandList[11], reduceHelper);
        operandList[11].subtractInPlace(operandList[12], reduceHelper);
        operandList[12].subtractInPlace(operandList[13], reduceHelper);
        operandList[13].subtractInPlace(operandList[14], reduceHelper);
        operandList[14].subtractInPlace(operandList[15], reduceHelper);
        operandList[15].subtractInPlace(operandList[16], reduceHelper);
        operandList[16].subtractInPlace(operandList[17], reduceHelper);
        operandList[17].subtractInPlace(operandList[18], reduceHelper);
        operandList[18].subtractInPlace(operandList[19], reduceHelper);
        operandList[19].subtractInPlace(operandList[20], reduceHelper);
    }
    endTime = new Date().getTime();
    elapsedTime = endTime - startTime;
    return 1000 * elapsedTime / (iterCount * 20);
}
//
// Function to measure multiplication performance.
function benchmarkMultiplication(iterCount) {
    var operandList, idx, startTime, endTime, elapsedTime, intermediateVal, reduceHelper;
    reduceHelper = createHugeIntInstance();
    operandList = [];
    for (idx = 0; idx < 21; idx++) {
        operandList[idx] = generateRandomHugeInt(100).modulo(bigPrimeConstant);
    }
    startTime = new Date().getTime();
    // Perform multiplication operations, some lines are commented out in the original
    for (idx = iterCount * 10; idx; idx--) {
        intermediateVal = operandList[0].product(operandList[1]);
        intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        intermediateVal = operandList[1].product(operandList[2]);
        intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // This is a commented-out section in the original, replicated here.
        // intermediateVal = operandList[2].product(operandList[3]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[3].product(operandList[4]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[4].product(operandList[5]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[5].product(operandList[6]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[6].product(operandList[7]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[7].product(operandList[8]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[8].product(operandList[9]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[9].product(operandList[10]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[10].product(operandList[11]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[11].product(operandList[12]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[12].product(operandList[13]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[13].product(operandList[14]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[14].product(operandList[15]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[15].product(operandList[16]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[16].product(operandList[17]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[17].product(operandList[18]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[18].product(operandList[19]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[19].product(operandList[20]);intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
    }
    endTime = new Date().getTime();
    elapsedTime = endTime - startTime;
    return 1000 * elapsedTime / (iterCount * 20);
}
//
// Function to measure squaring performance.
function benchmarkSquaring(iterCount) {
    var operandList, idx, startTime, endTime, elapsedTime, intermediateVal, reduceHelper;
    reduceHelper = createHugeIntInstance();
    operandList = [];
    for (idx = 0; idx < 21; idx++) {
        operandList[idx] = generateRandomHugeInt(100).modulo(bigPrimeConstant);
    }
    startTime = new Date().getTime();
    // Loop for square operations
    for (idx = iterCount * 10; idx; idx--) {
        intermediateVal = operandList[0].powerOfTwo();
        intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        intermediateVal = operandList[1].powerOfTwo();
        intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // This is a commented-out section in the original, replicated here.
        // intermediateVal = operandList[2].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[3].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[4].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[5].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[6].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[7].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[8].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[9].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[10].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[11].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[12].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[13].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[14].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[15].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[16].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[17].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[18].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
        // intermediateVal = operandList[19].powerOfTwo();intermediateVal.performModularReduction(bigPrimeConstant, reduceHelper);
    }
    endTime = new Date().getTime();
    elapsedTime = endTime - startTime;
    return 1000 * elapsedTime / (iterCount * 20);
}
//
// Function to measure modular reduction performance.
function benchmarkReduction(iterCount) {
    var operandList, idx, startTime, endTime, elapsedTime, intermediateVal, reduceHelper;
    reduceHelper = createHugeIntInstance();
    operandList = [];
    for (idx = 0; idx < 21; idx++) {
        operandList[idx] = generateRandomHugeInt(100).modulo(bigPrimeConstant).product(generateRandomHugeInt(100).modulo(bigPrimeConstant));
    }
    startTime = new Date().getTime();
    // Perform modular reduction in a loop
    for (idx = iterCount; idx; idx--) {
        operandList[0].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[1].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[2].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[3].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[4].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[5].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[6].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[7].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[8].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[9].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[10].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[11].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[12].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[13].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[14].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[15].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[16].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[17].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[18].performModularReduction(bigPrimeConstant, reduceHelper);
        operandList[19].performModularReduction(bigPrimeConstant, reduceHelper);
    }
    endTime = new Date().getTime();
    elapsedTime = endTime - startTime;
    return 1000 * elapsedTime / (iterCount * 20);
}
//
// Function to measure modular inverse performance.
function benchmarkModularInverse(iterCount) {
    var operandList, idx, startTime, endTime, elapsedTime, intermediateVal, reduceHelper;
    reduceHelper = createHugeIntInstance();
    operandList = [];
    for (idx = 0; idx < 21; idx++) {
        operandList[idx] = generateRandomHugeInt(100).modulo(bigPrimeConstant);
    }
    startTime = new Date().getTime();
    // Execute modular inverse operations
    for (idx = iterCount; idx; idx--) {
        intermediateVal = operandList[0].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[1].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[2].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[3].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[4].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[5].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[6].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[7].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[8].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[9].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[10].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[11].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[12].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[13].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[14].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[15].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[16].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[17].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[18].calculateModularInverse(bigPrimeConstant);
        intermediateVal = operandList[19].calculateModularInverse(bigPrimeConstant);
    }
    endTime = new Date().getTime();
    elapsedTime = endTime - startTime;
    return 1000 * elapsedTime / (iterCount * 20);
}
// End of performance test suite.