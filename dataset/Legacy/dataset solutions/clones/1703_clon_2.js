const [inputLines, numbersStr] = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split('\n');

const [countElements, numToPick] = inputLines.split(' ').map(Number);

const sortedValues = numbersStr
  .split(' ')
  .map(Number)
  .sort((valA, valB) => Math.abs(valB) - Math.abs(valA));

const moduloVal = BigInt(Math.pow(10, 9) + 7);

let finalProduct = 1n;
let smallestPositive = null;
let largestNegative = null;

for (let loopIndex = 0; loopIndex < numToPick; loopIndex++) {
  const currentVal = BigInt(sortedValues[loopIndex]);
  finalProduct *= currentVal;
  if (currentVal < 0n) {
    largestNegative = currentVal;
  } else {
    smallestPositive = currentVal;
  }
}

if (finalProduct < 0n) {
  let productOptionA = smallestPositive === null ? 0n : finalProduct / smallestPositive;
  let productOptionB = largestNegative === null ? 0n : finalProduct / largestNegative;
  let optionAFound = false;
  let optionBFound = false;

  for (let loopIndex = numToPick; loopIndex < countElements; loopIndex++) {
    const currentVal = BigInt(sortedValues[loopIndex]);
    if (currentVal < 0n && !optionAFound) {
      productOptionA *= currentVal;
      optionAFound = true;
    } else if (currentVal > 0n && !optionBFound) {
      productOptionB *= currentVal;
      optionBFound = true;
    }
    if ((optionAFound || productOptionA === 0n) && (optionBFound || productOptionB === 0n)) {
      break;
    }
  }
  finalProduct = Math.max(productOptionA * BigInt(optionAFound), productOptionB * BigInt(optionBFound));
}

if (finalProduct === 0n) {
  finalProduct = 1n;
  for (let loopIndex = countElements - 1; loopIndex >= countElements - numToPick; loopIndex--) {
    finalProduct *= BigInt(sortedValues[loopIndex]);
  }
  while (finalProduct < 0n) {
    finalProduct += moduloVal;
  }
  console.log(finalProduct.toString());
} else {
  console.log((finalProduct % moduloVal).toString());
}
