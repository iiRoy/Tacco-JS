const fileSystem = require("fs");

const calculateMinimalMaxSegment = (rawInputContent) => {
  const primarySequence = rawInputContent.split('\n')[0];
  const sequenceLength = primarySequence.length;

  if (sequenceLength <= 1) {
    return sequenceLength;
  }

  const potentialSplitPoints = Array.from({ length: sequenceLength - 1 }, (_, index) => index + 1);

  const validSplitPositions = potentialSplitPoints.filter((position) => {
    return primarySequence[position] !== primarySequence[position - 1];
  });

  const maxSegmentLengths = validSplitPositions.map((position) => {
    const leftSegmentLength = position;
    const rightSegmentLength = sequenceLength - position;
    return Math.max(leftSegmentLength, rightSegmentLength);
  });

  if (maxSegmentLengths.length === 0) {
    return sequenceLength;
  }

  return Math.min(...maxSegmentLengths);
};

const standardInputContent = fileSystem.readFileSync("/dev/stdin", "UTF-8");

console.log(calculateMinimalMaxSegment(standardInputContent));
