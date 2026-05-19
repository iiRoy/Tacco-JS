console.log((inputStr => {
  const inputLines = inputStr.trim().split('\n');
  const numElementsStr = inputLines[0].split(' ')[0];
  const numElements = parseInt(numElementsStr, 10);

  const rawDataValues = inputLines[1].split(' ');
  const dataArray = rawDataValues.map(valStr => parseInt(valStr, 10));

  dataArray.sort((a, b) => a - b);

  const highestValue = dataArray[numElements - 1];
  const exclusionMap = Array(highestValue + 1).fill(false);
  let finalCount = 0;

  for (let currentIdx = 0; currentIdx < numElements; currentIdx++) {
    const elementValue = dataArray[currentIdx];

    if (exclusionMap[elementValue]) {
      continue;
    }

    for (let multipleCandidate = elementValue; multipleCandidate <= highestValue; multipleCandidate += elementValue) {
      exclusionMap[multipleCandidate] = true;
    }

    const isLastOccurrenceOfValue = (currentIdx === numElements - 1) || (elementValue !== dataArray[currentIdx + 1]);

    if (isLastOccurrenceOfValue) {
      finalCount++;
    }
  }
  return `${finalCount}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
