function processInputData(rawInputString) {
  const inputLines = rawInputString.split('\n');
  const firstLineContent = inputLines[0];
  const numericStringLines = inputLines.slice(1);

  const prepareNumericData = (lines) => {
    const parseNumber = (strNum) => parseFloat(strNum);
    const numericSortComparator = (numA, numB) => numA - numB;
    return lines.map(parseNumber).sort(numericSortComparator);
  };

  const processedNumbers = prepareNumericData(numericStringLines);

  let collectedMultiples = [];

  const isProductAnInteger = (val1, val2) => {
    const productResult = val1 * val2;
    return productResult % 1 === 0;
  };

  for (let i = 0; i < processedNumbers.length; i++) {
    const baseNumber = processedNumbers[i];
    const remainingNumbers = processedNumbers.slice(i + 1);

    for (const candidateNumber of remainingNumbers) {
      if (isProductAnInteger(baseNumber, candidateNumber)) {
        collectedMultiples.push(candidateNumber);
      }
    }
  }

  console.log(collectedMultiples.length);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
