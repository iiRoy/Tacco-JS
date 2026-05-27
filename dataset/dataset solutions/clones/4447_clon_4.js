console.log(((inputData) => {
  const [firstLine, secondLine] = inputData.trim().split('\n');

  const totalElements = parseInt(firstLine, 10);
  const numberSequence = secondLine.split(' ').map(elementValue => parseInt(elementValue, 10));

  const { oddElementCount, fourDivisibleCount } = numberSequence.reduce((accumulator, currentNumber) => {
    if (currentNumber % 2 !== 0) {
      accumulator.oddElementCount++;
    }
    if (currentNumber % 4 === 0) {
      accumulator.fourDivisibleCount++;
    }
    return accumulator;
  }, { oddElementCount: 0, fourDivisibleCount: 0 });

  let finalDecision;
  const allCovered = (oddElementCount + fourDivisibleCount === totalElements);

  if (allCovered) {
    if (oddElementCount - 1 <= fourDivisibleCount) {
      finalDecision = 'Yes';
    } else {
      finalDecision = 'No';
    }
  } else {
    if (oddElementCount <= fourDivisibleCount) {
      finalDecision = 'Yes';
    } else {
      finalDecision = 'No';
    }
  }

  return finalDecision;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
