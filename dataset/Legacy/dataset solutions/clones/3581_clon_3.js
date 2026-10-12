const processInputData = (inputString) => {
  const dataLines = inputString.trim().split('\n');

  const firstLineData = dataLines[0];

  const stringNumbers = firstLineData.split(' ');

  const convertToNumbers = (strArray) => strArray.map(Number);
  const numericValues = convertToNumbers(stringNumbers);

  const totalElements = numericValues[0];
  const targetPosition = numericValues[1];

  const finalResult = totalElements - targetPosition + 1;

  console.log(finalResult);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
