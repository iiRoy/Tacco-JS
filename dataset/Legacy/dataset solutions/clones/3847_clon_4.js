function ProcessInput(rawData) {
  const parsedValues = rawData.split(" ");
  const firstNum = Number(parsedValues[0]);
  const secondNum = Number(parsedValues[1]);

  const finalResult = firstNum - (secondNum < firstNum);

  console.log(finalResult);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
