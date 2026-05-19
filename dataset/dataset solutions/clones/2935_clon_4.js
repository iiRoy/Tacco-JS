function Main(programInput) {
  const inputLines = programInput.split('\n');

  const [totalCount, segmentCount] = inputLines[0].split(' ').map(Number);

  const segmentRanges = inputLines.slice(1, segmentCount + 1).map(lineContent => {
    const [leftBoundary, rightBoundary] = lineContent.split(' ').map(Number);
    return { start: leftBoundary, end: rightBoundary };
  });

  const aggregateExtremes = segmentRanges.reduce((accumulator, currentSegment) => {
    return {
      maxStart: Math.max(accumulator.maxStart, currentSegment.start),
      minEnd: Math.min(accumulator.minEnd, currentSegment.end)
    };
  }, { maxStart: segmentRanges[0].start, minEnd: segmentRanges[0].end });

  const overallMaxStart = aggregateExtremes.maxStart;
  const overallMinEnd = aggregateExtremes.minEnd;

  const intersectionLength = Math.max(0, overallMinEnd - overallMaxStart + 1);

  console.log(intersectionLength);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
