const processInputAndSolve = (inputString) => {
  const processedLines = inputString.trim().split('\n');

  const firstLineData = processedLines[0].split(' ').map(valueString => Number.parseInt(valueString, 10));
  const numElements = firstLineData[0];

  const numberSequence = processedLines[1].split(' ').map(valueString => Number.parseInt(valueString, 10));

  let oddNumberCount = 0;
  let divisibleByFourCount = 0;

  for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    const currentElement = numberSequence[elementIndex];

    const isOdd = (currentElement % 2 !== 0);
    if (isOdd) {
      oddNumberCount++;
    }

    const isDivisibleByFour = (currentElement % 4 === 0);
    if (isDivisibleByFour) {
      divisibleByFourCount++;
    }
  }

  const totalSpecialCount = oddNumberCount + divisibleByFourCount;
  const isAllElementsSpecial = (totalSpecialCount === numElements);

  let effectiveOddCount = oddNumberCount;
  if (isAllElementsSpecial) {
    effectiveOddCount--;
  }

  const finalConditionResult = (effectiveOddCount <= divisibleByFourCount);

  if (finalConditionResult) {
    return 'Yes';
  } else {
    return 'No';
  }
};

console.log(processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8')));
