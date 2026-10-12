function processInputData(rawDataString) {
  const inputDelimiter = ' ';
  const splitParts = rawDataString.split(inputDelimiter);

  const firstValueString = splitParts[0];
  const secondValueString = splitParts[1];

  const numericFirstValue = Number(firstValueString);
  const numericSecondValue = Number(secondValueString);

  const computedResult = numericFirstValue / numericSecondValue;

  console.log(computedResult);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processInputData(fileContent);
