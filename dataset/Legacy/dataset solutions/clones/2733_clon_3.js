function processInputData(rawData) {
  const processedLines = rawData.split("\n").filter((lineContent, lineIndex) => lineIndex !== 0 && lineContent !== "");

  for (let iterationIndex = 0; iterationIndex < processedLines.length; iterationIndex++) {
    const elementsToFindMaxFrom = [];
    for (let currentSourceIndex = 0; currentSourceIndex < processedLines.length; currentSourceIndex++) {
      if (currentSourceIndex !== iterationIndex) {
        elementsToFindMaxFrom.push(processedLines[currentSourceIndex]);
      }
    }

    let currentMaximumValue;

    if (elementsToFindMaxFrom.length === 0) {
      throw new TypeError("Cannot reduce empty array without an initial value.");
    } else {
      currentMaximumValue = Number(elementsToFindMaxFrom[0]);

      for (let j = 1; j < elementsToFindMaxFrom.length; j++) {
        const numericValue = Number(elementsToFindMaxFrom[j]);
        if (numericValue > currentMaximumValue) {
          currentMaximumValue = numericValue;
        }
      }
    }
    console.log(currentMaximumValue);
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
