const obtainUniqueElements = (sourceCollection) => Array.from(new Set(sourceCollection));

const processInputData = (rawInput) => {
  const [textLine, countLine] = rawInput.split('\n');
  const targetString = textLine;
  const desiredRank = parseInt(countLine, 10);

  const allSubstrings = Array.from({ length: targetString.length }, (_, startIdx) =>
    Array.from({ length: targetString.length - startIdx }, (_, lenIdx) =>
      targetString.substring(startIdx, startIdx + lenIdx + 1)
    )
  ).flat();

  const distinctSubstrings = obtainUniqueElements(allSubstrings);
  distinctSubstrings.sort();

  console.log(distinctSubstrings[desiredRank - 1]);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
