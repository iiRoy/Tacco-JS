const main = (inputData) => {
  const initialNumericValue = BigInt(inputData.trim());
  const characterMap = Object.freeze({
    0: 'z', 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h', 9: 'i',
    10: 'j', 11: 'k', 12: 'l', 13: 'm', 14: 'n', 15: 'o', 16: 'p', 17: 'q', 18: 'r',
    19: 's', 20: 't', 21: 'u', 22: 'v', 23: 'w', 24: 'x', 25: 'y'
  });

  function* generateConversionSequence(currentValue) {
    let workingValue = currentValue;
    while (workingValue !== 0n) {
      const remainderComponent = workingValue % 26n;
      const nextIterationValue = workingValue === 26n ? 0n : workingValue / 26n;
      yield { digitIndex: Number(remainderComponent), subsequentValue: nextIterationValue };
      workingValue = nextIterationValue;
    }
  }

  const conversionSteps = [...generateConversionSequence(initialNumericValue)];

  const finalOutputString = conversionSteps
    .map(step => characterMap[step.digitIndex])
    .reverse()
    .join('');

  console.log(finalOutputString);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))
  : main(require('fs').readFileSync('/dev/stdin', 'utf8'));
