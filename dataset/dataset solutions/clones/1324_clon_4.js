let accumulatedData = "";
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (segment) => {
  accumulatedData += segment;
});

process.stdin.on('end', () => {
  const allInputSegments = accumulatedData.split("\n");
  const targetTerm = allInputSegments[0].toLowerCase();

  const finalTally = allInputSegments.slice(1).reduce((accumulator, currentSegment) => {
    if (accumulator.stopProcessing || currentSegment.startsWith("END_OF_TEXT")) {
      return { count: accumulator.count, stopProcessing: true };
    }

    const tokensInSegment = currentSegment.split(/\s+/).filter(Boolean);

    const segmentMatches = tokensInSegment.filter(token =>
      token.toLowerCase() === targetTerm
    ).length;

    return { count: accumulator.count + segmentMatches, stopProcessing: false };
  }, { count: 0, stopProcessing: false });

  console.log(finalTally.count);
});
