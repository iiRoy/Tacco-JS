function processInputData(rawData) {
  const [firstOperand, secondOperand] = rawData[0].split(" ").map(Number);

  const operationSelector = {
    true: (val1, val2) => val1 + val2,
    false: (val1, val2) => val2 - val1
  };

  const outcome = operationSelector[secondOperand % firstOperand === 0](firstOperand, secondOperand);
  console.log(outcome);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
