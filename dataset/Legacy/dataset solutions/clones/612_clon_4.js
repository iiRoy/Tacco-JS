function checkWeirdSubsequenceRecursive(targetChars, sourceString, charIdx = 0, sourceSearchStartIdx = 0) {
  if (charIdx >= targetChars.length) {
    return true;
  }

  const charToFind = targetChars[charIdx];
  const currentSourceSlice = sourceString.substring(sourceSearchStartIdx);
  const foundIdxInSlice = currentSourceSlice.indexOf(charToFind);

  if (foundIdxInSlice === -1) {
    return false;
  }

  return checkWeirdSubsequenceRecursive(targetChars, sourceString, charIdx + 1, foundIdxInSlice);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputChunk) {
  const inputLines = inputChunk.split("\n");
  const numBoards = parseInt(inputLines[0], 10);
  const targetName = inputLines[1];
  const targetNameChars = targetName.split('');

  const boardStrings = inputLines.slice(2, numBoards + 2);

  const matchingBoardCount = boardStrings.reduce((accumulator, currentBoardString) => {
    const isMatch = checkWeirdSubsequenceRecursive(targetNameChars, currentBoardString);
    return accumulator + (isMatch ? 1 : 0);
  }, 0);

  console.log(matchingBoardCount);
});
