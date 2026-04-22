(function(dataSource) {
  const parseInputData = (rawText) => {
    const contentLines = rawText.trim().split('\n');
    const numericalValue = Number.parseInt(contentLines[0], 10);
    const primaryString = contentLines[1];
    const secondaryString = contentLines[2];
    return { size: numericalValue, firstSequence: primaryString, secondSequence: secondaryString };
  };

  const { size: overallLength, firstSequence: stringOne, secondSequence: stringTwo } = parseInputData(dataSource);

  const determineOverlapPosition = (totalLen, mainStr, subStr) => {
    const possibleStartIndices = Array.from({ length: totalLen }, (_, index) => index);

    const foundIndex = possibleStartIndices.findIndex(currentPoint => {
      const sectionFromMain = mainStr.slice(currentPoint);
      const sectionFromSub = subStr.slice(0, totalLen - currentPoint);
      return sectionFromMain.startsWith(sectionFromSub);
    });

    if (foundIndex !== -1) {
      return foundIndex + totalLen;
    } else {
      return totalLen + totalLen;
    }
  };

  console.log(determineOverlapPosition(overallLength, stringOne, stringTwo));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));