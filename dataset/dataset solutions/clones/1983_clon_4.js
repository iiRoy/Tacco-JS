const processInput = (dataString) => {
  const upperLimit = Number(dataString.trim());

  const computeArithmeticSum = (factor, limit) => {
    const termCount = Math.floor(limit / factor);
    return factor * (termCount * (termCount + 1) / 2);
  };

  const sumAllNumbers = computeArithmeticSum(1, upperLimit);
  const sumMultiplesOfThree = computeArithmeticSum(3, upperLimit);
  const sumMultiplesOfFive = computeArithmeticSum(5, upperLimit);
  const sumMultiplesOfFifteen = computeArithmeticSum(15, upperLimit);

  const finalAccumulation = sumAllNumbers - sumMultiplesOfThree - sumMultiplesOfFive + sumMultiplesOfFifteen;

  return console.log(finalAccumulation);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
