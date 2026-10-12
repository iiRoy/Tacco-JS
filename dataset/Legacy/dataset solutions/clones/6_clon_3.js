(function processInputData(rawData) {
  const trimmedInputContent = rawData.trim();

  const dataLines = trimmedInputContent.split('\n');

  const numberOfElementsToDisplay = 3;

  const numericalDescendingComparator = (valA, valB) => {
    const numA = Number(valA);
    const numB = Number(valB);
    return numB - numA;
  };

  const numericallySortedLines = dataLines.sort(numericalDescendingComparator);

  const topNLines = numericallySortedLines.slice(0, numberOfElementsToDisplay);

  topNLines.forEach(currentOutputValue => {
    console.log(currentOutputValue);
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
