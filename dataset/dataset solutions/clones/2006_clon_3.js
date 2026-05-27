const getBigIntAbsolute = (num) => {
  return num >= 0n ? num : -num;
};

const ProcessInput = (rawData) => {
  const parsedValues = rawData.split(' ').map(valStr => BigInt(valStr));

  const initialVal = parsedValues[0];
  const divisorVal = parsedValues[1];

  let previousIterationValue = initialVal;
  let currentIterationValue = initialVal;
  let finalResult;

  const halfDivisor = divisorVal / 2n;

  while (true) {
    const intermediateDifference = previousIterationValue - divisorVal;
    currentIterationValue = getBigIntAbsolute(intermediateDifference);

    console.log(`${previousIterationValue}\n${currentIterationValue}`);

    if (currentIterationValue === divisorVal) {
      finalResult = 0;
      break;
    }

    if (currentIterationValue < divisorVal) {
      if (currentIterationValue < halfDivisor) {
        finalResult = currentIterationValue;
        break;
      }
    }
    previousIterationValue = currentIterationValue;
  }

  console.log(Number(finalResult));
};

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
