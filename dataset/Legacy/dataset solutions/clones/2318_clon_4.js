"use strict";
const ProcessData = (rawData) => {
   const numericComponents = rawData.trim().split('\n');
   const firstOperand = Number(numericComponents[0]);
   const secondOperand = Number(numericComponents[1]);

   const totalPossibleSum = 1 + 2 + 3;
   const derivedResult = totalPossibleSum - firstOperand - secondOperand;

   console.log(derivedResult);
};
ProcessData(require('fs').readFileSync('/dev/stdin','utf8'));
