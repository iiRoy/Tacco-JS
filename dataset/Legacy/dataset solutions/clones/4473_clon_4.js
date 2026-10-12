const computeSumOfLargest = (sourceData) => {
  const [firstDataRow, secondDataRow] = sourceData.split('\n');

  const [totalCount, selectionLimit] = firstDataRow.split(' ').map(Number);

  const numericalSequence = secondDataRow.split(' ').map(val => +val).sort((valA, valB) => valB - valA);

  const accumulatedSum = numericalSequence.slice(0, selectionLimit).reduce((currentSum, element) => currentSum + element, 0);

  console.log(accumulatedSum);
};

computeSumOfLargest(require('fs').readFileSync('/dev/stdin', 'utf8'));
