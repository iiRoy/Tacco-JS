(function runApplication() {
  const standardInputPath = '/dev/stdin';

  const fileSystemModule = require('fs');

  const readAndParseNumericInput = (filePath, encodingType) => {
    const rawContent = fileSystemModule.readFileSync(filePath, encodingType);
    return Number(rawContent);
  };

  const generateInitialFibonacciMemo = (prefillCount) => {
    const memoArray = [];
    if (prefillCount > 0) {
      memoArray[0] = 1;
    }
    if (prefillCount > 1) {
      memoArray[1] = 1;
    }
    for (let i = 2; i < prefillCount; i++) {
      memoArray[i] = memoArray[i - 1] + memoArray[i - 2];
    }
    return memoArray;
  };

  const fibonacciMemo = generateInitialFibonacciMemo(12);

  const computeFibonacci = function(indexValue) {
    if (fibonacciMemo[indexValue] !== undefined) {
      return fibonacciMemo[indexValue];
    }

    const valMinusOne = computeFibonacci(indexValue - 1);
    const valMinusTwo = computeFibonacci(indexValue - 2);
    const computedValue = valMinusOne + valMinusTwo;

    fibonacciMemo[indexValue] = computedValue;
    return computedValue;
  };

  const targetIndex = readAndParseNumericInput(standardInputPath, 'utf8');

  console.log(computeFibonacci(targetIndex));
})();
