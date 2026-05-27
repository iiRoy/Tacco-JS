const calculateAndDisplayResult = (inputDataString) => {
  const stringOperands = inputDataString.split(' ');
  const [valOne, valTwo] = stringOperands.map(Number);

  const operationResults = [
    valOne + valTwo,
    valOne - valTwo,
    valOne * valTwo
  ];

  const ultimateValue = Math.max(...operationResults);

  console.log(ultimateValue);
};

calculateAndDisplayResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
