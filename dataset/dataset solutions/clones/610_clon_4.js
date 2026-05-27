process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
  const allInputLines = inputChunk.split('\n');
  const boardQuantity = Number(allInputLines[0]);
  const soughtPattern = allInputLines[1];

  const boardSourceLines = allInputLines.slice(2, 2 + boardQuantity);

  const successfulMatchCount = boardSourceLines.reduce((currentTally, currentBoardString) => {
    if (!currentBoardString.trim()) {
      return currentTally;
    }

    const patternLength = soughtPattern.length;
    const finalPatternCharIndex = patternLength - 1;

    if (patternLength === 0) {
      return currentTally;
    }

    const boardStringLength = currentBoardString.length;

    const patternFound = Array.from({ length: boardStringLength }, (_, offsetValue) => offsetValue)
      .some((currentOffset) => {
        const boardTargetIndex = finalPatternCharIndex + currentOffset * finalPatternCharIndex;

        return boardTargetIndex < boardStringLength &&
               currentBoardString.charAt(boardTargetIndex) === soughtPattern.charAt(finalPatternCharIndex);
      });

    return currentTally + (patternFound ? 1 : 0);
  }, 0);

  console.log(successfulMatchCount);
});
