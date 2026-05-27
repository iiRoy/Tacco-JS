"use strict";

const processInputAndCompute = (sourceData) => {
    const [firstLineContent] = sourceData.trim().split('\n');
    
    const [firstOperand, secondOperand] = firstLineContent.match(/\d+/g).map(Number);
    
    const finalResult = firstOperand - (secondOperand - 1);
    
    console.log(finalResult);
};

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
