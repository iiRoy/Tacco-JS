process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputChunk) {
  const processInputData = (dataPayload) => {
    const inputLines = dataPayload.split('\n');
    const boardCount = Number(inputLines[0]);
    const searchPattern = inputLines[1];

    const boardCollection = inputLines.slice(2, 2 + boardCount);

    const determinePatternMatch = (targetPattern, currentBoard) => {
      const patternCharacters = Array.from(targetPattern);
      const currentBoardLength = currentBoard.length;
      const patternLength = patternCharacters.length;

      if (patternLength === 0) {
        return false;
      }

      return Array.from({ length: currentBoardLength }, (_, offsetValue) => offsetValue).some(offsetValue => {
        return patternCharacters.every((characterToVerify, characterPosition) => {
          const boardLookupIndex = characterPosition + offsetValue * characterPosition;
          return boardLookupIndex < currentBoardLength && currentBoard[boardLookupIndex] === characterToVerify;
        });
      });
    };

    const totalMatches = boardCollection.filter(boardItem =>
      determinePatternMatch(searchPattern, boardItem)
    ).length;

    console.log(totalMatches);
  };

  processInputData(inputChunk);
});
