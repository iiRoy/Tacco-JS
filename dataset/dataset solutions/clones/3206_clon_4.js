function multiplyStrings(firstOperand, secondOperand) {
  return (BigInt(firstOperand) * BigInt(secondOperand)).toString();
}

function sumStrings(firstAddend, secondAddend) {
  return (BigInt(firstAddend) + BigInt(secondAddend)).toString();
}

function differenceStrings(minuendValue, subtrahendValue) {
  return (BigInt(minuendValue) - BigInt(subtrahendValue)).toString();
}

function computeValue(inputData) {
  const cleanedInput = inputData.replace("\n", "");
  const inputParts = cleanedInput.split(' ');

  const initialK = parseInt(inputParts[0], 10);
  const initialA = parseInt(inputParts[1], 10);
  const initialB = parseInt(inputParts[2], 10);

  const diffD = initialB - initialA;
  const diffE = initialK - initialA;

  let finalResult;

  if (diffE < 2 || diffD < 3) {
    finalResult = sumStrings(initialK.toString(), '1');
  } else if (diffE % 2 === 0) {
    const intermediateProduct = multiplyStrings((diffE / 2).toString(), diffD.toString());
    const sumWithA = sumStrings(intermediateProduct, initialA.toString());
    finalResult = sumStrings(sumWithA, '1');
  } else {
    const intermediateProduct = multiplyStrings(((diffE + 1) / 2).toString(), diffD.toString());
    finalResult = sumStrings(intermediateProduct, initialA.toString());
  }

  console.log(finalResult);
}

computeValue(require("node:fs").readFileSync("/dev/stdin", "utf8"));
