const getArithmeticSeriesSum = (firstTerm, lastTerm, numberOfTerms) => {
  if (numberOfTerms <= 0) {
    return 0;
  }
  const sumValue = (firstTerm + lastTerm) * numberOfTerms / 2;
  return sumValue;
};

const processInput = (rawData) => {
  const moduloConstant = 1000000007;
  
  const inputParts = rawData.trim().split(' ');
  const limitN = Number(inputParts[0]);
  const startK = Number(inputParts[1]);

  let accumulatedResult = 0;

  for (let currentIterationValue = startK; currentIterationValue <= limitN + 1; currentIterationValue++) {
    const termsCount = currentIterationValue;
    const previousValue = currentIterationValue - 1;

    const sumOfSmallRange = getArithmeticSeriesSum(1, previousValue, previousValue);

    const firstTermForBigSum = limitN - currentIterationValue + 1;

    const sumOfBigRange = getArithmeticSeriesSum(firstTermForBigSum, limitN, termsCount);

    accumulatedResult += sumOfBigRange - sumOfSmallRange + 1;
  }

  const finalResult = (accumulatedResult % moduloConstant + moduloConstant) % moduloConstant;
  
  console.log(finalResult);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
