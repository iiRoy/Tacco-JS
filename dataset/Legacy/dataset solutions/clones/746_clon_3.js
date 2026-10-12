function adjustValue(val) {
   let adjusted = val;
   if (val >= 10) {
      adjusted = val - 10 + 1;
   }
   return adjusted;
}

const fileSystem = require('fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineData = rawData.trim().split("\n");

const numLines = parseInt(lineData.shift(), 10);
const identifierChars = lineData.shift().split("");
const anotherNum = parseInt(lineData.shift(), 10);
const valueArray = lineData.shift().split(" ").map(Number);

const multiplierFactors = [];
let initialSum = 0;

for (let idx = 0; idx < identifierChars.length; idx++) {
    const charVal = identifierChars[idx];
    const isEvenIndex = (idx % 2 === 0);

    if (charVal === "*") {
        multiplierFactors.push(isEvenIndex ? 1 : 2);
    } else {
        const numericCharValue = parseInt(charVal, 10);
        if (isEvenIndex) {
            initialSum += numericCharValue;
        } else {
            const doubledValue = numericCharValue * 2;
            initialSum += adjustValue(doubledValue);
        }
    }
}

const maxDPCols = 1000001;
const maxDPRows = 8;
const dynamicProgTable = Array.from({ length: maxDPRows }, () => Array(maxDPCols).fill(0));

dynamicProgTable[0][initialSum] = 1;

const numFactors = multiplierFactors.length;
const numValues = valueArray.length;

for (let factorIdx = 0; factorIdx < numFactors; factorIdx++) {
    const currentFactor = multiplierFactors[factorIdx];
    for (let valIdx = 0; valIdx < numValues; valIdx++) {
        const currentValue = valueArray[valIdx];
        const productForAdjustment = currentValue * currentFactor;
        const adjustedProduct = adjustValue(productForAdjustment);

        for (let currentSum = 0; currentSum < maxDPCols; currentSum++) {
            if (dynamicProgTable[factorIdx][currentSum] > 0) {
                const nextSum = currentSum + adjustedProduct;
                if (nextSum < maxDPCols) {
                    dynamicProgTable[factorIdx + 1][nextSum] += dynamicProgTable[factorIdx][currentSum];
                }
            }
        }
    }
}

let finalResult = 0;
const maxFinalSumCheck = 100000;
const finalDPRow = multiplierFactors.length;

for (let sMultiplier = 0; sMultiplier <= maxFinalSumCheck; sMultiplier++) {
    const targetSum = sMultiplier * 10;
    if (targetSum < maxDPCols) {
        finalResult += dynamicProgTable[finalDPRow][targetSum];
    }
}

console.log(finalResult);
