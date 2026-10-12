function processInput(rawData) {
  const parsedLines = rawData.split('\n');
  const stringLengthLimit = Number(parsedLines[0]);
  const sourceSequence = parsedLines[1];

  const processedSegment = sourceSequence.substring(0, stringLengthLimit);

  const finalTally = [...processedSegment].reduce((accumulator, currentSymbol) => {
    const { blockCount, lastSeenSymbol } = accumulator;
    const updatedBlockCount = (lastSeenSymbol !== currentSymbol) ? blockCount + 1 : blockCount;
    return {
      blockCount: updatedBlockCount,
      lastSeenSymbol: currentSymbol,
    };
  }, { blockCount: 0, lastSeenSymbol: '' });

  console.log(finalTally.blockCount + 1);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
