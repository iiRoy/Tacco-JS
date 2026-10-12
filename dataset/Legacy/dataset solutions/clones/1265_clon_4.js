const constructRowDesign = (dimensionValue, startsWithPrimaryCharacter) =>
  Array.from({ length: dimensionValue }, (_, charIndex) =>
    (charIndex % 2 === 0
      ? (startsWithPrimaryCharacter ? '#' : '.')
      : (startsWithPrimaryCharacter ? '.' : '#'))
  ).join('');

const processInputCollection = (
  remainingInputLines,
  continueExecutionFlag = true
) => {
  if (remainingInputLines.length === 0) {
    return;
  }

  const [currentStringSegment, ...restOfSegments] = remainingInputLines;

  if (!continueExecutionFlag) {
    processInputCollection(restOfSegments, false);
    return;
  }

  if (currentStringSegment === '0 0') {
    processInputCollection(restOfSegments, false);
    return;
  }

  const parsedDimensions = currentStringSegment.split(' ').map(Number);
  const [verticalExtent, horizontalExtent] = parsedDimensions;

  const firstPattern = constructRowDesign(horizontalExtent, true);
  const secondPattern = constructRowDesign(horizontalExtent, false);

  Array.from({ length: verticalExtent }, (_, rowIndex) =>
    (rowIndex % 2 === 0 ? firstPattern : secondPattern)
  ).forEach(outputLine => console.log(outputLine));

  console.log('');

  processInputCollection(restOfSegments, true);
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'ascii');
const allInputSegments = rawInputContent.split('\n');

processInputCollection(allInputSegments);