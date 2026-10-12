const processInput = (inputString) => {
  const numericValues = inputString.trim().split(/\s+/).map(Number);

  const [firstOperand, secondOperand] = numericValues;

  const operationEvaluators = [
    {
      condition: (op1, op2) => op1 + op2 === 15,
      resultIdentifier: "+"
    },
    {
      condition: (op1, op2) => op1 * op2 === 15,
      resultIdentifier: "*"
    }
  ];

  const matchedOperation = operationEvaluators.find(
    (evaluator) => evaluator.condition(firstOperand, secondOperand)
  );

  const finalOutput = matchedOperation ? matchedOperation.resultIdentifier : "x";

  console.log(finalOutput);
};

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
