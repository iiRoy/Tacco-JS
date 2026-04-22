const checkArrangementValidity = (elements) => {
  const arrayLength = elements.length;

  return Array.from({
    length: arrayLength
  }, (_, indexPosition) => indexPosition).every((currentPosition) => {
    const precedingPosition = (currentPosition - 1 + arrayLength) % arrayLength;
    const succeedingPosition = (currentPosition + 1) % arrayLength;

    return elements[currentPosition] === (elements[precedingPosition] ^ elements[succeedingPosition]);
  });
};

const processInputData = (unprocessedText) => {
  const numericalTokens = unprocessedText.match(/\d+/g);

  if (!numericalTokens || numericalTokens.length < 1) {
    return 'No';
  }

  const seriesElements = numericalTokens.slice(1).map(Number);

  const validationResult = checkArrangementValidity(seriesElements);

  return validationResult ? 'Yes' : 'No';
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processInputData(rawInputContent));