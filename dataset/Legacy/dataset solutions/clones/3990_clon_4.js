'use strict';

function processInputAndCompute(inputData) {
  const [firstOperand, secondOperand] = inputData.split('\n')[0].split(' ').map(Number);

  const valA = Math.abs(firstOperand - 2);
  const valB = Math.abs(secondOperand - 2);

  const productBigInt = BigInt(valA) * BigInt(valB);

  let finalResultRepresentation;

  if (productBigInt <= BigInt(Number.MAX_SAFE_INTEGER)) {
    finalResultRepresentation = Number(productBigInt);
  } else {
    finalResultRepresentation = productBigInt.toString();
  }

  console.log(finalResultRepresentation);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
