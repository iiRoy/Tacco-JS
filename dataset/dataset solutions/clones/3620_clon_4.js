function evaluateDivisibility(inputData) {
  const [firstOperand, secondOperand] = inputData.split(" ").map(Number);

  const resultValue = Math.sign(firstOperand % secondOperand);

  console.log(resultValue);
}

evaluateDivisibility(require("fs").readFileSync("/dev/stdin", "utf8"));
