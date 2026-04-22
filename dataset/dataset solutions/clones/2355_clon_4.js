const largePrime = 1000000007;

const performCalculation = (inputBlob) => {
  const lineSegments = inputBlob.trim().split('\n');
  const totalNumbers = Number(lineSegments[0]);
  const numericList = lineSegments[1].split(' ').map(Number);

  const aggregateResult = numericList.flatMap((firstValue, firstIndex) => {
    return numericList.slice(firstIndex + 1).map(secondValue => {
      return firstValue ^ (secondValue % largePrime);
    });
  }).reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  console.log(aggregateResult);
};

performCalculation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));