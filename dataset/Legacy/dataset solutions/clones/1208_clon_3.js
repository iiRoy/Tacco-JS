function calculateProduct (operandA, operandB){
    const productResult = operandA * operandB;
    return productResult;
}

function calculateSumDoubled (operandA, operandB){
    const doubledOperandA = operandA * 2;
    const doubledOperandB = operandB * 2;
    const finalSum = doubledOperandA + doubledOperandB;
    return finalSum;
}

function displayCalculatedValues(valueOne, valueTwo) {
    console.log(valueOne, valueTwo);
}

const resultOfProduct = calculateProduct(globalInputA, globalInputB);
const resultOfSumDoubled = calculateSumDoubled(globalInputA, globalInputB);

displayCalculatedValues(resultOfProduct, resultOfSumDoubled);
