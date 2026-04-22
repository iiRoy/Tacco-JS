function calculateNetValue(dataInput) {
  const allLines = dataInput.split('\n');
  const firstCollection = allLines[1].split(' ').map(Number);
  const secondCollection = allLines[2].split(' ').map(Number);

  function sumPositiveDifferences(index, currentTotal) {
    if (index >= firstCollection.length) {
      return currentTotal;
    }

    const valA = firstCollection[index];
    const valB = secondCollection[index];
    const differential = valA - valB;

    const updatedTotal = currentTotal + (differential > 0 ? differential : 0);

    return sumPositiveDifferences(index + 1, updatedTotal);
  }

  const finalOutcome = sumPositiveDifferences(0, 0);
  console.log(finalOutcome);
}

calculateNetValue(require('fs').readFileSync('/dev/stdin', 'utf8'));