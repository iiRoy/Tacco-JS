const obtainResult = (initialFigure) => {
  const quotient = initialFigure >> 1;
  const remainder = initialFigure & 1;

  return quotient * (quotient + remainder);
};

const fileSystem = require('fs');
const acquiredData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedInput = acquiredData.trim().split('\n')[0];
const parsedNumber = Number(processedInput);

process.stdout.write(String(obtainResult(parsedNumber)));