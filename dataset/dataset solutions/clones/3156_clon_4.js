function findGreatestCommonDivisor(alpha, beta) {
  if (beta === 0) {
    return alpha;
  }
  return findGreatestCommonDivisor(beta, alpha % beta);
}

function processNumericalData(incomingText) {
  const numericComponents = incomingText.match(/\d+/g).map(parseFloat);
  const firstOperand = numericComponents[0];
  const secondOperand = numericComponents[1];
  const desiredRank = numericComponents[2];

  const ultimateCommonDivisor = findGreatestCommonDivisor(firstOperand, secondOperand);

  const allDivisors = [];
  for (let counter = 1; counter * counter <= ultimateCommonDivisor; counter++) {
    if (ultimateCommonDivisor % counter === 0) {
      allDivisors.push(counter);
      if (counter * counter !== ultimateCommonDivisor) {
        allDivisors.push(ultimateCommonDivisor / counter);
      }
    }
  }

  allDivisors.sort((elementA, elementB) => elementB - elementA);

  console.log(allDivisors[desiredRank - 1]);
}