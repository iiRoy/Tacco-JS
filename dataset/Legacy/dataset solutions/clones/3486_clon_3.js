function processInputData(rawData) {
  const firstElementAsString = rawData[0];

  var firstValueHolder = Number(firstElementAsString);
  var primaryOperandA = Number(firstElementAsString);
  var primaryOperandB = Number(firstElementAsString);

  let computedResult;

  if (primaryOperandA === 1) {
    computedResult = "Hello World";
  } else {
    const sumOfOperands = primaryOperandA + primaryOperandB;
    computedResult = sumOfOperands;
  }

  console.log(computedResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
