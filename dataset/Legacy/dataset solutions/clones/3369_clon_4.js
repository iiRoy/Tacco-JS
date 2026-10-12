function processDataStream(sourceText) {
  const allLines = sourceText.split('\n');

  const initialDimensionsParts = allLines[0].split(' ');
  const primaryHeight = Number(initialDimensionsParts[1]);
  const primaryWidth = Number(initialDimensionsParts[2]);

  const matchingCount = allLines.slice(1).reduce((accumulator, currentLine) => {
    const dimensions = currentLine.split(' ');
    const candidateHeight = Number(dimensions[0]);
    const candidateWidth = Number(dimensions[1]);

    if (candidateHeight >= primaryHeight && candidateWidth >= primaryWidth) {
      return accumulator + 1;
    } else {
      return accumulator;
    }
  }, 0);

  console.log(matchingCount);
}

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));
