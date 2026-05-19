const assert = require('assert');
const fileSystem = require('fs');

const applicationConfig = {
  inputSource: '/dev/stdin',
  lineDelimiter: '\n'
};

function parseInitialDimensions(lineContent) {
  return lineContent.split(' ').map(Number);
}

function readAndProcessInput(config) {
  const rawInput = fileSystem.readFileSync(config.inputSource, 'ascii');
  const allInputLines = rawInput.split(config.lineDelimiter);

  let currentLineIndex = 0;

  const [gridHeight, gridWidth] = parseInitialDimensions(allInputLines[currentLineIndex++]);
  const mainGridData = allInputLines.slice(currentLineIndex, currentLineIndex + gridHeight);
  currentLineIndex += gridHeight;

  const [patternHeight, patternWidth] = parseInitialDimensions(allInputLines[currentLineIndex++]);
  const searchPatternData = allInputLines.slice(currentLineIndex, currentLineIndex + patternHeight);

  return { gridHeight, gridWidth, mainGridData, patternHeight, patternWidth, searchPatternData };
}

const BIT_SEGMENT_SIZE = 31;

function parseReversedBinary(binaryString) {
  return parseInt(binaryString.split('').reverse().join(''), 2);
}

function createBinarySegment(inputString) {
  const segmentArray = [];
  for (let charIndex = 0; charIndex < inputString.length; charIndex += BIT_SEGMENT_SIZE) {
    segmentArray.push(inputString.substring(charIndex, charIndex + BIT_SEGMENT_SIZE));
  }
  const processedSegments = segmentArray.map(parseReversedBinary);
  return { length: inputString.length, offset: 0, body: processedSegments };
}

function isPrefixMatch(longSegment, shortSegment) {
  assert(longSegment.length >= shortSegment.length, "Long segment must be longer or equal in length.");

  let longLen = longSegment.length;
  let shortLen = shortSegment.length;
  let longOffset = longSegment.offset;
  let shortOffset = shortSegment.offset;
  const longBody = longSegment.body;
  const shortBody = shortSegment.body;

  while (shortLen > BIT_SEGMENT_SIZE) {
    if (shortBody[shortOffset] !== longBody[longOffset]) {
      return false;
    }
    shortOffset++;
    longOffset++;
    shortLen -= BIT_SEGMENT_SIZE;
    longLen -= BIT_SEGMENT_SIZE;
  }

  const powerOfTwo = Math.pow(2, shortLen);
  return (longBody[longOffset] % powerOfTwo) === shortBody[shortOffset];
}

function advanceSegmentOffset(targetSegment) {
  targetSegment.length -= BIT_SEGMENT_SIZE;
  targetSegment.offset++;
  return targetSegment.length > 0 ? targetSegment : null;
}

function generateSegmentSeries(inputString) {
  const seriesResult = Array.from({ length: BIT_SEGMENT_SIZE }, () => null);

  for (let i = 0; i < BIT_SEGMENT_SIZE && i < inputString.length; i++) {
    seriesResult[i] = createBinarySegment(inputString.slice(i));
  }
  return seriesResult;
}

function replicateSegmentSeries(destinationSeries, sourceSeries) {
  for (const index in sourceSeries) {
    if (!Object.prototype.hasOwnProperty.call(sourceSeries, index)) continue;

    const sourceItem = sourceSeries[index];
    if (!sourceItem) {
      destinationSeries[index] = null;
      continue;
    }

    if (!destinationSeries[index]) {
      destinationSeries[index] = { ...sourceItem };
    } else {
      Object.assign(destinationSeries[index], sourceItem);
    }
  }
}

const tempSegmentSeriesBuffer = new Array(BIT_SEGMENT_SIZE).fill(null);

function findSegmentMatches(segmentSeries, singleSegment) {
  const currentSeries = tempSegmentSeriesBuffer;
  replicateSegmentSeries(currentSeries, segmentSeries);

  const matchResults = [];
  let seriesIndex = 0;

  while (currentSeries[seriesIndex] && currentSeries[seriesIndex].length >= singleSegment.length) {
    matchResults.push(isPrefixMatch(currentSeries[seriesIndex], singleSegment));
    currentSeries[seriesIndex] = advanceSegmentOffset(currentSeries[seriesIndex]);
    seriesIndex = (seriesIndex + 1) % BIT_SEGMENT_SIZE;
  }
  return matchResults;
}

const { gridHeight, gridWidth, mainGridData, patternHeight, patternWidth, searchPatternData } = readAndProcessInput(applicationConfig);

if (gridHeight < patternHeight || gridWidth < patternWidth) {
  process.exit(0);
}

const processedMainGrid = mainGridData.map(generateSegmentSeries);
const processedSearchPattern = searchPatternData.map(createBinarySegment);

const matchCountsMatrix = Array(gridHeight - patternHeight + 1).fill(0).map(() =>
  Array(gridWidth - patternWidth + 1).fill(0)
);

for (let gridRowIndex = 0; gridRowIndex < gridHeight; gridRowIndex++) {
  const minPatternRowIndex = Math.max(0, gridRowIndex - (gridHeight - patternHeight));
  const maxPatternRowIndex = Math.min(patternHeight - 1, gridRowIndex);

  for (let patternRowIndex = minPatternRowIndex; patternRowIndex <= maxPatternRowIndex; patternRowIndex++) {
    const currentMatches = findSegmentMatches(processedMainGrid[gridRowIndex], processedSearchPattern[patternRowIndex]);

    for (let matchOffsetIndex = 0; matchOffsetIndex < currentMatches.length; matchOffsetIndex++) {
      if (currentMatches[matchOffsetIndex]) {
        const resultMatrixRow = gridRowIndex - patternRowIndex;
        const resultMatrixCol = matchOffsetIndex;

        if (resultMatrixRow >= 0 && resultMatrixRow < matchCountsMatrix.length &&
            resultMatrixCol >= 0 && resultMatrixCol < matchCountsMatrix[0].length) {
          matchCountsMatrix[resultMatrixRow][resultMatrixCol]++;
        }
      }
    }
  }
}

for (let resultRow = 0; resultRow < matchCountsMatrix.length; resultRow++) {
  for (let resultCol = 0; resultCol < matchCountsMatrix[resultRow].length; resultCol++) {
    if (matchCountsMatrix[resultRow][resultCol] === patternHeight) {
      console.log('%s %s', resultRow, resultCol);
    }
  }
}
