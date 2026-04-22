const processInputValues = (sourceData) => {
  const elements = sourceData.split(' ');
  const parameterA = Number(elements[0]);
  const parameterB = Number(elements[1]);
  const parameterC = Number(elements[2]);
  const parameterK = Number(elements[3]);

  return parameterK <= 0
    ? parameterK
    : (parameterA * 2 + parameterB - parameterK);
};

const ioHandler = require('fs');
const contentBuffer = ioHandler.readFileSync('/dev/stdin', 'utf8');

console.log(processInputValues(contentBuffer));