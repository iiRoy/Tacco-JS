const processInput = (rawData) => {
  const lines = rawData.split('\n');
  const countParam = Number(lines[0]);
  const numericSequence = lines[1].split(' ').map(Number);

  const sortedSequence = numericSequence.sort((valA, valB) => valA - valB);

  const finalSum = (countParam === 1)
    ? sortedSequence[1]
    : sortedSequence.slice(countParam, 2 * countParam)
                    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  console.log(finalSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
