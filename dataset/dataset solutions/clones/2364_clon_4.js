function processInputData(sourceContent) {
  const lineSegments = sourceContent.split(/\r\n|\r|\n/);

  const relevantLine = lineSegments.reduce((currentResult, currentSegment, segmentIndex) => {
    return segmentIndex === 1 ? currentSegment : currentResult;
  }, '');

  const numericTokens = relevantLine.match(/\d+/g);

  const targetNumericValue = Number(numericTokens[1]);

  console.log(targetNumericValue === 1 ? 1 : 0);
}
