function processInputData(rawData) {
  const allInputLines = rawData.split('\n');
  let accumulatedSum = 0;
  let hasMatchBeenFound = false;

  const numberOfDataLines = Number(allInputLines[0]);
  const patternToSearch = allInputLines[allInputLines.length - 1];

  const searchRegex = new RegExp(patternToSearch);

  const extractNumericValue = (lineContent) => {
    const parts = lineContent.split(' ');
    return Number(parts[1]);
  };

  for (let currentLineIndex = 1; currentLineIndex <= numberOfDataLines; currentLineIndex++) {
    const currentLineText = allInputLines[currentLineIndex];

    if (!hasMatchBeenFound) {
      if (searchRegex.test(currentLineText)) {
        hasMatchBeenFound = true;
        continue;
      }
    }

    if (hasMatchBeenFound) {
      const valueToAdd = extractNumericValue(currentLineText);
      accumulatedSum += valueToAdd;
    }
  }

  console.log(accumulatedSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
