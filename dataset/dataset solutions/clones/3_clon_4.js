for (let currentIteration = 0; currentIteration < 81; currentIteration++) {
  const firstOperand = Math.floor(currentIteration / 9) + 1;
  const secondOperand = (currentIteration % 9) + 1;
  console.log(firstOperand + "x" + secondOperand + "=" + (firstOperand * secondOperand));
}
