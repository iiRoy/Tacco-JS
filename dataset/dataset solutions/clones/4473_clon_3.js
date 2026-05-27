function processInputData(rawData) {
  const NEWLINE_DELIMITER = '\n';
  const SPACE_DELIMITER = ' ';
  const RADIX_DECIMAL = 10;

  const parseInteger = (strValue) => {
    return parseInt(strValue, RADIX_DECIMAL);
  };

  const inputLines = rawData.split(NEWLINE_DELIMITER);

  const firstLineParts = inputLines[0].split(SPACE_DELIMITER);
  const countN = parseInteger(firstLineParts[0]);
  const limitK = parseInteger(firstLineParts[1]);

  const rawNumberStrings = inputLines[1].split(SPACE_DELIMITER);
  const parsedNumberValues = rawNumberStrings.map(parseInteger);
  
  const descendingSortComparator = (valA, valB) => {
    const comparisonResult = valB - valA;
    return comparisonResult;
  };
  const sortedNumbers = parsedNumberValues.sort(descendingSortComparator);

  const sumTopKElements = (arr, k) => {
    let currentSum = 0;
    for (let idx = 0; idx < k; idx++) {
      const elementToAdd = arr[idx];
      currentSum += elementToAdd;
    }
    return currentSum;
  };

  const totalSum = sumTopKElements(sortedNumbers, limitK);
  
  console.log(totalSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
