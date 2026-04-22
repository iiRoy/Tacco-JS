const processAndEvaluate = (dataStream) => {
  const allInputRows = dataStream.trim().split('\n');

  const primaryCollection = new Set(allInputRows[1].split(' ').map(Number));

  const secondaryElements = allInputRows[3].split(' ').map(Number);

  const checkPresenceInSet = (valueToFind) => {
    return primaryCollection.has(valueToFind) ? 1 : 0;
  };

  const totalOccurrences = secondaryElements.reduce((accumulator, currentElement) => {
    return accumulator + checkPresenceInSet(currentElement);
  }, 0);

  return totalOccurrences;
};

((sourceReader) => {
  const resultValue = processAndEvaluate(sourceReader);
  console.log(resultValue);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));