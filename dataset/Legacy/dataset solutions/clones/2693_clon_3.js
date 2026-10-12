const analyzeSequence = (rawInputString) => {
  const trimmedInput = rawInputString.trim();
  const inputLines = trimmedInput.split('\n');

  const parseNumericValue = (strValue) => {
    return parseInt(strValue, 10);
  };

  const arrayLength = parseNumericValue(inputLines[0]);

  const parseSpaceSeparatedNumbers = (lineContent) => {
    return lineContent.split(' ').map(parseNumericValue);
  };

  const initialSequence = parseSpaceSeparatedNumbers(inputLines[1]);

  const numericComparator = (firstElement, secondElement) => {
    return firstElement - secondElement;
  };

  const sortedReference = initialSequence.slice().sort(numericComparator);

  let discrepancyCount = 0;
  for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
    const isElementMismatch = initialSequence[currentIndex] !== sortedReference[currentIndex];
    if (isElementMismatch) {
      discrepancyCount++;
    }
  }

  const isPermutationCandidate = (discrepancyCount === 2 || discrepancyCount === 0);

  if (isPermutationCandidate) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
