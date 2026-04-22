const processInformation = (rawText) => {
  const dataTokens = rawText.split(' ');

  dataTokens
    .map((valueUnit, zeroBasedIndex) => ({
      unitValue: valueUnit,
      displayPosition: zeroBasedIndex + 1
    }))
    .filter(itemRecord => itemRecord.unitValue === '0')
    .forEach(resultEntry => console.log(resultEntry.displayPosition));
};

processInformation(require('fs').readFileSync('/dev/stdin', 'utf8'));