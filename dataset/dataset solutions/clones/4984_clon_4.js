const extractNumericValue = (strSegment) => Number(strSegment);

const sumStringDigits = (str) =>
  Array.from(str).reduce((acc, char) => acc + extractNumericValue(char), 0);

function computeSegmentContributions(sourceText, startOffset, initialSumForSegments) {
  const maxSubsegmentLength = sourceText.length - startOffset - 1;

  if (maxSubsegmentLength <= 0) {
    return 0;
  }

  const segmentTotal = Array.from({ length: maxSubsegmentLength }, (_, index) => index + 1)
    .reduce((acc, currentSubsegmentLength) => {
      const firstPart = extractNumericValue(sourceText.substring(startOffset, startOffset + currentSubsegmentLength));
      const secondPart = extractNumericValue(sourceText.substring(currentSubsegmentLength + startOffset));
      return acc + initialSumForSegments + firstPart + secondPart;
    }, 0);

  return segmentTotal;
}

function processInputString(sourceText) {
  let overallAccumulator = extractNumericValue(sourceText);

  const contributions = Array.from({ length: sourceText.length }, (_, segmentStartOffset) => {
    const leadingDigitsSum = sumStringDigits(sourceText.slice(0, segmentStartOffset));
    return computeSegmentContributions(sourceText, segmentStartOffset, leadingDigitsSum);
  });

  overallAccumulator += contributions.reduce((acc, val) => acc + val, 0);

  console.log(overallAccumulator);
}

processInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));
