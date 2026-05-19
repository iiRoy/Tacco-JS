process.stdin.resume();
process.stdin.setEncoding('utf8');

function checkSubsequenceMatch(boardStringContent, targetCharactersArray) {
  let lastFoundRelativeIndex = 0;
  const targetSequenceLength = targetCharactersArray.length;

  for (let charIterator = 0; charIterator < targetSequenceLength; charIterator++) {
    const characterToLocate = targetCharactersArray[charIterator];
    
    const currentSearchSegment = boardStringContent.substring(lastFoundRelativeIndex);
    const foundIndexInSegment = currentSearchSegment.indexOf(characterToLocate);

    if (foundIndexInSegment === -1) {
      return false;
    }
    
    lastFoundRelativeIndex = foundIndexInSegment;
  }
  return true;
}

process.stdin.on('data', function(inputBuffer) {
  const NEWLINE_DELIMITER = '\n';
  const inputLines = inputBuffer.split(NEWLINE_DELIMITER);

  const totalBoardsToEvaluate = Number(inputLines[0]);
  const targetSequenceString = inputLines[1];
  const targetSequenceCharacters = targetSequenceString.split('');

  let successfulBoardMatches = 0;

  for (let boardEntryIndex = 2; boardEntryIndex <= totalBoardsToEvaluate; boardEntryIndex++) {
    const currentBoardContent = inputLines[boardEntryIndex];
    
    const isCurrentBoardMatching = checkSubsequenceMatch(currentBoardContent, targetSequenceCharacters);

    if (isCurrentBoardMatching) {
      successfulBoardMatches++;
    }
  }

  console.log(successfulBoardMatches);
});
