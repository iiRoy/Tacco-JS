const parseInputLine = (lineContent) => {
  if (lineContent.length === 0) {
    return null;
  }
  const stringTokens = lineContent.split(' ');
  return stringTokens.map(token => parseInt(token, 10));
};

const countDivisibleNumbers = (rangeStart, rangeEnd, divisor) => {
  const countUpToRangeEnd = Math.floor(rangeEnd / divisor);
  const effectiveLowerBound = rangeStart - 1;
  const countBeforeRangeStart = Math.floor(effectiveLowerBound / divisor);
  return countUpToRangeEnd - countBeforeRangeStart;
};

const calculateResult = (paramA, paramB, paramC, paramD) => {
  const totalNumbersInRange = paramB - paramA + 1;
  const divisibleByC = countDivisibleNumbers(paramA, paramB, paramC);
  const divisibleByD = countDivisibleNumbers(paramA, paramB, paramD);
  const productOfCD = paramC * paramD;
  const divisibleByCAndD = countDivisibleNumbers(paramA, paramB, productOfCD);

  const finalResult = totalNumbersInRange - divisibleByC - divisibleByD + divisibleByCAndD;
  return finalResult;
};

function processInputData(rawData) {
  const allInputLines = rawData.split('\n');

  for (const currentLineContent of allInputLines) {
    const numericParams = parseInputLine(currentLineContent);

    if (numericParams === null) {
      continue;
    }

    const [valA, valB, valC, valD] = numericParams;

    console.log(calculateResult(valA, valB, valC, valD));
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
