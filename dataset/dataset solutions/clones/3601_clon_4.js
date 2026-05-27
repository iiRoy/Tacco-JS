'use strict';

function calculateProductOfDecrementedValues(sourceData) {
    const separatorPosition = sourceData.indexOf(' ');
    const firstOperandString = sourceData.substring(0, separatorPosition);
    const secondOperandString = sourceData.substring(separatorPosition + 1);

    const operandOne = parseInt(firstOperandString, 10);
    const operandTwo = parseInt(secondOperandString, 10);

    const finalResult = (operandOne * operandTwo) - operandOne - operandTwo + 1;
    
    console.log(finalResult);
}

calculateProductOfDecrementedValues(require("fs").readFileSync("/dev/stdin", "utf8"));
