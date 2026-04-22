const processInput = (sourceText) => {
  const textLength = sourceText.length;
  const targetDivisor = 2019;

  const allSubstrings = Array.from({ length: textLength }, (_, startPos) =>
    Array.from({ length: textLength - startPos }, (_, lenOffset) => {
      const endPos = startPos + lenOffset + 1;
      return sourceText.substring(startPos, endPos);
    })
  ).flat();

  const qualifyingNumbers = allSubstrings
    .map(portion => Number(portion))
    .filter(numericValue => numericValue % targetDivisor === 0);

  return qualifyingNumbers.length;
};

const initiateProcessing = (dataSource) => {
  const finalTally = processInput(dataSource);
  console.log(finalTally);
};

initiateProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));